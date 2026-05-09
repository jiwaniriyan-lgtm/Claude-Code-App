import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Multipart upload for State 2 reference images.
 * Body: file=<blob>  kind=style|thumbnail  state_n=<int>
 * Returns the public URL the client can preview, plus the row id.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ownership check
  const { data: wb } = await supabase
    .from('workbooks')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', auth.user.id)
    .single();
  if (!wb) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const form = await request.formData();
  const file = form.get('file');
  const kind = form.get('kind');
  const stateN = Number(form.get('state_n') || 2);

  if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (kind !== 'style' && kind !== 'thumbnail') return NextResponse.json({ error: 'Bad kind' }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 413 });

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${auth.user.id}/${params.id}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buf = await file.arrayBuffer();
  const { error: upErr } = await supabase.storage.from('workbook-images').upload(path, buf, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Determine ord
  const { count } = await supabase
    .from('workbook_images')
    .select('id', { count: 'exact', head: true })
    .eq('workbook_id', params.id)
    .eq('state_n', stateN)
    .eq('kind', kind);

  const { data: row, error } = await supabase
    .from('workbook_images')
    .insert({ workbook_id: params.id, state_n: stateN, kind, storage_path: path, ord: count || 0 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workbook-images/${path}`;
  return NextResponse.json({ image: row, url: publicUrl });
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: wb } = await supabase
    .from('workbooks')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', auth.user.id)
    .single();
  if (!wb) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: images } = await supabase.from('workbook_images').select('*').eq('workbook_id', params.id).order('ord');
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workbook-images/`;
  return NextResponse.json({
    images: (images || []).map((i) => ({ ...i, url: baseUrl + i.storage_path })),
  });
}
