import { synthesizeSpeech, listVoices } from '../elevenlabs';
import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

export const elevenLabsProvider: Provider = {
  descriptor: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    blurb: 'Best-in-class realistic AI voices. 30+ stock voices + voice cloning.',
    mode: 'api',
    capabilities: ['voice'],
    envKeys: ['ELEVENLABS_API_KEY'],
    pricing: 'subscription, ~$0.18 per 1k characters',
    signupUrl: 'https://elevenlabs.io/app/settings/api-keys',
  },
  isConfigured() {
    return !!process.env.ELEVENLABS_API_KEY;
  },
  supports(kind: AssetKind) {
    return kind === 'voice';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return { status: 'unconfigured', reason: 'ELEVENLABS_API_KEY not set', signupUrl: this.descriptor.signupUrl };
    }
    if (!params.voiceId) {
      return { status: 'error', error: 'voiceId is required for ElevenLabs voice generation.' };
    }
    try {
      const { bytes, contentType } = await synthesizeSpeech({
        voiceId: params.voiceId,
        text: params.prompt,
        stability: (params.extra?.stability as number) ?? 0.5,
        similarityBoost: (params.extra?.similarityBoost as number) ?? 0.75,
        style: (params.extra?.style as number) ?? 0,
      });
      // Return base64 data URL — caller uploads to storage. Keeps provider stateless.
      const dataUrl = `data:${contentType};base64,${bytes.toString('base64')}`;
      return { status: 'ready', assetUrl: dataUrl, mimeType: contentType };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export { listVoices };
