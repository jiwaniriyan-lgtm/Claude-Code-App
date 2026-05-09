import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!apiKey && process.env.NODE_ENV !== 'test') {
  console.warn('[openai] OPENAI_API_KEY not set — server proxy will fail until you set it.');
}

export const openai = new OpenAI({ apiKey: apiKey || 'dummy-build-time-key' });

export type CallOptions = {
  prompt: string;
  images?: string[]; // public URLs or data URLs (vision)
  temperature?: number;
  maxTokens?: number;
  model?: string;
};

export type CallResult = {
  content: string;
  tokensIn: number;
  tokensOut: number;
};

/**
 * Single chat completion. Wraps the same shape as the MVP's callOpenAI() but
 * server-side, with a single owner-controlled API key.
 */
export async function callOpenAI(opts: CallOptions): Promise<CallResult> {
  const { prompt, images = [], temperature = 0.8, maxTokens = 2000 } = opts;

  let content: OpenAI.Chat.Completions.ChatCompletionContentPart[] | string;
  if (images.length > 0) {
    content = [
      { type: 'text', text: prompt },
      ...images.map(
        (url): OpenAI.Chat.Completions.ChatCompletionContentPartImage => ({
          type: 'image_url',
          image_url: { url },
        }),
      ),
    ];
  } else {
    content = prompt;
  }

  const completion = await openai.chat.completions.create({
    model: opts.model || model,
    messages: [{ role: 'user', content: content as OpenAI.Chat.Completions.ChatCompletionUserMessageParam['content'] }],
    temperature,
    max_tokens: maxTokens,
  });

  return {
    content: completion.choices[0]?.message?.content?.trim() || '',
    tokensIn: completion.usage?.prompt_tokens ?? 0,
    tokensOut: completion.usage?.completion_tokens ?? 0,
  };
}

// gpt-4o-mini pricing (2024-10): $0.150 / 1M input, $0.600 / 1M output.
// Override per-model as needed.
export function estimateCostUsd(tokensIn: number, tokensOut: number, _model = model): number {
  return (tokensIn * 0.15 + tokensOut * 0.6) / 1_000_000;
}
