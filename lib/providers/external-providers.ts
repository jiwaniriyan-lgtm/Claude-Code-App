/**
 * Providers without a public generative API (or with research-only roles).
 *
 *   • VidIQ      — keyword/outlier research. Wire into Step 1 ideation, not asset picker.
 *   • InVideo    — enterprise-only API. UI deeplinks to invideo.io with prompt prefilled.
 *   • ImageFX    — Google's consumer product; no public API. Recommend Vertex Imagen
 *                  (same model) or open ImageFX in a tab.
 *
 * All three return either `external` or `research` results so the UI can
 * render an "Open in [provider]" button instead of attempting generation.
 */
import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

export const vidIqProvider: Provider = {
  descriptor: {
    id: 'vidiq',
    name: 'VidIQ (research only)',
    blurb: 'YouTube keyword + outlier research. Used in Step 1 for niche research — not for asset generation.',
    mode: 'research',
    capabilities: ['research'],
    envKeys: [],
    externalUrl: 'https://app.vidiq.com',
    signupUrl: 'https://vidiq.com',
  },
  isConfigured() {
    return true;
  },
  supports(_kind: AssetKind) {
    return false;
  },
  async generate(_params: GenerateParams): Promise<GenerateResult> {
    return {
      status: 'external',
      openUrl: 'https://app.vidiq.com',
      instructions:
        'VidIQ is a research tool, not a generator. Use it in Step 1 (ideation / keyword research). For images and videos pick a different provider.',
    };
  },
};

export const inVideoProvider: Provider = {
  descriptor: {
    id: 'invideo',
    name: 'InVideo (open in tab)',
    blurb: 'No public generation API. Click to open InVideo in a new tab with your prompt copied.',
    mode: 'external',
    capabilities: ['video', 'thumbnail'],
    envKeys: [],
    externalUrl: 'https://invideo.io',
    signupUrl: 'https://invideo.io/api',
  },
  isConfigured() {
    return true; // always "available" — just opens externally
  },
  supports(kind: AssetKind) {
    return kind === 'video' || kind === 'thumbnail';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    const url = `https://invideo.io/make/?prompt=${encodeURIComponent(params.prompt)}`;
    return {
      status: 'external',
      openUrl: url,
      instructions:
        'InVideo has no public generation API. Opening in a new tab with your prompt — generate there, then download and re-upload the result here.',
    };
  },
};

export const googleImageFxProvider: Provider = {
  descriptor: {
    id: 'google-imagefx',
    name: 'Google ImageFX (open in tab)',
    blurb: 'Consumer product, no public API. Use Vertex Imagen for programmatic access, or open ImageFX manually.',
    mode: 'external',
    capabilities: ['image', 'thumbnail'],
    envKeys: [],
    externalUrl: 'https://labs.google/fx/tools/image-fx',
  },
  isConfigured() {
    return true;
  },
  supports(kind: AssetKind) {
    return kind === 'image' || kind === 'thumbnail';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    return {
      status: 'external',
      openUrl: 'https://labs.google/fx/tools/image-fx',
      instructions:
        `ImageFX has no API. Copy this prompt and paste it in ImageFX:\n\n${params.prompt}`,
    };
  },
};
