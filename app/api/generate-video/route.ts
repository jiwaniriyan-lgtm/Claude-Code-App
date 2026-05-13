import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { startImageToVideo, replicateVideoModel } from '@/lib/integrations';

export const runtime = 'nodejs';
export const maxDuration = 60;

const Body = z.object({
  imageUrl: z.string().url(),
  prompt: z.string().min(1).max(2000),
  durationSec: z.union([z.literal(5), z.literal(10)]).default(5),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
  workbookId: z.string().uuid().optional(),
});

/**
 * Animates an input image into a short MP4 (Kling 2.1). Returns a render_job id;
 * the client polls /api/jobs/[id] until done.
 */
export async function POST(req: Request) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request', issues: parsed.error.issues }, { status: 400 });

  try {
    const pred = await startImageToVideo({
      imageUrl: parsed.data.imageUrl,
      prompt: parsed.data.prompt,
      durationSec: parsed.data.durationSec,
      aspectRatio: parsed.data.aspectRatio,
    });

    const admin = createServiceRoleClient();
    const { data: job, error } = await admin
      .from('render_jobs')
      .insert({
        user_id: auth.user.id,
        workbook_id: parsed.data.workbookId ?? null,
        kind: 'video',
        provider: 'replicate',
        provider_job_id: pred.id,
        status: pred.status === 'failed' ? 'failed' : 'processing',
        input: {
          prompt: parsed.data.prompt,
          imageUrl: parsed.data.imageUrl,
          durationSec: parsed.data.durationSec,
          aspectRatio: parsed.data.aspectRatio,
          model: replicateVideoModel,
        },
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ job_id: job.id, provider_job_id: pred.id, status: 'processing' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'video generation failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
