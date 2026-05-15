/**
 * Higgsfield — cinematic video generation (Soul, DoP camera-move models).
 *
 * Recommended access path: fal.ai (https://fal.ai/models/fal-ai/higgsfield/...).
 * Direct API access is gated; we use fal.ai as the broker.
 *
 * Auth: FAL_KEY env var (fal.ai key). Falls back to disabled if absent.
 */
import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

const FAL_BASE = 'https://queue.fal.run';

export const higgsfieldProvider: Provider = {
  descriptor: {
    id: 'higgsfield',
    name: 'Higgsfield (via fal.ai)',
    blurb: 'Cinematic camera moves and high-motion video clips. Strong for hooks and B-roll.',
    mode: 'api',
    capabilities: ['video'],
    envKeys: ['FAL_KEY'],
    pricing: 'pay-per-clip, see fal.ai pricing',
    signupUrl: 'https://fal.ai/dashboard/keys',
  },
  isConfigured() {
    return !!process.env.FAL_KEY;
  },
  supports(kind: AssetKind) {
    return kind === 'video';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return { status: 'unconfigured', reason: 'FAL_KEY not set', signupUrl: this.descriptor.signupUrl };
    }
    try {
      const model = (params.extra?.model as string) || 'fal-ai/higgsfield-soul';
      const body: Record<string, unknown> = {
        prompt: params.prompt,
        duration: params.durationSec ?? 5,
        aspect_ratio: params.aspectRatio ?? '16:9',
      };
      if (params.referenceImageUrl) body.image_url = params.referenceImageUrl;

      const res = await fetch(`${FAL_BASE}/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.FAL_KEY!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { status: 'error', error: `fal.ai ${res.status}: ${await res.text()}` };
      }
      const json = (await res.json()) as { request_id?: string; status_url?: string };
      if (!json.request_id) return { status: 'error', error: 'fal.ai: no request_id' };
      return {
        status: 'processing',
        jobId: json.request_id,
        providerId: 'higgsfield',
        meta: { statusUrl: json.status_url, model },
      };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
  async getStatus(jobId: string) {
    try {
      // Generic fal.ai status endpoint; caller should pass back jobId.
      // For real polling we'd persist meta.statusUrl — kept simple here.
      const res = await fetch(`${FAL_BASE}/requests/${jobId}`, {
        headers: { Authorization: `Key ${process.env.FAL_KEY!}` },
        cache: 'no-store',
      });
      if (!res.ok) return { status: 'error' as const, error: `fal.ai status ${res.status}` };
      const json = (await res.json()) as {
        status: string;
        video?: { url: string };
        output?: { video?: { url: string } };
      };
      if (json.status === 'COMPLETED') {
        const url = json.video?.url || json.output?.video?.url;
        if (!url) return { status: 'error' as const, error: 'fal.ai completed but no video URL' };
        return { status: 'ready' as const, assetUrl: url };
      }
      if (json.status === 'FAILED') return { status: 'error' as const, error: 'fal.ai job failed' };
      return { status: 'processing' as const };
    } catch (err) {
      return { status: 'error' as const, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
