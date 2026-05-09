/**
 * Integration adapter stubs for V1.1+.
 *
 * V1 ships fully AI-simulated (per Section 9 Tier 1 of the brief). These
 * adapters are stubbed so the V1.1+ work is "implement adapter X" rather
 * than "rearchitect the app." Wire env vars, fill in the function bodies,
 * call from the relevant API routes.
 *
 * Roadmap (recommended order):
 *   V1.1 — Anthropic Claude fallback (lib/openai.ts → wrap with anthropic.ts)
 *          vidIQ keyword data (used in State 7 + State 8 routes)
 *   V1.2 — ElevenLabs voiceover (State 6: async job + audio storage)
 *   V1.3 — Heygen / Higgsfield video (State 5 video toggle: async job)
 */

// ─── Anthropic (Claude fallback model) ──────────────────────────────────
export type AnthropicConfig = { apiKey?: string; model?: string };
export async function callClaude(_prompt: string, _opts: AnthropicConfig = {}): Promise<string> {
  // V1.1 implementation:
  //   const Anthropic = (await import('@anthropic-ai/sdk')).default;
  //   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  //   const res = await client.messages.create({
  //     model: 'claude-opus-4-7', max_tokens: 4000,
  //     messages: [{ role: 'user', content: _prompt }],
  //   });
  //   return res.content[0].type === 'text' ? res.content[0].text : '';
  throw new Error('Anthropic adapter not yet implemented (V1.1).');
}

// ─── vidIQ (real keyword + score data) ─────────────────────────────────
export type VidIQKeyword = { keyword: string; volume: number; competition: number; intent: string };
export async function fetchVidIQKeywords(_topic: string): Promise<VidIQKeyword[]> {
  // V1.1: GET https://api.vidiq.com/keyword/?... with bearer token
  // Inject results into State 7/8 prompt context as `realKeywords` field.
  throw new Error('vidIQ adapter not yet implemented (V1.1).');
}
export async function fetchVidIQTitleScore(_title: string): Promise<{ score: number; suggestions: string[] }> {
  throw new Error('vidIQ adapter not yet implemented (V1.1).');
}

// ─── ElevenLabs (voice synthesis) ──────────────────────────────────────
export type ElevenLabsJob = { jobId: string; status: 'queued' | 'processing' | 'done' | 'failed'; audioUrl?: string };
export async function startElevenLabsJob(_script: string, _voiceId: string): Promise<ElevenLabsJob> {
  // V1.2: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id} → MP3 bytes
  // Stream into Supabase Storage at workbook-audio/{user_id}/{wb_id}/state6.mp3
  throw new Error('ElevenLabs adapter not yet implemented (V1.2).');
}
export async function listElevenLabsVoices(): Promise<Array<{ id: string; name: string; preview_url?: string }>> {
  throw new Error('ElevenLabs adapter not yet implemented (V1.2).');
}

// ─── Heygen (avatar video generation) ──────────────────────────────────
export type HeygenJob = { jobId: string; status: 'queued' | 'processing' | 'done' | 'failed'; videoUrl?: string };
export async function startHeygenJob(_script: string, _avatarId: string, _voiceId: string): Promise<HeygenJob> {
  // V1.3: POST /v2/video/generate
  // Webhook: app/api/integrations/heygen/webhook/route.ts to receive completion.
  throw new Error('Heygen adapter not yet implemented (V1.3).');
}

// ─── Higgsfield (B-roll video clips) ───────────────────────────────────
export type HiggsfieldJob = { jobId: string; status: 'queued' | 'processing' | 'done' | 'failed'; clipUrl?: string };
export async function startHiggsfieldJob(_clipPrompt: string): Promise<HiggsfieldJob> {
  // V1.3: paired with State 5 video clip prompts when enabled.
  throw new Error('Higgsfield adapter not yet implemented (V1.3).');
}
