import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkTierLimit, getProfile } from '@/lib/auth';

export async function GET() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: workbooks, error } = await supabase
    .from('workbooks')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Hydrate states for each workbook (single round-trip per request)
  const ids = (workbooks || []).map((w) => w.id);
  let statesByWb: Record<string, unknown[]> = {};
  if (ids.length) {
    const { data: states } = await supabase.from('workbook_states').select('*').in('workbook_id', ids);
    for (const s of states || []) {
      const arr = (statesByWb[s.workbook_id] ||= []) as unknown[];
      arr.push(s);
    }
  }

  const enriched = (workbooks || []).map((w) => ({
    ...w,
    states: ((statesByWb[w.id] as { state_n: number }[]) || []).sort((a, b) => a.state_n - b.state_n),
  }));

  return NextResponse.json({ workbooks: enriched });
}

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  niche: z.string().max(120).default(''),
  ideaTitle: z.string().min(1).max(200),
  ideaDescription: z.string().max(500).default(''),
  ideaScore: z.number().int().min(0).max(100).default(85),
  setupMode: z.enum(['clone', 'own']).nullable().default(null),
  // Optional pre-fill for state 1 + state 2 + state 4 from the setup form
  prefill: z
    .object({
      state1Input: z.string().default(''),
      state1Skipped: z.boolean().default(false),
      state2Transcripts: z.array(z.string()).default([]),
      state2StyleImagePaths: z.array(z.string()).default([]),
      state2ThumbImagePaths: z.array(z.string()).default([]),
      state4Duration: z.string().default('10'),
      startAtIdx: z.number().int().min(0).max(8).default(0),
    })
    .optional(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request', issues: parsed.error.issues }, { status: 400 });

  // Tier limit: active workbooks
  const profile = await getProfile();
  const { count: wbCount } = await supabase
    .from('workbooks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.user.id);
  const limit = checkTierLimit(profile?.tier ?? 'free', 'newWorkbook', { activeWorkbooks: wbCount || 0 }, { adminEmail: profile?.email });
  if (!limit.ok) return NextResponse.json({ error: limit.reason, code: 'tier_limit' }, { status: 402 });

  const { data: wb, error: wbErr } = await supabase
    .from('workbooks')
    .insert({
      user_id: auth.user.id,
      name: parsed.data.name,
      niche: parsed.data.niche,
      idea_title: parsed.data.ideaTitle,
      idea_description: parsed.data.ideaDescription,
      idea_score: parsed.data.ideaScore,
      setup_mode: parsed.data.setupMode,
      current_state_idx: parsed.data.prefill?.startAtIdx ?? 0,
    })
    .select()
    .single();

  if (wbErr || !wb) return NextResponse.json({ error: wbErr?.message || 'create failed' }, { status: 500 });

  // Seed all 9 states (mostly empty)
  const stateRows = [];
  for (let n = 1; n <= 9; n++) {
    let input = '';
    let skipped = false;
    const metadata: Record<string, unknown> = {};
    const pre = parsed.data.prefill;
    if (pre) {
      if (n === 1) {
        input = pre.state1Input;
        skipped = pre.state1Skipped;
      }
      if (n === 2) {
        metadata.transcripts = pre.state2Transcripts;
      }
      if (n === 4) {
        metadata.duration = pre.state4Duration;
      }
      if (n === 5) {
        metadata.generateVideo = false;
      }
    } else {
      if (n === 4) metadata.duration = '10';
    }
    stateRows.push({ workbook_id: wb.id, state_n: n, input, skipped, metadata });
  }
  await supabase.from('workbook_states').insert(stateRows);

  // Move pre-uploaded image paths into workbook_images table
  const pre = parsed.data.prefill;
  if (pre) {
    const imgRows = [
      ...pre.state2StyleImagePaths.map((p, i) => ({ workbook_id: wb.id, state_n: 2, kind: 'style', storage_path: p, ord: i })),
      ...pre.state2ThumbImagePaths.map((p, i) => ({ workbook_id: wb.id, state_n: 2, kind: 'thumbnail', storage_path: p, ord: i })),
    ];
    if (imgRows.length) await supabase.from('workbook_images').insert(imgRows);
  }

  return NextResponse.json({ workbook: { ...wb, states: stateRows } });
}
