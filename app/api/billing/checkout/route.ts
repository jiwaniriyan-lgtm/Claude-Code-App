import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { stripe, getPriceIdForTier } from '@/lib/stripe';
import { TRIAL_DAYS } from '@/lib/constants';

const Schema = z.object({
  tier: z.enum(['creator', 'pro', 'agency']),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const priceId = getPriceIdForTier(parsed.data.tier);
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID for ${parsed.data.tier} not configured. Set STRIPE_PRICE_${parsed.data.tier.toUpperCase()} in env.` },
      { status: 500 },
    );
  }

  // Reuse existing customer if present
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', auth.user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || auth.user.email || undefined,
      metadata: { user_id: auth.user.id },
    });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', auth.user.id);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { user_id: auth.user.id, tier: parsed.data.tier },
    },
    allow_promotion_codes: true,
    success_url: `${baseUrl}/settings?checkout=success`,
    cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    metadata: { user_id: auth.user.id, tier: parsed.data.tier },
  });

  return NextResponse.json({ url: session.url });
}
