/**
 * High-level integration facade. Routes call into here instead of directly into
 * provider clients so we can swap providers / add fallbacks in one place.
 */

import { listVoices as elListVoices, synthesizeSpeech as elSynthesize } from './elevenlabs';
import {
  animateImage as repAnimate,
  generateImage as repGenImage,
  getPrediction as repGet,
  firstUrl,
  REPLICATE_IMAGE_MODEL,
  REPLICATE_VIDEO_MODEL,
} from './replicate';

// ─── Anthropic (Claude fallback model) ──────────────────────────────────
// Not yet wired — scripts continue to flow through OpenAI in lib/openai.ts.
// Implement when adding multi-model selection in settings.
export type AnthropicConfig = { apiKey?: string; model?: string };
export async function callClaude(_prompt: string, _opts: AnthropicConfig = {}): Promise<string> {
  throw new Error('Anthropic adapter not yet implemented.');
}

// ─── vidIQ (real keyword + score data) ─────────────────────────────────
export type VidIQKeyword = { keyword: string; volume: number; competition: number; intent: string };
export async function fetchVidIQKeywords(_topic: string): Promise<VidIQKeyword[]> {
  throw new Error('vidIQ adapter not yet implemented.');
}
export async function fetchVidIQTitleScore(_title: string): Promise<{ score: number; suggestions: string[] }> {
  throw new Error('vidIQ adapter not yet implemented.');
}

// ─── ElevenLabs (voice synthesis) ──────────────────────────────────────
export const listElevenLabsVoices = elListVoices;

export type ElevenLabsSynthArgs = {
  script: string;
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
};

export async function synthesizeWithElevenLabs(args: ElevenLabsSynthArgs) {
  return elSynthesize({
    voiceId: args.voiceId,
    text: args.script,
    modelId: args.modelId,
    stability: args.stability,
    similarityBoost: args.similarityBoost,
    style: args.style,
  });
}

// ─── Replicate (image + image-to-video) ────────────────────────────────
export const replicateImageModel = REPLICATE_IMAGE_MODEL;
export const replicateVideoModel = REPLICATE_VIDEO_MODEL;

export async function startImageGeneration(prompt: string, aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3') {
  return repGenImage(prompt, { aspectRatio });
}

export async function startImageToVideo(args: {
  imageUrl: string;
  prompt: string;
  durationSec?: 5 | 10;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}) {
  return repAnimate(args);
}

export async function pollReplicate(predictionId: string) {
  const pred = await repGet(predictionId);
  return {
    status: pred.status,
    error: pred.error,
    outputUrl: pred.output ? firstUrl(pred.output) : null,
    raw: pred,
  };
}
