import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const PostSchema = z.object({
  state_n: z.number().int().min(1).max(9).optional(),
  kind: z.enum(['image', 'video', 'thumbnail', 'voice']),
  provider_id: z.string(),
  prompt: z.string(),
  refinement: z.string().optional(),
  reference_image_url: z.string().optional(),
  voice_id: z.string().optional(),
  asset_url: z.string().optional(),
  provider_job_id: z.string().optional(),
  status: z.enum(['pending', 'processing', 'ready', 'error', 'external']).default('ready'),
  error: z.string().optional(),
  kept: z.boolean().optional(),
  meta: z.record(z.unknown()).optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supa
    .from('generated_assets')
    .select('*')
    .eq('workbook_id', params.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assets: data || [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = PostSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsed.error.issues }, { status: 400 });
  }
  const body = parsed.data;

  // When marking a new "kept" asset, demote any previously-kept asset of the same kind.
  if (body.kept) {
    await supa
      .from('generated_assets')
      .update({ kept: false })
      .eq('workbook_id', params.id)
      .eq('kind', body.kind)
      .eq('kept', true);
  }

  const { data, error } = await supa
    .from('generated_assets')
    .insert({
      workbook_id: params.id,
      user_id: auth.user.id,
      state_n: body.state_n ?? null,
      kind: body.kind,
      provider_id: body.provider_id,
      prompt: body.prompt,
      refinement: body.refinement ?? null,
      reference_image_url: body.reference_image_url ?? null,
      voice_id: body.voice_id ?? null,
      asset_url: body.asset_url ?? null,
      provider_job_id: body.provider_job_id ?? null,
      status: body.status,
      error: body.error ?? null,
      kept: body.kept ?? false,
      meta: body.meta ?? {},
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ asset: data });
}
