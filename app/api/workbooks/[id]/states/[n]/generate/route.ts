import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { callOpenAI, estimateCostUsd } from '@/lib/openai';
import { STATES } from '@/lib/prompts';
import { checkTierLimit, getProfile } from '@/lib/auth';
import type { PromptCtx } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 90; // long-form scripts can take a while

const Schema = z.object({
  input: z.string().default(''),
  // state 2 only
  transcripts: z.array(z.string()).optional(),
  // state 4 only
  duration: z.string().optional(),
  // state 5 only
  generateVideo: z.boolean().optional(),
});

export async function POST(request: Request, { params }: { params: { id: string; n: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stateN = parseInt(params.n, 10);
  if (!stateN || stateN < 1 || stateN > 9) return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  const def = STATES.find((s) => s.n === stateN);
  if (!def) return NextResponse.json({ error: 'Invalid state' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  // Verify ownership and load workbook + all prior state outputs
  const { data: wb } = await supabase
    .from('workbooks')
    .select('id, niche, idea_title, idea_description, idea_score')
    .eq('id', params.id)
    .eq('user_id', auth.user.id)
    .single();
  if (!wb) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: states } = await supabase
    .from('workbook_states')
    .select('state_n, output')
    .eq('workbook_id', params.id);
  const prev: Record<number, string> = {};
  for (const s of states || []) prev[s.state_n] = s.output || '';

  // Load images for vision-enabled states
  let images: string[] = [];
  let styleImagesCount = 0;
  let thumbnailImagesCount = 0;

  if (def.useVision) {
    const kinds = stateN === 2 ? ['style', 'thumbnail'] : stateN === 5 ? ['style'] : stateN === 7 ? ['thumbnail'] : [];
    if (kinds.length) {
      const { data: imgs } = await supabase
        .from('workbook_images')
        .select('storage_path, kind')
        .eq('workbook_id', params.id)
        .eq('state_n', 2)
        .in('kind', kinds)
        .order('ord');
      const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workbook-images/`;
      images = (imgs || []).map((i) => baseUrl + i.storage_path);
      styleImagesCount = (imgs || []).filter((i) => i.kind === 'style').length;
      thumbnailImagesCount = (imgs || []).filter((i) => i.kind === 'thumbnail').length;
    }
  }

  // Tier checks
  const profile = await getProfile();
  if (stateN === 4 && parsed.data.duration) {
    const durMin = parseInt(parsed.data.duration, 10) || 10;
    const limit = checkTierLimit(profile?.tier ?? 'free', 'longScript', { durationMin: durMin }, { adminEmail: profile?.email });
    if (!limit.ok) return NextResponse.json({ error: limit.reason, code: 'tier_limit' }, { status: 402 });
  }
  if (stateN === 5 && parsed.data.generateVideo) {
    const limit = checkTierLimit(profile?.tier ?? 'free', 'videoPrompts', {}, { adminEmail: profile?.email });
    if (!limit.ok) return NextResponse.json({ error: limit.reason, code: 'tier_limit' }, { status: 402 });
  }

  const ctx: PromptCtx = {
    niche: wb.niche || '',
    ideaTitle: wb.idea_title,
    ideaDescription: wb.idea_description || '',
    input: parsed.data.input,
    prev,
    transcripts: parsed.data.transcripts,
    styleImagesCount,
    thumbnailImagesCount,
    duration: parsed.data.duration,
    generateVideo: parsed.data.generateVideo,
  };

  const prompt = def.buildPrompt(ctx);
  const maxTokens = def.maxTokens ?? 2000;

  let result;
  try {
    result = await callOpenAI({ prompt, images, maxTokens });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'OpenAI error' }, { status: 502 });
  }

  // Persist output + metadata
  const meta: Record<string, unknown> = {};
  if (parsed.data.transcripts !== undefined) meta.transcripts = parsed.data.transcripts;
  if (parsed.data.duration !== undefined) meta.duration = parsed.data.duration;
  if (parsed.data.generateVideo !== undefined) meta.generateVideo = parsed.data.generateVideo;

  const { data: existing } = await supabase
    .from('workbook_states')
    .select('metadata')
    .eq('workbook_id', params.id)
    .eq('state_n', stateN)
    .single();

  await supabase
    .from('workbook_states')
    .update({
      input: parsed.data.input,
      output: result.content,
      skipped: false,
      metadata: { ...(existing?.metadata || {}), ...meta },
    })
    .eq('workbook_id', params.id)
    .eq('state_n', stateN);

  await supabase.from('workbooks').update({ updated_at: new Date().toISOString() }).eq('id', params.id);

  // Usage log
  const admin = createServiceRoleClient();
  await admin.from('usage_log').insert({
    user_id: auth.user.id,
    endpoint: `generate_state_${stateN}`,
    state_n: stateN,
    tokens_in: result.tokensIn,
    tokens_out: result.tokensOut,
    cost_usd: estimateCostUsd(result.tokensIn, result.tokensOut),
  });

  return NextResponse.json({ output: result.content });
}
