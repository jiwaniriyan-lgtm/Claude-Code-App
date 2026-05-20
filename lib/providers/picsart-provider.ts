/**
 * PicsArt GenAI API.
 *
 * Docs: https://docs.picsart.io/
 * Auth: X-Picsart-API-Key header.
 *
 * Best fit: thumbnails (it has dedicated text-overlay endpoints) and
 * background-aware image generation.
 */
import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

const PICSART_BASE = 'https://genai-api.picsart.io/v1';

export const picsArtProvider: Provider = {
  descriptor: {
    id: 'picsart',
    name: 'PicsArt',
    blurb: 'Thumbnail-friendly image generation with text overlay. Background, upscale, edit endpoints too.',
    mode: 'api',
    capabilities: ['image', 'thumbnail'],
    envKeys: ['PICSART_API_KEY'],
    pricing: 'pay-per-call, ~$0.04/image',
    signupUrl: 'https://console.picsart.io/',
  },
  isConfigured() {
    return !!process.env.PICSART_API_KEY;
  },
  supports(kind: AssetKind) {
    return kind === 'image' || kind === 'thumbnail';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return { status: 'unconfigured', reason: 'PICSART_API_KEY not set', signupUrl: this.descriptor.signupUrl };
    }
    try {
      const body = {
        prompt: params.prompt,
        width: params.aspectRatio === '9:16' ? 720 : 1280,
        height: params.aspectRatio === '9:16' ? 1280 : 720,
        count: 1,
        style: (params.extra?.style as string) || 'photographic',
      };
      const res = await fetch(`${PICSART_BASE}/text2image`, {
        method: 'POST',
        headers: {
          'X-Picsart-API-Key': process.env.PICSART_API_KEY!,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { status: 'error', error: `PicsArt ${res.status}: ${await res.text()}` };
      }
      const json = (await res.json()) as { data?: Array<{ url: string }>; inference_id?: string };
      const url = json.data?.[0]?.url;
      if (url) return { status: 'ready', assetUrl: url };
      if (json.inference_id) {
        return { status: 'processing', jobId: json.inference_id, providerId: 'picsart' };
      }
      return { status: 'error', error: 'PicsArt: no asset and no job id returned' };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
  async getStatus(jobId: string) {
    try {
      const res = await fetch(`${PICSART_BASE}/text2image/inferences/${jobId}`, {
        headers: { 'X-Picsart-API-Key': process.env.PICSART_API_KEY! },
        cache: 'no-store',
      });
      if (!res.ok) return { status: 'error' as const, error: `PicsArt status ${res.status}` };
      const json = (await res.json()) as { status: string; data?: Array<{ url: string }> };
      if (json.status === 'FINISHED' || json.status === 'DONE') {
        const url = json.data?.[0]?.url;
        if (!url) return { status: 'error' as const, error: 'PicsArt finished but no URL' };
        return { status: 'ready' as const, assetUrl: url };
      }
      if (json.status === 'FAILED') return { status: 'error' as const, error: 'PicsArt job failed' };
      return { status: 'processing' as const };
    } catch (err) {
      return { status: 'error' as const, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
