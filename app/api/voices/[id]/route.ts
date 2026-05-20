import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteVoice } from '@/lib/elevenlabs';

export const runtime = 'nodejs';

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await deleteVoice(ctx.params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'delete failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
