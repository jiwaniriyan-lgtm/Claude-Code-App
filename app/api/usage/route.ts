import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { effectiveTier, getProfile, getUsageStats } from '@/lib/auth';
import { PRICING_TIERS } from '@/lib/constants';

export async function GET() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await getProfile();
  const usage = await getUsageStats(auth.user.id);
  const tier = effectiveTier(profile);
  const limits = PRICING_TIERS[tier].limits;

  return NextResponse.json({
    tier,
    profile,
    usage,
    limits,
  });
}
