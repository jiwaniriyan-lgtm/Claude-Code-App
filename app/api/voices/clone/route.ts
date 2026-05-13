import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInstantVoiceClone } from '@/lib/elevenlabs';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Multipart POST:
 *   name:       string (required, 3-60 chars)
 *   description: string (optional)
 *   files:      one or more audio files (1-3 min total clean speech)
 *
 * Returns the new voice_id; the voice immediately becomes selectable in
 * /api/tts/voices and the Studio voiceover picker.
 *
 * ⚠ Only clone voices you have permission to use (your own, or with explicit
 * recorded consent). ElevenLabs TOS applies.
 */
export async function POST(req: Request) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });

  const name = String(form.get('name') || '').trim();
  const description = String(form.get('description') || '').trim();
  if (name.length < 3 || name.length > 60) {
    return NextResponse.json({ error: 'name must be 3-60 chars' }, { status: 400 });
  }

  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: 'attach at least one audio file' }, { status: 400 });

  const filesPayload = await Promise.all(
    files.map(async (f) => ({
      filename: f.name || 'sample.mp3',
      bytes: Buffer.from(await f.arrayBuffer()),
      contentType: f.type || 'audio/mpeg',
    })),
  );

  try {
    const { voice_id } = await createInstantVoiceClone({
      name,
      description: description || undefined,
      files: filesPayload,
      labels: { source: 'copperai-studio', owner: auth.user.id },
    });
    return NextResponse.json({ voice_id, name });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'clone failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
