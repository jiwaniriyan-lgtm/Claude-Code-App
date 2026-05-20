import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { pollReplicate } from '@/lib/integrations';
import { storeRemoteUrl } from '@/lib/media';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Poll a render_jobs row. If the upstream prediction has completed and we
 * haven't downloaded the output yet, fetch it into Supabase Storage, create a
 * media_assets row, and mark the job 'done' with the resulting URL.
 */
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: job, error } = await supa
    .from('render_jobs')
    .select('*')
    .eq('id', ctx.params.id)
    .eq('user_id', auth.user.id)
    .single();
  if (error || !job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (job.status === 'done' || job.status === 'failed' || job.status === 'canceled') {
    return NextResponse.json({ job });
  }

  if (job.provider !== 'replicate' || !job.provider_job_id) {
    return NextResponse.json({ job });
  }

  try {
    const poll = await pollReplicate(job.provider_job_id as string);
    const admin = createServiceRoleClient();

    if (poll.status === 'failed' || poll.status === 'canceled') {
      const { data: updated } = await admin
        .from('render_jobs')
        .update({ status: poll.status === 'canceled' ? 'canceled' : 'failed', error: poll.error ?? 'unknown' })
        .eq('id', job.id)
        .select('*')
        .single();
      return NextResponse.json({ job: updated ?? job });
    }

    if (poll.status === 'succeeded' && poll.outputUrl) {
      const kind = job.kind as 'image' | 'video';
      const asset = await storeRemoteUrl({
        userId: job.user_id as string,
        workbookId: (job.workbook_id as string | null) ?? null,
        kind,
        provider: 'replicate',
        providerModel: (job.input as { model?: string })?.model,
        url: poll.outputUrl,
        prompt: (job.input as { prompt?: string })?.prompt,
        meta: { provider_job_id: job.provider_job_id },
      });

      const { data: updated } = await admin
        .from('render_jobs')
        .update({
          status: 'done',
          output: { asset_id: asset.id, url: asset.publicUrl, storage_path: asset.storagePath },
        })
        .eq('id', job.id)
        .select('*')
        .single();

      return NextResponse.json({ job: updated ?? job });
    }

    // still processing
    return NextResponse.json({ job: { ...job, status: 'processing' } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'poll failed';
    return NextResponse.json({ job, poll_error: msg });
  }
}
