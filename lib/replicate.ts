/**
 * Replicate client — gateway for image + video models.
 *
 * Defaults:
 *   • image  → black-forest-labs/flux-1.1-pro      (high-quality images)
 *   • video  → kwaivgi/kling-v2.1                  (image-to-video, ~5-10s clips)
 *
 * Replicate uses an async prediction API: POST creates a prediction with a
 * provider_job_id, then we poll GET /predictions/{id} until status is
 * 'succeeded' / 'failed' / 'canceled'.
 *
 * Docs: https://replicate.com/docs/reference/http
 */

const REPLICATE_BASE = 'https://api.replicate.com/v1';

function getKey(): string {
  const k = process.env.REPLICATE_API_TOKEN;
  if (!k) throw new Error('REPLICATE_API_TOKEN is not configured.');
  return k;
}

export type ReplicateStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export type ReplicatePrediction<TOutput = unknown> = {
  id: string;
  model: string;
  version?: string;
  status: ReplicateStatus;
  input: Record<string, unknown>;
  output: TOutput | null;
  error: string | null;
  created_at: string;
  completed_at?: string | null;
  urls: { get: string; cancel: string };
};

/**
 * Run a model by owner/name (Replicate "official model" API). Returns the
 * initial prediction record — caller polls via getPrediction.
 */
export async function createPrediction<TOut = unknown>(params: {
  model: string;                 // e.g. 'black-forest-labs/flux-1.1-pro'
  input: Record<string, unknown>;
  webhook?: string;
  webhookEventsFilter?: Array<'start' | 'output' | 'logs' | 'completed'>;
}): Promise<ReplicatePrediction<TOut>> {
  const res = await fetch(`${REPLICATE_BASE}/models/${params.model}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${getKey()}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=0',
    },
    body: JSON.stringify({
      input: params.input,
      webhook: params.webhook,
      webhook_events_filter: params.webhookEventsFilter,
    }),
  });
  if (!res.ok) throw new Error(`Replicate create ${res.status}: ${await res.text()}`);
  return (await res.json()) as ReplicatePrediction<TOut>;
}

export async function getPrediction<TOut = unknown>(id: string): Promise<ReplicatePrediction<TOut>> {
  const res = await fetch(`${REPLICATE_BASE}/predictions/${id}`, {
    headers: { Authorization: `Token ${getKey()}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Replicate get ${res.status}: ${await res.text()}`);
  return (await res.json()) as ReplicatePrediction<TOut>;
}

export async function cancelPrediction(id: string): Promise<void> {
  const res = await fetch(`${REPLICATE_BASE}/predictions/${id}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Token ${getKey()}` },
  });
  if (!res.ok && res.status !== 404) throw new Error(`Replicate cancel ${res.status}: ${await res.text()}`);
}

// ─── Convenience wrappers ──────────────────────────────────────────────────

export const REPLICATE_IMAGE_MODEL = process.env.REPLICATE_IMAGE_MODEL || 'black-forest-labs/flux-1.1-pro';
export const REPLICATE_VIDEO_MODEL = process.env.REPLICATE_VIDEO_MODEL || 'kwaivgi/kling-v2.1';

export async function generateImage(prompt: string, opts: { aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3'; seed?: number } = {}) {
  return createPrediction<string | string[]>({
    model: REPLICATE_IMAGE_MODEL,
    input: {
      prompt,
      aspect_ratio: opts.aspectRatio ?? '16:9',
      output_format: 'webp',
      output_quality: 90,
      ...(opts.seed != null ? { seed: opts.seed } : {}),
    },
  });
}

export async function animateImage(params: {
  imageUrl: string;
  prompt: string;
  durationSec?: 5 | 10;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}) {
  return createPrediction<string>({
    model: REPLICATE_VIDEO_MODEL,
    input: {
      prompt: params.prompt,
      start_image: params.imageUrl,
      duration: params.durationSec ?? 5,
      aspect_ratio: params.aspectRatio ?? '16:9',
      mode: 'standard',
    },
  });
}

/** Normalize Replicate's variable output shape to a single URL. */
export function firstUrl(output: unknown): string | null {
  if (typeof output === 'string') return output;
  if (Array.isArray(output) && output.length > 0 && typeof output[0] === 'string') return output[0];
  if (output && typeof output === 'object' && 'url' in (output as Record<string, unknown>)) {
    const u = (output as Record<string, unknown>).url;
    if (typeof u === 'string') return u;
  }
  return null;
}
