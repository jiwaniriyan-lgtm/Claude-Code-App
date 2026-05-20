/**
 * Google Vertex AI — Imagen 3 / Imagen 4.
 *
 * The "Google ImageFX" consumer product (labs.google) has no public API.
 * The same underlying model is available via Google Cloud → Vertex AI.
 *
 * Auth: GOOGLE_VERTEX_PROJECT_ID + GOOGLE_VERTEX_LOCATION + a service-account
 * access token (GOOGLE_VERTEX_ACCESS_TOKEN). Most apps generate the token
 * on-the-fly from a service-account JSON; for now we accept a pre-minted
 * token to keep this provider dependency-free.
 *
 * Docs: https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview
 */
import type { Provider, GenerateParams, GenerateResult, AssetKind } from './types';

export const vertexImagenProvider: Provider = {
  descriptor: {
    id: 'vertex-imagen',
    name: 'Google Imagen (Vertex AI)',
    blurb: 'Imagen 3/4 via Google Cloud. Same model that powers ImageFX. Excellent text-in-image.',
    mode: 'api',
    capabilities: ['image', 'thumbnail'],
    envKeys: ['GOOGLE_VERTEX_PROJECT_ID', 'GOOGLE_VERTEX_LOCATION', 'GOOGLE_VERTEX_ACCESS_TOKEN'],
    pricing: '~$0.02-$0.04/image (Imagen 3)',
    signupUrl: 'https://console.cloud.google.com/vertex-ai',
  },
  isConfigured() {
    return (
      !!process.env.GOOGLE_VERTEX_PROJECT_ID &&
      !!process.env.GOOGLE_VERTEX_LOCATION &&
      !!process.env.GOOGLE_VERTEX_ACCESS_TOKEN
    );
  },
  supports(kind: AssetKind) {
    return kind === 'image' || kind === 'thumbnail';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return {
        status: 'unconfigured',
        reason: 'Vertex AI not configured. Need GOOGLE_VERTEX_PROJECT_ID + LOCATION + ACCESS_TOKEN.',
        signupUrl: this.descriptor.signupUrl,
      };
    }
    try {
      const project = process.env.GOOGLE_VERTEX_PROJECT_ID!;
      const location = process.env.GOOGLE_VERTEX_LOCATION!;
      const model = (params.extra?.model as string) || 'imagen-3.0-generate-002';
      const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:predict`;
      const body = {
        instances: [{ prompt: params.prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: params.aspectRatio || '16:9',
          safetyFilterLevel: 'block_only_high',
          personGeneration: 'allow_adult',
        },
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_VERTEX_ACCESS_TOKEN!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { status: 'error', error: `Vertex Imagen ${res.status}: ${await res.text()}` };
      }
      const json = (await res.json()) as { predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }> };
      const pred = json.predictions?.[0];
      if (!pred?.bytesBase64Encoded) return { status: 'error', error: 'Vertex Imagen: no image bytes' };
      const mime = pred.mimeType || 'image/png';
      return { status: 'ready', assetUrl: `data:${mime};base64,${pred.bytesBase64Encoded}`, mimeType: mime };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
};
