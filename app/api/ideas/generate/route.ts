import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { callClaude, estimateCostUsd } from '@/lib/anthropic';
import { buildIdeaPrompt } from '@/lib/prompts';
import { checkTierLimit, getProfile, getUsageStats } from '@/lib/auth';
import { MAX_IDEAS } from '@/lib/constants';
import type { Idea } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const Schema = z.object({
  setupData: z.object({
    mode: z.enum(['clone', 'own']),
    channelUrl: z.string().default(''),
    niche: z.string().default(''),
    transcripts: z.array(z.string()).default([]),
    styleImages: z.array(z.string()).default([]),
    thumbnailImages: z.array(z.string()).default([]),
    duration: z.string().default('10'),
    notes: z.string().default(''),
  }),
  count: z.number().int().min(1).max(20).default(MAX_IDEAS),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request', issues: parsed.error.issues }, { status: 400 });

  const profile = await getProfile();
  const usage = await getUsageStats(auth.user.id);
  const limit = checkTierLimit(profile?.tier ?? 'free', 'generateIdea', { ideasThisMonth: usage.ideas_this_month }, { adminEmail: profile?.email });
  if (!limit.ok) return NextResponse.json({ error: limit.reason, code: 'tier_limit' }, { status: 402 });

  const prompt = buildIdeaPrompt(parsed.data.setupData, parsed.data.count);

  let result;
  try {
    result = await callClaude({ prompt, maxTokens: 4000 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Claude error' }, { status: 502 });
  }

  const cleaned = result.content
    .replace(/^```json\s*/, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
  let ideas: Idea[];
  try {
    ideas = JSON.parse(cleaned);
    if (!Array.isArray(ideas)) throw new Error('not an array');
  } catch {
    return NextResponse.json({ error: 'Model returned invalid JSON' }, { status: 502 });
  }

  // Log usage with service role (RLS bypass for inserts)
  const admin = createServiceRoleClient();
  await admin.from('usage_log').insert({
    user_id: auth.user.id,
    endpoint: 'generate_ideas',
    tokens_in: result.tokensIn,
    tokens_out: result.tokensOut,
    cost_usd: estimateCostUsd(result.tokensIn, result.tokensOut),
  });

  return NextResponse.json({ ideas });
}
