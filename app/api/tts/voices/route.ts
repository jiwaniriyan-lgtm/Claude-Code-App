import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listElevenLabsVoices } from '@/lib/integrations';

export const runtime = 'nodejs';

export async function GET() {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const voices = await listElevenLabsVoices();
    return NextResponse.json({
      voices: voices.map((v) => ({
        id: v.voice_id,
        name: v.name,
        category: v.category,
        description: v.description,
        labels: v.labels,
        preview_url: v.preview_url,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'voice list failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
