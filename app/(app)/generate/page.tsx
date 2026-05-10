import SetupForm from '@/components/SetupForm';
import { effectiveTier, getProfile, getUsageStats } from '@/lib/auth';
import { PRICING_TIERS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function GeneratePage() {
  const profile = await getProfile();
  const tier = effectiveTier(profile);
  const tierInfo = PRICING_TIERS[tier];
  const usage = profile ? await getUsageStats(profile.id) : null;

  return (
    <>
      <div className="hero" style={{ paddingBottom: 24 }}>
        <div className="badge">{tierInfo.name} plan</div>
        <h1>
          Generate <span className="gradient">Viral Ideas</span>
        </h1>
        <p>
          {usage
            ? `${usage.ideas_this_month} / ${tierInfo.limits.ideasPerMonth} ideas this month · ${usage.workbooks_active} workbook${usage.workbooks_active === 1 ? '' : 's'}`
            : 'AI analyzes top channels, extracts viral patterns, and generates ideas your audience can\'t resist clicking.'}
        </p>
      </div>
      <SetupForm />
    </>
  );
}
