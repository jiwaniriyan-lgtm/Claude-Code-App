import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(key || 'sk_test_dummy_build_time', {
  // Pinned version. Update intentionally; new versions can change webhook payloads.
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  typescript: true,
});

export function getPriceIdForTier(tier: 'creator' | 'pro' | 'agency'): string | undefined {
  if (tier === 'creator') return process.env.STRIPE_PRICE_CREATOR;
  if (tier === 'pro') return process.env.STRIPE_PRICE_PRO;
  if (tier === 'agency') return process.env.STRIPE_PRICE_AGENCY;
  return undefined;
}

export function tierFromPriceId(priceId: string | null | undefined): 'free' | 'creator' | 'pro' | 'agency' {
  if (!priceId) return 'free';
  if (priceId === process.env.STRIPE_PRICE_CREATOR) return 'creator';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_AGENCY) return 'agency';
  return 'free';
}
