/**
 * Parse workbook state outputs into a storyboard-ready shape:
 *   - script (state 4 output, stripped of bracketed visual cues)
 *   - imagePrompts (state 5 output, "SCENE n: ..." / "PROMPT: ..." blocks)
 *   - videoPrompts (optional, "=== VIDEO CLIP PROMPTS ===" block)
 *   - voiceNotes (state 6 output, raw)
 *
 * The prompts use the format defined in lib/prompts.ts states 4-6.
 */

export type ParsedScenePrompt = {
  scene: number;
  name: string;
  prompt: string;
};

export type ParsedStoryboard = {
  script: string;
  scriptForVoice: string;          // visual cues stripped
  imagePrompts: ParsedScenePrompt[];
  videoPrompts: ParsedScenePrompt[];
  voiceNotes: string;
};

/** Remove [BRACKETED CUES] but keep the actual dialog. */
export function stripVisualCues(script: string): string {
  return script
    .replace(/\[[^\]]+\]/g, '')   // remove [HOOK 0:00-0:15] style cues
    .replace(/^\s*$\n/gm, '')      // collapse empty lines
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse a state-5 output. Robust to formatting drift — accepts
 *   SCENE 1: Some Name
 *   PROMPT: A cinematic shot of ... --ar 16:9 --style raw
 * plus tolerates blank lines and case variants.
 */
export function parseImagePrompts(out: string): ParsedScenePrompt[] {
  if (!out) return [];

  // If video prompts section exists, only consider the IMAGE half.
  const splitIdx = out.search(/===\s*VIDEO\s+CLIP\s+PROMPTS\s*===/i);
  const imageHalf = splitIdx >= 0 ? out.slice(0, splitIdx) : out;

  const re = /SCENE\s*\[?(\d+)\]?\s*[:\-]?\s*([^\n]*?)\n+(?:PROMPT|prompt)\s*:?\s*([\s\S]*?)(?=\n+SCENE\s*\[?\d+\]?|$)/gi;
  const out_: ParsedScenePrompt[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(imageHalf)) !== null) {
    const scene = parseInt(m[1], 10);
    const name = (m[2] || '').trim().replace(/[—\-:]+$/, '');
    const prompt = m[3].trim();
    if (prompt) out_.push({ scene, name, prompt });
  }
  return out_;
}

export function parseVideoPrompts(out: string): ParsedScenePrompt[] {
  if (!out) return [];
  const splitIdx = out.search(/===\s*VIDEO\s+CLIP\s+PROMPTS\s*===/i);
  if (splitIdx < 0) return [];
  const half = out.slice(splitIdx);

  const re = /CLIP\s*\[?(\d+)\]?\s*[:\-]?\s*([^\n]*?)\n+(?:PROMPT|prompt)\s*:?\s*([\s\S]*?)(?=\n+CLIP\s*\[?\d+\]?|$)/gi;
  const out_: ParsedScenePrompt[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(half)) !== null) {
    out_.push({
      scene: parseInt(m[1], 10),
      name: (m[2] || '').trim(),
      prompt: m[3].trim().replace(/DURATION[^\n]*\n?/i, '').trim(),
    });
  }
  return out_;
}

export function buildStoryboard(stateOutputs: Record<number, string>): ParsedStoryboard {
  const script = stateOutputs[4] || '';
  const s5 = stateOutputs[5] || '';
  const s6 = stateOutputs[6] || '';
  return {
    script,
    scriptForVoice: stripVisualCues(script),
    imagePrompts: parseImagePrompts(s5),
    videoPrompts: parseVideoPrompts(s5),
    voiceNotes: s6,
  };
}
