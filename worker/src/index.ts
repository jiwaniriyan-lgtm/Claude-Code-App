/**
 * CopperAI render worker.
 *
 * Long-running Node process that polls render_jobs (status='queued',
 * kind='assembly') and produces final MP4s with FFmpeg.
 *
 *   pnpm install
 *   pnpm build && pnpm start          # production
 *   pnpm dev                          # local with reload
 *   pnpm once                         # process one job and exit (for cron/CI)
 *
 * Env vars required:
 *   SUPABASE_URL   (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from 'fs/promises';
import { supa, VIDEO_BUCKET } from './supabase';
import { assemble } from './assembler';
import type { RenderJobRow, Timeline } from './types';

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 4000);
const RUN_ONCE = process.argv.includes('--once');

async function main() {
  console.log(`[worker] starting (poll=${POLL_INTERVAL_MS}ms once=${RUN_ONCE})`);
  if (RUN_ONCE) {
    await tick();
    return;
  }
  // Loop forever
  while (true) {
    try {
      await tick();
    } catch (err) {
      console.error('[worker] tick error:', err);
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

async function tick(): Promise<void> {
  const job = await claimNextJob();
  if (!job) return;
  console.log(`[worker] picked up job ${job.id}`);
  try {
    const timeline = job.input.timeline;
    if (!timeline) throw new Error('job.input.timeline is missing');
    await renderAndPublish(job, timeline);
    console.log(`[worker] job ${job.id} done`);
  } catch (err) {
    const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    console.error(`[worker] job ${job.id} failed:`, msg);
    await supa.from('render_jobs').update({ status: 'failed', error: msg.slice(0, 4000) }).eq('id', job.id);
  }
}

async function claimNextJob(): Promise<RenderJobRow | null> {
  // Find one queued assembly job. Use update-with-returning to atomically claim.
  const { data: candidate } = await supa
    .from('render_jobs')
    .select('id')
    .eq('status', 'queued')
    .eq('kind', 'assembly')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!candidate) return null;

  const { data: claimed } = await supa
    .from('render_jobs')
    .update({ status: 'processing' })
    .eq('id', candidate.id)
    .eq('status', 'queued')
    .select('*')
    .maybeSingle();
  return (claimed as RenderJobRow | null) ?? null;
}

async function renderAndPublish(job: RenderJobRow, timeline: Timeline): Promise<void> {
  const { outputPath, workDir, durationSec } = await assemble(timeline);
  const bytes = await fs.readFile(outputPath);

  const assetId = crypto.randomUUID();
  const storagePath = `${job.user_id}/${job.workbook_id ?? '_'}/${assetId}.mp4`;

  const { error: upErr } = await supa.storage.from(VIDEO_BUCKET).upload(storagePath, bytes, {
    contentType: 'video/mp4',
    upsert: false,
  });
  if (upErr) throw new Error(`storage upload: ${upErr.message}`);

  const { data: pub } = supa.storage.from(VIDEO_BUCKET).getPublicUrl(storagePath);
  const publicUrl = pub.publicUrl;

  const { data: asset, error: insErr } = await supa
    .from('media_assets')
    .insert({
      id: assetId,
      user_id: job.user_id,
      workbook_id: job.workbook_id,
      kind: 'video',
      provider: 'internal',
      provider_model: 'ffmpeg-assembly',
      storage_path: storagePath,
      public_url: publicUrl,
      duration_ms: Math.round(durationSec * 1000),
      width: timeline.resolution.width,
      height: timeline.resolution.height,
      prompt: timeline.title,
      meta: { scenes: timeline.scenes.length },
    })
    .select('id')
    .single();
  if (insErr) throw new Error(`media_assets insert: ${insErr.message}`);

  await supa
    .from('render_jobs')
    .update({
      status: 'done',
      output: { asset_id: asset.id, url: publicUrl, storage_path: storagePath },
    })
    .eq('id', job.id);

  // Best-effort cleanup of the temp dir
  fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error('[worker] fatal:', err);
  process.exit(1);
});
