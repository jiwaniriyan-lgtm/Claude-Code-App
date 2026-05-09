import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, tierFromPriceId } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Bad signature: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  async function setProfileFromSubscription(sub: Stripe.Subscription) {
    const userId = (sub.metadata?.user_id as string) || null;
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    const priceId = sub.items.data[0]?.price.id;
    const tier = tierFromPriceId(priceId);
    const status = sub.status;

    // Locate the profile (prefer user_id from metadata, fall back to customer_id)
    let profileQuery = admin.from('profiles').update({
      tier: status === 'active' || status === 'trialing' ? tier : 'free',
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    });
    if (userId) profileQuery = profileQuery.eq('id', userId);
    else profileQuery = profileQuery.eq('stripe_customer_id', customerId);
    await profileQuery;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await setProfileFromSubscription(sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.trial_will_end':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        if (event.type === 'customer.subscription.deleted') {
          const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
          await admin
            .from('profiles')
            .update({ tier: 'free', stripe_subscription_id: null, current_period_end: null })
            .eq('stripe_customer_id', customerId);
        } else {
          await setProfileFromSubscription(sub);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          await admin.from('profiles').update({ tier: 'free' }).eq('stripe_customer_id', customerId);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[webhook]', event.type, err);
    return NextResponse.json({ error: 'handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
