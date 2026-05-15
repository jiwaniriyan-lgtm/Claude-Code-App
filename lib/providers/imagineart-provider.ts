/**
 * ImagineArt (vyro.ai) — image + video generation API.
 *
 * Docs: https://docs.imagine.art/
 * Auth: Bearer token via Authorization header.
 */
import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

const IMAGINEART_BASE = 'https://api.vyro.ai/v2';

function aspectToSize(ar?: string): string {
  switch (ar) {
    case '9:16': return '9:16';
    case '1:1': return '1:1';
    case '4:3': return '4:3';
    case '1.91:1': return '16:9';
    default: return '16:9';
  }
}

export const imagineArtProvider: Provider = {
  descriptor: {
    id: 'imagineart',
    name: 'ImagineArt',
    blurb: 'Vyro.ai images and video. Strong stylization, photorealism, and art styles.',
    mode: 'api',
    capabilities: ['image', 'video', 'thumbnail'],
    envKeys: ['IMAGINEART_API_KEY'],
    pricing: 'subscription tiers, see vyro.ai',
    signupUrl: 'https://www.imagine.art/dashboard/api',
  },
  isConfigured() {
    return !!process.env.IMAGINEART_API_KEY;
  },
  supports(kind: AssetKind) {
    return kind === 'image' || kind === 'video' || kind === 'thumbnail';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return { status: 'unconfigured', reason: 'IMAGINEART_API_KEY not set', signupUrl: this.descriptor.signupUrl };
    }
    try {
      const endpoint =
        params.kind === 'video' ? '/video/generations' : '/image/generations';
      const fd = new FormData();
      fd.append('prompt', params.prompt);
      fd.append('aspect_ratio', aspectToSize(params.aspectRatio));
      fd.append('style', (params.extra?.style as string) || 'realistic');
      if (params.kind === 'video' && params.referenceImageUrl) {
        fd.append('image_url', params.referenceImageUrl);
        fd.append('duration', String(params.durationSec ?? 5));
      }

      const res = await fetch(`${IMAGINEART_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.IMAGINEART_API_KEY!}`,
        },
        body: fd,
      });
      if (!res.ok) {
        return { status: 'error', error: `ImagineArt ${res.status}: ${await res.text()}` };
      }
      // Response can be either binary (image bytes) or JSON with a URL.
      const ct = res.headers.get('content-type') || '';
      if (ct.startsWith('image/') || ct.startsWith('video/')) {
        const buf = Buffer.from(await res.arrayBuffer());
        return {
          status: 'ready',
          assetUrl: `data:${ct};base64,${buf.toString('base64')}`,
          mimeType: ct,
        };
      }
      const json = (await res.json()) as { url?: string; data?: Array<{ url: string }> };
      const url = json.url || json.data?.[0]?.url;
      if (!url) return { status: 'error', error: 'ImagineArt returned no asset URL' };
      return { status: 'ready', assetUrl: url };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
};
