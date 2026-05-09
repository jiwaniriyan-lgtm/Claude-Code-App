import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: wb, error } = await supabase
    .from('workbooks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', auth.user.id)
    .single();
  if (error || !wb) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: states } = await supabase
    .from('workbook_states')
    .select('*')
    .eq('workbook_id', params.id)
    .order('state_n');
  const { data: images } = await supabase.from('workbook_images').select('*').eq('workbook_id', params.id).order('ord');

  return NextResponse.json({ workbook: { ...wb, states: states || [], images: images || [] } });
}

const PatchSchema = z.object({
  name: z.string().max(200).optional(),
  current_state_idx: z.number().int().min(0).max(8).optional(),
  state: z
    .object({
      n: z.number().int().min(1).max(9),
      input: z.string().optional(),
      output: z.string().optional(),
      skipped: z.boolean().optional(),
      metadata: z.record(z.unknown()).optional(),
    })
    .optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  // Verify ownership before any mutation
  const { data: wb } = await supabase
    .from('workbooks')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', auth.user.id)
    .single();
  if (!wb) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Workbook-level fields
  const wbUpdate: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) wbUpdate.name = parsed.data.name;
  if (parsed.data.current_state_idx !== undefined) wbUpdate.current_state_idx = parsed.data.current_state_idx;
  if (Object.keys(wbUpdate).length) await supabase.from('workbooks').update(wbUpdate).eq('id', params.id);

  // State-level update
  if (parsed.data.state) {
    const s = parsed.data.state;
    const update: Record<string, unknown> = {};
    if (s.input !== undefined) update.input = s.input;
    if (s.output !== undefined) update.output = s.output;
    if (s.skipped !== undefined) update.skipped = s.skipped;
    if (s.metadata !== undefined) {
      // Merge metadata so we don't clobber transcripts when only updating duration
      const { data: existing } = await supabase
        .from('workbook_states')
        .select('metadata')
        .eq('workbook_id', params.id)
        .eq('state_n', s.n)
        .single();
      update.metadata = { ...(existing?.metadata || {}), ...s.metadata };
    }
    await supabase.from('workbook_states').update(update).eq('workbook_id', params.id).eq('state_n', s.n);
    // Bump workbook updated_at
    await supabase.from('workbooks').update({ updated_at: new Date().toISOString() }).eq('id', params.id);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('workbooks').delete().eq('id', params.id).eq('user_id', auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
