import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

const OPENAI_TTS_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
export type OpenAITTSVoiceId = (typeof OPENAI_TTS_VOICES)[number];

export const openaiTtsProvider: Provider = {
  descriptor: {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    blurb: '6 high-quality voices (alloy, echo, fable, onyx, nova, shimmer). Pay-per-character.',
    mode: 'api',
    capabilities: ['voice'],
    envKeys: ['OPENAI_API_KEY'],
    pricing: '$15 per 1M chars (tts-1) / $30 per 1M chars (tts-1-hd)',
    signupUrl: 'https://platform.openai.com/api-keys',
  },
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  },
  supports(kind: AssetKind) {
    return kind === 'voice';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return { status: 'unconfigured', reason: 'OPENAI_API_KEY not set', signupUrl: this.descriptor.signupUrl };
    }
    const voice = (params.voiceId || 'nova') as OpenAITTSVoiceId;
    if (!OPENAI_TTS_VOICES.includes(voice)) {
      return { status: 'error', error: `Unknown OpenAI voice "${voice}". Pick one of: ${OPENAI_TTS_VOICES.join(', ')}` };
    }
    try {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: (params.extra?.model as string) || 'tts-1-hd',
          input: params.prompt,
          voice,
          response_format: 'mp3',
          speed: (params.extra?.speed as number) ?? 1.0,
        }),
      });
      if (!res.ok) {
        return { status: 'error', error: `OpenAI TTS ${res.status}: ${await res.text()}` };
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const dataUrl = `data:audio/mpeg;base64,${buf.toString('base64')}`;
      return { status: 'ready', assetUrl: dataUrl, mimeType: 'audio/mpeg' };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export const OPENAI_TTS_VOICE_LIST = OPENAI_TTS_VOICES.map((v) => ({
  voice_id: v,
  name: v.charAt(0).toUpperCase() + v.slice(1),
  description: {
    alloy: 'Neutral, balanced',
    echo: 'Male, deeper',
    fable: 'British accent, warm',
    onyx: 'Male, authoritative',
    nova: 'Female, friendly',
    shimmer: 'Female, soft',
  }[v],
}));
