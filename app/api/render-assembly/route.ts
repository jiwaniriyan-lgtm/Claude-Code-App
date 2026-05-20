import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { Timeline } from '@/lib/assembly/timeline';

export const runtime = 'nodejs';

const SceneSource = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('image'),
    url: z.string().url(),
    motion: z.enum(['zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'static']).optional(),
  }),
  z.object({
    kind: z.literal('video'),
    url: z.string().url(),
    trimFromSec: z.number().min(0).optional(),
    speed: z.number().min(0.25).max(4).optional(),
  }),
]);

const Scene = z.object({
  id: z.string().min(1),
  durationSec: z.number().min(0.5).max(120),
  source: SceneSource,
  caption: z.string().max(300).optional(),
  voiceoverUrl: z.string().url().optional(),
  transitionIn: z.enum(['fade', 'cut', 'wipe']).optional(),
  transitionDurationSec: z.number().min(0).max(3).optional(),
});

const TimelineSchema = z.object({
  version: z.literal(1),
  title: z.string().min(1).max(200),
  resolution: z.object({
    width: z.number().int().min(360).max(3840),
    height: z.number().int().min(360).max(3840),
    fps: z.number().int().min(15).max(60).optional(),
  }),
  musicUrl: z.string().url().optional(),
  musicVolume: z.number().min(0).max(1).optional(),
  voiceoverUrl: z.string().url().optional(),
  subtitles: z
    .object({
      srt: z.string().optional(),
      fontSize: z.number().int().min(8).max(96).optional(),
      fontColor: z.string().optional(),
      backgroundOpacity: z.number().min(0).max(1).optional(),
      position: z.enum(['bottom', 'center', 'top']).optional(),
      transcribeVoiceover: z.boolean().optional(),
    })
    .optional(),
  transitions: z
    .object({
      type: z.enum(['fade', 'wipeleft', 'wiperight', 'slideleft', 'slideright', 'circleopen', 'dissolve']),
      durationSec: z.number().min(0.1).max(2),
    })
    .optional(),
  scenes: z.array(Scene).min(1).max(120),
});

const Body = z.object({
  timeline: TimelineSchema,
  workbookId: z.string().uuid().optional(),
});

/**
 * Enqueue a video-assembly render. The standalone worker (worker/index.ts)
 * polls render_jobs where status='queued' and kind='assembly' and produces
 * the final MP4. The client polls /api/jobs/[id] to await completion.
 */
export async function POST(req: Request) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request', issues: parsed.error.issues }, { status: 400 });

  const timeline: Timeline = parsed.data.timeline;

  const admin = createServiceRoleClient();
  const { data: job, error } = await admin
    .from('render_jobs')
    .insert({
      user_id: auth.user.id,
      workbook_id: parsed.data.workbookId ?? null,
      kind: 'assembly',
      provider: 'internal',
      status: 'queued',
      input: { timeline },
    })
    .select('id, status, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    job_id: job.id,
    status: job.status,
    scenes: timeline.scenes.length,
    estimated_duration_sec: timeline.scenes.reduce((a, s) => a + s.durationSec, 0),
  });
}
