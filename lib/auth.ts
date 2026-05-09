import { createClient } from './supabase/server';
import type { Profile, UsageStats } from './types';
import type { TierId } from './constants';
import { PRICING_TIERS } from './constants';
import { getMonthStart } from './utils';

export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  return (profile as Profile) || null;
}

export async function getUsageStats(userId: string): Promise<UsageStats> {
  const supabase = createClient();
  const monthStart = getMonthStart().toISOString();

  const [{ data: usage }, { count: wbCount }] = await Promise.all([
    supabase
      .from('usage_log')
      .select('endpoint, tokens_in, tokens_out, cost_usd')
      .eq('user_id', userId)
      .gte('created_at', monthStart),
    supabase.from('workbooks').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  const rows = usage || [];
  const ideas = rows.filter((r) => r.endpoint === 'generate_ideas').length;
  const tokens = rows.reduce((acc, r) => acc + (r.tokens_in || 0) + (r.tokens_out || 0), 0);
  const cost = rows.reduce((acc, r) => acc + Number(r.cost_usd || 0), 0);

  return {
    ideas_this_month: ideas,
    workbooks_active: wbCount || 0,
    tokens_this_month: tokens,
    cost_usd_this_month: cost,
  };
}

/** Effective tier — falls back to free if trial expired without subscription. */
export function effectiveTier(profile: Profile | null): TierId {
  if (!profile) return 'free';
  return profile.tier;
}

/** Check whether action is allowed under the user's current tier. Throws if not. */
export function checkTierLimit(
  tier: TierId,
  action: 'newWorkbook' | 'generateIdea' | 'longScript' | 'videoPrompts' | 'visionImage',
  current: { activeWorkbooks?: number; ideasThisMonth?: number; visionImagesAttached?: number; durationMin?: number },
): { ok: true } | { ok: false; reason: string } {
  const limits = PRICING_TIERS[tier].limits as {
    activeWorkbooks: number;
    ideasPerMonth: number;
    visionImages: number;
    longScripts: boolean;
    videoPrompts: boolean;
  };

  if (action === 'newWorkbook') {
    if (limits.activeWorkbooks !== -1 && (current.activeWorkbooks ?? 0) >= limits.activeWorkbooks) {
      return { ok: false, reason: `Your ${PRICING_TIERS[tier].name} plan allows ${limits.activeWorkbooks} active workbook(s). Upgrade to add more.` };
    }
  }
  if (action === 'generateIdea') {
    if ((current.ideasThisMonth ?? 0) >= limits.ideasPerMonth) {
      return { ok: false, reason: `You've used your ${limits.ideasPerMonth} ideas this month. Upgrade for more.` };
    }
  }
  if (action === 'longScript') {
    if (!limits.longScripts && (current.durationMin ?? 0) > 30) {
      return { ok: false, reason: 'Scripts longer than 30 min require Creator plan or higher.' };
    }
  }
  if (action === 'videoPrompts' && !limits.videoPrompts) {
    return { ok: false, reason: 'Video clip prompts require Pro plan or higher.' };
  }
  if (action === 'visionImage') {
    if (limits.visionImages !== -1 && (current.visionImagesAttached ?? 0) >= limits.visionImages) {
      return { ok: false, reason: `Your plan allows ${limits.visionImages} reference images total. Upgrade for unlimited.` };
    }
  }
  return { ok: true };
}
