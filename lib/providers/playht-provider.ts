/**
 * PlayHT — large voice library (800+ voices), good ElevenLabs alternative.
 *
 * Docs: https://docs.play.ht/reference/api-getting-started
 * Auth: AUTHORIZATION + X-USER-ID headers.
 */
import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

export const playHtProvider: Provider = {
  descriptor: {
    id: 'playht',
    name: 'PlayHT',
    blurb: '800+ voices across languages. Great variety beyond ElevenLabs.',
    mode: 'api',
    capabilities: ['voice'],
    envKeys: ['PLAYHT_API_KEY', 'PLAYHT_USER_ID'],
    pricing: 'subscription, ~$0.04 per 1k characters',
    signupUrl: 'https://play.ht/studio/api-access',
  },
  isConfigured() {
    return !!process.env.PLAYHT_API_KEY && !!process.env.PLAYHT_USER_ID;
  },
  supports(kind: AssetKind) {
    return kind === 'voice';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return {
        status: 'unconfigured',
        reason: 'PLAYHT_API_KEY / PLAYHT_USER_ID not set',
        signupUrl: this.descriptor.signupUrl,
      };
    }
    if (!params.voiceId) {
      return { status: 'error', error: 'voiceId required for PlayHT.' };
    }
    try {
      const res = await fetch('https://api.play.ht/api/v2/tts/stream', {
        method: 'POST',
        headers: {
          Authorization: process.env.PLAYHT_API_KEY!,
          'X-USER-ID': process.env.PLAYHT_USER_ID!,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: params.prompt,
          voice: params.voiceId,
          output_format: 'mp3',
          voice_engine: (params.extra?.engine as string) || 'PlayHT2.0',
        }),
      });
      if (!res.ok) {
        return { status: 'error', error: `PlayHT ${res.status}: ${await res.text()}` };
      }
      const buf = Buffer.from(await res.arrayBuffer());
      return {
        status: 'ready',
        assetUrl: `data:audio/mpeg;base64,${buf.toString('base64')}`,
        mimeType: 'audio/mpeg',
      };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
};
