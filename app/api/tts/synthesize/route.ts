import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { synthesizeWithElevenLabs } from '@/lib/integrations';
import { storeBytes } from '@/lib/media';

export const runtime = 'nodejs';
export const maxDuration = 60;

const Body = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().min(1),
  modelId: z.string().optional(),
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
  style: z.number().min(0).max(1).optional(),
  workbookId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request', issues: parsed.error.issues }, { status: 400 });

  try {
    const { bytes, contentType } = await synthesizeWithElevenLabs({
      script: parsed.data.text,
      voiceId: parsed.data.voiceId,
      modelId: parsed.data.modelId,
      stability: parsed.data.stability,
      similarityBoost: parsed.data.similarityBoost,
      style: parsed.data.style,
    });

    const asset = await storeBytes({
      userId: auth.user.id,
      workbookId: parsed.data.workbookId ?? null,
      kind: 'audio',
      provider: 'elevenlabs',
      providerModel: parsed.data.modelId ?? 'eleven_turbo_v2_5',
      bytes,
      contentType,
      prompt: parsed.data.text.slice(0, 1000),
      meta: { voiceId: parsed.data.voiceId, chars: parsed.data.text.length },
    });

    return NextResponse.json({
      asset_id: asset.id,
      url: asset.publicUrl,
      bytes: bytes.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'tts failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
