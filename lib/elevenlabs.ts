/**
 * ElevenLabs client — voices, TTS synthesis, instant voice clone.
 *
 * Server-side only. All calls use ELEVENLABS_API_KEY.
 *
 * Docs: https://elevenlabs.io/docs/api-reference
 */

const ELEVEN_BASE = 'https://api.elevenlabs.io/v1';

function getKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not configured.');
  return key;
}

export type ElevenVoice = {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  labels?: Record<string, string>;
  preview_url?: string;
};

export async function listVoices(): Promise<ElevenVoice[]> {
  const res = await fetch(`${ELEVEN_BASE}/voices`, {
    headers: { 'xi-api-key': getKey() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`ElevenLabs voices ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { voices: ElevenVoice[] };
  return json.voices;
}

export type SynthesizeOptions = {
  voiceId: string;
  text: string;
  modelId?: string;                  // default: eleven_turbo_v2_5
  stability?: number;                // 0-1
  similarityBoost?: number;          // 0-1
  style?: number;                    // 0-1
  useSpeakerBoost?: boolean;
  outputFormat?: 'mp3_44100_128' | 'mp3_44100_192' | 'pcm_44100';
};

/** Returns raw audio bytes (MP3 by default). Caller is responsible for storing. */
export async function synthesizeSpeech(opts: SynthesizeOptions): Promise<{ bytes: Buffer; contentType: string }> {
  const {
    voiceId,
    text,
    modelId = 'eleven_turbo_v2_5',
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0,
    useSpeakerBoost = true,
    outputFormat = 'mp3_44100_192',
  } = opts;

  const url = `${ELEVEN_BASE}/text-to-speech/${voiceId}?output_format=${outputFormat}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': getKey(),
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: useSpeakerBoost,
      },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS ${res.status}: ${await res.text()}`);

  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'audio/mpeg';
  return { bytes: buf, contentType };
}

/**
 * Instant Voice Clone — submit one or more audio samples (1-3 minutes total,
 * clean speech, single speaker) and get back a new voice_id usable in
 * synthesizeSpeech(). Owner of the voice = owner of the API key.
 *
 * The caller must have explicit rights to the voice being cloned (TOS).
 */
export async function createInstantVoiceClone(params: {
  name: string;
  description?: string;
  files: Array<{ filename: string; bytes: Buffer | Blob; contentType: string }>;
  labels?: Record<string, string>;
}): Promise<{ voice_id: string }> {
  const fd = new FormData();
  fd.set('name', params.name);
  if (params.description) fd.set('description', params.description);
  if (params.labels) fd.set('labels', JSON.stringify(params.labels));
  for (const f of params.files) {
    const blob = f.bytes instanceof Blob ? f.bytes : new Blob([new Uint8Array(f.bytes)], { type: f.contentType });
    fd.append('files', blob, f.filename);
  }
  const res = await fetch(`${ELEVEN_BASE}/voices/add`, {
    method: 'POST',
    headers: { 'xi-api-key': getKey() },
    body: fd,
  });
  if (!res.ok) throw new Error(`ElevenLabs clone ${res.status}: ${await res.text()}`);
  return (await res.json()) as { voice_id: string };
}

export async function deleteVoice(voiceId: string): Promise<void> {
  const res = await fetch(`${ELEVEN_BASE}/voices/${voiceId}`, {
    method: 'DELETE',
    headers: { 'xi-api-key': getKey() },
  });
  if (!res.ok) throw new Error(`ElevenLabs delete ${res.status}: ${await res.text()}`);
}
