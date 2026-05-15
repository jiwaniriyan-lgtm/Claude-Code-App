import {
  createPrediction,
  getPrediction,
  firstUrl,
  REPLICATE_IMAGE_MODEL,
  REPLICATE_VIDEO_MODEL,
} from '../replicate';
import type { Provider, GenerateParams, GenerateResult, StatusResult, AssetKind } from './types';

export const replicateProvider: Provider = {
  descriptor: {
    id: 'replicate',
    name: 'Replicate (Flux + Kling)',
    blurb: 'Flux 1.1 Pro for images, Kling 2.1 for video. Default workhorse.',
    mode: 'api',
    capabilities: ['image', 'video', 'thumbnail'],
    envKeys: ['REPLICATE_API_TOKEN'],
    pricing: '~$0.04/image, ~$0.30/video clip',
    signupUrl: 'https://replicate.com/account/api-tokens',
  },
  isConfigured() {
    return !!process.env.REPLICATE_API_TOKEN;
  },
  supports(kind: AssetKind) {
    return kind === 'image' || kind === 'video' || kind === 'thumbnail';
  },
  async generate(params: GenerateParams): Promise<GenerateResult> {
    if (!this.isConfigured()) {
      return { status: 'unconfigured', reason: 'REPLICATE_API_TOKEN not set', signupUrl: this.descriptor.signupUrl };
    }
    try {
      if (params.kind === 'video') {
        if (!params.referenceImageUrl) {
          return { status: 'error', error: 'Replicate video requires a referenceImageUrl (image-to-video).' };
        }
        const pred = await createPrediction<string>({
          model: REPLICATE_VIDEO_MODEL,
          input: {
            prompt: params.prompt,
            start_image: params.referenceImageUrl,
            duration: params.durationSec ?? 5,
            aspect_ratio: params.aspectRatio ?? '16:9',
            mode: 'standard',
          },
        });
        return { status: 'processing', jobId: pred.id, providerId: 'replicate', meta: { model: REPLICATE_VIDEO_MODEL } };
      }
      // image / thumbnail
      const pred = await createPrediction<string | string[]>({
        model: REPLICATE_IMAGE_MODEL,
        input: {
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio ?? (params.kind === 'thumbnail' ? '16:9' : '16:9'),
          output_format: 'webp',
          output_quality: 90,
        },
      });
      return { status: 'processing', jobId: pred.id, providerId: 'replicate', meta: { model: REPLICATE_IMAGE_MODEL } };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
  async getStatus(jobId: string): Promise<StatusResult> {
    try {
      const pred = await getPrediction(jobId);
      if (pred.status === 'succeeded') {
        const url = firstUrl(pred.output);
        if (!url) return { status: 'error', error: 'Replicate succeeded but no output URL' };
        return { status: 'ready', assetUrl: url };
      }
      if (pred.status === 'failed' || pred.status === 'canceled') {
        return { status: 'error', error: pred.error || pred.status };
      }
      return { status: 'processing' };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  },
};
