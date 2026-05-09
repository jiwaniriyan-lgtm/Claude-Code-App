import { redirect } from 'next/navigation';
import { getCurrentUser, getProfile, getUsageStats } from '@/lib/auth';
import { PRICING_TIERS } from '@/lib/constants';
import SettingsClient from './settings-client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const profile = await getProfile();
  const usage = await getUsageStats(user.id);
  const tier = profile?.tier ?? 'free';

  return (
    <SettingsClient
      email={user.email || ''}
      tier={tier}
      tierName={PRICING_TIERS[tier].name}
      tierLimits={{
        ideasPerMonth: PRICING_TIERS[tier].limits.ideasPerMonth,
        activeWorkbooks: PRICING_TIERS[tier].limits.activeWorkbooks,
      }}
      usage={usage}
      hasSubscription={!!profile?.stripe_customer_id}
      trialEndsAt={profile?.trial_ends_at ?? null}
      currentPeriodEnd={profile?.current_period_end ?? null}
    />
  );
}
