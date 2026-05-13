import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const kind = url.searchParams.get('kind');
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? 60)));

  let q = supa
    .from('media_assets')
    .select('id, kind, provider, provider_model, public_url, prompt, duration_ms, width, height, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (kind && ['audio', 'image', 'video'].includes(kind)) q = q.eq('kind', kind);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assets: data });
}
