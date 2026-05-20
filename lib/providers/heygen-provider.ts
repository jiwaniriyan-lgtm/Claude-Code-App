/**
 * HeyGen — AI avatar + voice video generation.
 *
 * Docs: https://docs.heygen.com/
 * Auth: X-Api-Key header.
 *
 * Best fit: talking-head videos (avatar + voiceover) in one call.
 * Generation is async — jobId returned, poll via getStatus().
 */
import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

const HEYGEN_BASE = 'https://api.heygen.com';

export const heyGenProvider: Provider = {
  descriptor: {
    id: 'heygen',
    name: 'HeyGen',
    blurb: 'AI avatars + voiceover in one shot. Best for talking-head videos.',
    mode: 'api',
    capabilities: ['video'],
    envKeys: ['HEYGEN_API_KEY'],
    pricing: 'subscription tiers, see heygen.com',
    signupUrl: 'https://app.heygen.com/settings/api',
  },
  isConfigured() {
    return !!process.env.HEYGEN_API_KEY;
  },
  supports(kind: AssetKind) {
    return kind === 'video';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return { status: 'unconfigured', reason: 'HEYGEN_API_KEY not set', signupUrl: this.descriptor.signupUrl };
    }
    try {
      const avatarId = (params.extra?.avatarId as string) || 'Daisy-inskirt-20220818';
      const voiceId = (params.extra?.voiceId as string) || params.voiceId || '1bd001e7e50f421d891986aad5158bc8';
      const body = {
        video_inputs: [
          {
            character: { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
            voice: { type: 'text', input_text: params.prompt, voice_id: voiceId },
          },
        ],
        dimension: params.aspectRatio === '9:16' ? { width: 720, height: 1280 } : { width: 1280, height: 720 },
      };
      const res = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
        method: 'POST',
        headers: {
          'X-Api-Key': process.env.HEYGEN_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { status: 'error', error: `HeyGen ${res.status}: ${await res.text()}` };
      }
      const json = (await res.json()) as { data?: { video_id: string }; error?: { message: string } };
      if (!json.data?.video_id) {
        return { status: 'error', error: json.error?.message || 'HeyGen: no video_id returned' };
      }
      return { status: 'processing', jobId: json.data.video_id, providerId: 'heygen' };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
  async getStatus(jobId: string) {
    try {
      const res = await fetch(`${HEYGEN_BASE}/v1/video_status.get?video_id=${jobId}`, {
        headers: { 'X-Api-Key': process.env.HEYGEN_API_KEY! },
        cache: 'no-store',
      });
      if (!res.ok) return { status: 'error' as const, error: `HeyGen status ${res.status}` };
      const json = (await res.json()) as { data?: { status: string; video_url?: string; error?: string } };
      const s = json.data?.status;
      if (s === 'completed' && json.data?.video_url) {
        return { status: 'ready' as const, assetUrl: json.data.video_url };
      }
      if (s === 'failed') return { status: 'error' as const, error: json.data?.error || 'HeyGen failed' };
      return { status: 'processing' as const };
    } catch (err) {
      return { status: 'error' as const, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
