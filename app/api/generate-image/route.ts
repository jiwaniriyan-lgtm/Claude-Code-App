import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { startImageGeneration, replicateImageModel } from '@/lib/integrations';

export const runtime = 'nodejs';
export const maxDuration = 60;

const Body = z.object({
  prompt: z.string().min(1).max(2000),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3']).default('16:9'),
  workbookId: z.string().uuid().optional(),
});

/**
 * Starts an image generation prediction on Replicate and records a render_job.
 * Client polls /api/jobs/[id] until status === 'done' to get the asset URL.
 */
export async function POST(req: Request) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request', issues: parsed.error.issues }, { status: 400 });

  try {
    const pred = await startImageGeneration(parsed.data.prompt, parsed.data.aspectRatio);

    const admin = createServiceRoleClient();
    const { data: job, error } = await admin
      .from('render_jobs')
      .insert({
        user_id: auth.user.id,
        workbook_id: parsed.data.workbookId ?? null,
        kind: 'image',
        provider: 'replicate',
        provider_job_id: pred.id,
        status: pred.status === 'failed' ? 'failed' : 'processing',
        input: {
          prompt: parsed.data.prompt,
          aspectRatio: parsed.data.aspectRatio,
          model: replicateImageModel,
        },
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ job_id: job.id, provider_job_id: pred.id, status: 'processing' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'image generation failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
