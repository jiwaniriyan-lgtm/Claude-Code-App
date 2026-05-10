import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-7';

if (!apiKey && process.env.NODE_ENV !== 'test') {
  console.warn('[anthropic] ANTHROPIC_API_KEY not set — server proxy will fail until you set it.');
}

export const anthropic = new Anthropic({ apiKey: apiKey || 'dummy-build-time-key' });

export type CallOptions = {
  prompt: string;
  images?: string[];
  maxTokens?: number;
  model?: string;
};

export type CallResult = {
  content: string;
  tokensIn: number;
  tokensOut: number;
};

type ImageMediaType = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';

function buildImageBlock(url: string): Anthropic.ImageBlockParam | null {
  if (url.startsWith('data:')) {
    const match = url.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return {
      type: 'image',
      source: { type: 'base64', media_type: match[1] as ImageMediaType, data: match[2] },
    };
  }
  return { type: 'image', source: { type: 'url', url } };
}

export async function callClaude(opts: CallOptions): Promise<CallResult> {
  const { prompt, images = [], maxTokens = 4096 } = opts;

  const content: Anthropic.ContentBlockParam[] = [];
  for (const url of images) {
    const block = buildImageBlock(url);
    if (block) content.push(block);
  }
  content.push({ type: 'text', text: prompt });

  const response = await anthropic.messages.create({
    model: opts.model || model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return {
    content: text,
    tokensIn: response.usage.input_tokens,
    tokensOut: response.usage.output_tokens,
  };
}

// claude-opus-4-7 pricing: $5 / 1M input, $25 / 1M output.
export function estimateCostUsd(tokensIn: number, tokensOut: number): number {
  return (tokensIn * 5 + tokensOut * 25) / 1_000_000;
}
