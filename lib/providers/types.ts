/**
 * Multi-provider asset generation layer.
 *
 * Each Provider knows what asset kinds it supports (image / video /
 * thumbnail / voice), whether it's currently configured (env vars present),
 * and how to dispatch a generation request.
 *
 * Provider responses come in two flavors:
 *   • synchronous   → asset URL ready immediately
 *   • async / job   → caller polls the returned job ID via getStatus()
 *
 * Providers without a public API (e.g. InVideo, Google ImageFX consumer)
 * use kind = 'external' and a deeplink the UI opens in a new tab with the
 * prompt pre-filled where possible.
 */

export type AssetKind = 'image' | 'video' | 'thumbnail' | 'voice';

export type ProviderCapability =
  | 'image'
  | 'video'
  | 'thumbnail'
  | 'voice'
  | 'research'; // VidIQ-style: not generative, used in Step 1

export type ProviderId =
  | 'replicate'
  | 'elevenlabs'
  | 'openai-tts'
  | 'playht'
  | 'imagineart'
  | 'picsart'
  | 'heygen'
  | 'higgsfield'
  | 'vertex-imagen'
  | 'google-imagefx'
  | 'invideo'
  | 'vidiq';

export type ProviderMode = 'api' | 'external' | 'research';

export type ProviderDescriptor = {
  id: ProviderId;
  name: string;             // human display name
  blurb: string;            // 1-line description
  mode: ProviderMode;       // api = we call it, external = deeplink, research = read-only
  capabilities: ProviderCapability[];
  envKeys: string[];        // env vars that must be present for mode='api'
  externalUrl?: string;     // for mode='external'
  pricing?: string;         // human-readable, e.g. "~$0.04/image"
  signupUrl?: string;       // where to get API access
};

export type GenerateParams = {
  kind: AssetKind;
  prompt: string;
  /** Optional reference image URL (for img2img / animate / thumbnail style) */
  referenceImageUrl?: string;
  /** Aspect ratio hint */
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '1.91:1';
  /** Video-only: clip length seconds */
  durationSec?: number;
  /** Voice-only: voice id within the provider */
  voiceId?: string;
  /** Provider-specific freeform overrides */
  extra?: Record<string, unknown>;
};

export type GenerateResult =
  | {
      status: 'ready';
      assetUrl: string;
      mimeType?: string;
      meta?: Record<string, unknown>;
    }
  | {
      status: 'processing';
      jobId: string;              // opaque, provider-specific
      providerId: ProviderId;
      meta?: Record<string, unknown>;
    }
  | {
      status: 'external';
      openUrl: string;            // deeplink the UI opens in a new tab
      instructions?: string;
    }
  | {
      status: 'unconfigured';
      reason: string;
      signupUrl?: string;
    }
  | {
      status: 'error';
      error: string;
    };

export type StatusResult =
  | { status: 'ready'; assetUrl: string; mimeType?: string }
  | { status: 'processing'; progress?: number }
  | { status: 'error'; error: string };

export interface Provider {
  readonly descriptor: ProviderDescriptor;
  isConfigured(): boolean;
  supports(kind: AssetKind): boolean;
  generate(params: GenerateParams): Promise<GenerateResult>;
  /** Optional — only for providers that return jobIds. */
  getStatus?(jobId: string): Promise<StatusResult>;
}
