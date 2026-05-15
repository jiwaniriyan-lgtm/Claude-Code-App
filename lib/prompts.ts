/**
 * CopperAI prompts — ported VERBATIM from the MVP index.html STATES array.
 * These strings are the product IP. Do not paraphrase, "improve", or refactor
 * the wording without explicit owner approval. They have been iterated 5+
 * times against real outputs.
 */
import { DURATIONS, DURATION_WORDS } from './constants';
import type { PromptCtx, StateKind, SetupData } from './types';

function truncate(s: string | undefined, n: number): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export type StateDef = {
  n: number;
  title: string;
  short: string;
  kind: StateKind;
  optional: boolean;
  helper: string;
  inputPlaceholder?: string;
  maxTokens?: number;
  useVision?: boolean;
  isPlatform?: boolean;
  buildPrompt: (ctx: PromptCtx) => string;
};

export const STATES: StateDef[] = [
  {
    n: 1,
    title: 'Channel Link',
    short: 'Channel',
    kind: 'simple',
    optional: false,
    helper:
      'Paste a YouTube channel URL or @handle of a creator you want to model after. AI generates a 10-point research framework so you know exactly what to copy.',
    inputPlaceholder: 'https://www.youtube.com/@creatorhandle  or  @creatorhandle',
    buildPrompt: (ctx) =>
      'User wants to model a YouTube channel for the video idea: "' +
      ctx.ideaTitle +
      '" (niche: ' +
      ctx.niche +
      ').\nChannel reference: ' +
      (ctx.input || '(none — give a generic top-creator framework for this niche)') +
      '\n\nGenerate a 10-point analysis framework. For each point, give a specific question the user should answer by watching the channel. Cover: title formulas, hook patterns (first 8 sec), pacing & cuts/min, editing style, B-roll usage, voice/tone, thumbnail style, end-screen retention hooks, audience signals, upload cadence, plus 5 specific things to copy.\nNumbered list. ~150 words. No preamble.',
  },
  {
    n: 2,
    title: 'Transcripts & Visual References',
    short: 'References',
    kind: 'transcripts',
    optional: true,
    helper:
      "Paste 3+ transcripts from the channel's top videos. Upload reference images for the video style you want, plus 3-4 thumbnail references. AI uses ALL of this to match your style.",
    buildPrompt: (ctx) => {
      const ts = (ctx.transcripts || []).filter((t) => t.trim());
      const tBlock = ts.length
        ? ts.map((t, i) => 'TRANSCRIPT ' + (i + 1) + ':\n"""\n' + t + '\n"""').join('\n\n')
        : '(no transcripts provided — produce a generic high-CTR pattern guide for this niche)';
      const styleNote =
        (ctx.styleImagesCount ?? 0) > 0
          ? '\n\n[' +
            ctx.styleImagesCount +
            ' video-style reference image(s) attached — analyze their colors, framing, mood, lighting]'
          : '';
      const thumbNote =
        (ctx.thumbnailImagesCount ?? 0) > 0
          ? '\n[' +
            ctx.thumbnailImagesCount +
            ' thumbnail reference image(s) attached — analyze their composition, text style, emotional hooks, color contrast]'
          : '';
      return (
        'Analyze the following YouTube material for the niche "' +
        ctx.niche +
        '".\n\n' +
        tBlock +
        styleNote +
        thumbNote +
        '\n\nExtract:\n1) HOOK FORMULAS (first 30 sec) — 3 examples\n2) STORY STRUCTURE — beats and pacing\n3) RECURRING PHRASES & CTAs\n4) WORD CHOICE — vocabulary level, sentence length\n5) PATTERN INTERRUPTS — cliffhangers, reframes\n6) RETENTION TACTICS — open loops, foreshadows\n7) VISUAL STYLE PATTERNS (from style images): colors, framing, mood, lighting\n8) THUMBNAIL PATTERNS (from thumbnail images): composition, text style, emotion, color contrast\n\nLabeled sections. Be specific. Quote examples where possible.'
      );
    },
    useVision: true,
  },
  {
    n: 3,
    title: 'Analysis + Style DNA',
    short: 'Style DNA',
    kind: 'simple',
    optional: true,
    helper:
      'AI synthesizes everything from above into a reusable Style DNA — a compact template you can apply to every video going forward.',
    inputPlaceholder: 'Optional: your own style notes or constraints...',
    buildPrompt: (ctx) =>
      'Synthesize a compact, reusable STYLE DNA document for the niche "' +
      ctx.niche +
      '".\n\nChannel framework:\n' +
      truncate(ctx.prev[1], 800) +
      '\n\nTranscript + visual analysis:\n' +
      truncate(ctx.prev[2], 1000) +
      '\n\nUser notes: ' +
      (ctx.input || '(none)') +
      '\n\nOutput exactly these sections (with bold headers):\n1. HOOK FORMULA TEMPLATE — fill-in-the-blank format\n2. TONE & VOICE — 5 descriptive words + sample sentence\n3. PACING PATTERN — beats/min, cut frequency\n4. TOP 5 RHETORICAL DEVICES used\n5. VISUAL STYLE SIGNATURE — colors, framing, B-roll pattern\n6. THUMBNAIL DNA — composition, text rules, emotional hook\n7. CTA FORMAT — how they end videos\n\nUnder 400 words. This is a reference card.',
  },
  {
    n: 4,
    title: 'Script',
    short: 'Script',
    kind: 'script',
    optional: true,
    maxTokens: 6000,
    helper:
      'AI writes a complete script applying your Style DNA. Pick the target length below — the script will be sized to match.',
    inputPlaceholder: 'Optional: must-include points, banned phrases, target audience, story angles...',
    buildPrompt: (ctx) => {
      const dur = ctx.duration || '10';
      const wt = DURATION_WORDS[dur] || 1500;
      const durLabel = (DURATIONS.find((d) => d.v === dur) || ({} as { label?: string })).label || dur + ' min';
      return (
        'Write a complete YouTube video script.\n\nVIDEO IDEA: "' +
        ctx.ideaTitle +
        '"\nDESCRIPTION: ' +
        ctx.ideaDescription +
        '\nNICHE: ' +
        ctx.niche +
        '\nTARGET DURATION: ' +
        durLabel +
        ' (~' +
        wt +
        ' words)\n\nAPPLY THIS STYLE DNA:\n' +
        (truncate(ctx.prev[3], 1500) ||
          'Use a high-energy, high-retention YouTube style with strong hook, clear value, and emotional payoff.') +
        '\n\nUSER REQUIREMENTS: ' +
        (ctx.input || 'None.') +
        '\n\nStructure:\n[HOOK 0:00-0:15] — pattern interrupt opening\n[SETUP 0:15-1:00] — promise + stakes\n[SEGMENT 1, 2, 3...] — main content with retention bumps every ~90 sec\n[CLIMAX] — biggest payoff\n[CTA] — subscribe + next-video tease\n\nInclude [BRACKETED VISUAL CUES] every 30-60 sec. Write actual dialogue, not outline. Hit the ~' +
        wt +
        '-word target.'
      );
    },
  },
  {
    n: 5,
    title: 'Image + Video Prompts',
    short: 'Prompts',
    kind: 'imagevideo',
    optional: true,
    maxTokens: 3500,
    helper:
      'AI generates 8 image prompts (Midjourney v6 / DALL-E 3 ready) using your script and uploaded style references. Toggle on video prompts if you also want B-roll clips for Runway / Sora / Kling.',
    inputPlaceholder: 'Optional: aspect ratio, characters, banned elements...',
    buildPrompt: (ctx) => {
      const refImg =
        (ctx.styleImagesCount ?? 0) > 0
          ? '\n[' + ctx.styleImagesCount + ' style reference image(s) attached — match their colors, framing, mood]'
          : '';
      const wantVideo = ctx.generateVideo
        ? '\n\nALSO generate 6 SHORT VIDEO CLIP PROMPTS at the bottom (under header "=== VIDEO CLIP PROMPTS ===") for Runway Gen-3 / Sora / Kling. For each: CLIP [n], PROMPT (subject + action + camera movement + lighting + mood, ~30 words), DURATION 5-10s. Number 1-6.'
        : '';
      return (
        'Generate 8 IMAGE PROMPTS for key scenes in this video, ready for Midjourney v6 or DALL-E 3.\n\nScript:\n' +
        truncate(ctx.prev[4], 1500) +
        refImg +
        '\n\nUser constraints: ' +
        (ctx.input || '(default 16:9, photorealistic unless reference says otherwise)') +
        '\n\nFor EACH of the 8 image prompts:\nSCENE [n]: [short scene name]\nPROMPT: [detailed prompt with subject, action, camera angle, lighting, lens, mood, style descriptors] --ar 16:9 --style raw\n\nNumber 1-8.' +
        wantVideo
      );
    },
    useVision: true,
  },
  {
    n: 6,
    title: 'Voice Prompts',
    short: 'Voice',
    kind: 'simple',
    optional: true,
    helper:
      'AI generates ElevenLabs-ready voice direction — voice characteristics, stability/similarity sliders, per-section emphasis notes for the script.',
    inputPlaceholder: "Optional: gender preference, accent, voice you're using already...",
    buildPrompt: (ctx) =>
      'Generate ElevenLabs-ready VOICE DIRECTION for this video.\n\nScript:\n' +
      truncate(ctx.prev[4], 1500) +
      '\n\nStyle DNA tone:\n' +
      truncate(ctx.prev[3], 500) +
      '\n\nUser preferences: ' +
      (ctx.input || '(none)') +
      '\n\nOutput:\n1. VOICE PROFILE — gender, age range, accent, timbre (3 sentences)\n2. ELEVENLABS SETTINGS — stability (0-1), similarity (0-1), style exaggeration (0-1) with rationale\n3. SUGGESTED VOICES — 3 ElevenLabs preset names to try (e.g. Adam, Rachel, Bella)\n4. PACING — words per minute target\n5. PER-SECTION EMPHASIS — for hook, setup, segments, CTA — describe energy/pace shifts\n6. SSML / PAUSE NOTES — where to insert <break time="0.5s"/> tags',
  },
  {
    n: 7,
    title: 'Thumbnails (vidIQ-Style)',
    short: 'Thumbnails',
    kind: 'simple',
    optional: true,
    helper:
      'AI generates 4 thumbnail concepts using vidIQ-inspired CTR principles, matching the style of your uploaded thumbnail references.',
    inputPlaceholder: 'Optional: faces vs no-faces, must-include text, banned colors, paste vidIQ score data...',
    buildPrompt: (ctx) => {
      const refImg =
        (ctx.thumbnailImagesCount ?? 0) > 0
          ? '\n[' +
            ctx.thumbnailImagesCount +
            ' thumbnail reference image(s) attached — match their composition, text placement, color contrast, emotional hook]'
          : '';
      return (
        'Apply vidIQ-style high-CTR thumbnail principles to "' +
        ctx.ideaTitle +
        '".\n\nNiche: ' +
        ctx.niche +
        '\nThumbnail DNA from references: ' +
        truncate(ctx.prev[2], 600) +
        refImg +
        '\nUser input: ' +
        (ctx.input || '(none — apply best-practice defaults)') +
        '\n\nFirst output a THUMBNAIL DNA paragraph: primary emotional hook (curiosity/shock/desire/fear/aspiration), color contrast (target 80+, dominant + accent hex), text rules (3-5 words), pattern-break tactics, predicted CTR lift.\n\nThen for EACH of 4 distinct concepts (close-up face / object focus / split-screen / text-dominant):\nCONCEPT [n]: [name]\nTEXT OVERLAY: [3-5 words, ALL CAPS or Title Case]\nVISUAL PROMPT: [detailed Midjourney v6 prompt, 1280x720 viral YouTube style, --ar 16:9]\nPREDICTED CTR SCORE: [1-10] with one-line reasoning'
      );
    },
    useVision: true,
  },
  {
    n: 8,
    title: 'Title & Description (vidIQ-Style)',
    short: 'Title+Desc',
    kind: 'simple',
    optional: true,
    helper:
      'AI generates SEO-optimized YouTube titles and a full description using vidIQ-inspired keyword research. Built to rank in search and click in feed.',
    inputPlaceholder: 'Optional: paste vidIQ keyword data, target keywords, brand voice, links to include...',
    buildPrompt: (ctx) =>
      'Apply vidIQ-style SEO + keyword optimization for YouTube.\n\nVideo: "' +
      ctx.ideaTitle +
      '"\nNiche: ' +
      ctx.niche +
      '\nScript: ' +
      truncate(ctx.prev[4], 1200) +
      '\nUser keyword data / brand notes: ' +
      (ctx.input || '(none — apply best-practice defaults)') +
      '\n\nOutput exactly these sections:\n\n=== TITLE OPTIONS (5) ===\nFor EACH title (≤70 chars): the title, primary keyword, predicted CTR boost, why it works (1 line)\n\n=== KEYWORD STRATEGY ===\n10 keywords: 3 high-volume head terms, 4 mid-tail keywords, 3 long-tail keywords. For each note search intent (informational / commercial / navigational).\n\n=== DESCRIPTION ===\nFirst 125 chars (visible above the fold) — keyword-rich hook.\nThen full description (max 5000 chars) including: hook, summary, timestamps placeholder, links section, hashtags (3 max), end CTA.\n\n=== TAGS ===\n15 comma-separated YouTube tags (mix head/mid-tail/long-tail).\n\n=== PINNED COMMENT ===\n1 engagement-bait question that drives replies.',
  },
  {
    n: 9,
    title: 'Multi-Platform Publish Bundle',
    short: 'Platforms',
    kind: 'platform',
    optional: true,
    maxTokens: 5000,
    isPlatform: true,
    helper:
      'AI adapts the FULL video into ready-to-publish bundles for YouTube, Instagram Reels, TikTok, and Facebook — including script, image prompt, voice notes, thumbnail text, hashtags, and description.',
    inputPlaceholder: 'Optional: your @handles, target hashtags, brand voice, links...',
    buildPrompt: (ctx) =>
      'Adapt this video into FULL PUBLISH BUNDLES for 4 platforms. Use exact === PLATFORM === headers.\n\nVideo: "' +
      ctx.ideaTitle +
      '"\nNiche: ' +
      ctx.niche +
      '\nScript: ' +
      truncate(ctx.prev[4], 1500) +
      '\nTitle/desc strategy: ' +
      truncate(ctx.prev[8], 600) +
      '\nUser: ' +
      (ctx.input || '(none)') +
      '\n\nGenerate exactly these 4 sections:\n\n=== YOUTUBE ===\nTITLE: (≤70 chars, SEO-optimized)\nDESCRIPTION: (hook line + summary, ≤200 chars visible)\nTAGS: 15 comma-separated\nTHUMBNAIL TEXT: (3-5 words)\nIMAGE PROMPT: (1 hero image Midjourney prompt, 16:9)\nVOICE NOTE: (tone for the AI voice, e.g. "warm, deliberate")\nPINNED COMMENT: (engagement question)\n\n=== INSTAGRAM ===\nADAPTED SCRIPT: (~60 sec, vertical, hook in first 2 sec)\nCAPTION: (≤2200 chars, story-driven, emoji-friendly)\nHASHTAGS: 30 niche-mixed\nTHUMBNAIL TEXT: (cover frame text, 2-4 words)\nIMAGE PROMPT: (vertical 9:16 cover, Midjourney prompt)\nVOICE NOTE: (faster pace, energetic)\nON-SCREEN TEXT CUES: per beat\n\n=== TIKTOK ===\nADAPTED SCRIPT: (~45 sec, super-tight hook)\nCAPTION: (≤150 chars)\nHASHTAGS: 5 trending + niche\nTHUMBNAIL TEXT: (cover text)\nIMAGE PROMPT: (vertical 9:16)\nVOICE NOTE: (high-energy, conversational)\nTREND HOOK: (which trending sound/format style fits)\n\n=== FACEBOOK ===\nADAPTED SCRIPT: (3-5 min landscape, casual tone)\nPOST CAPTION: (1-2 sentences ending in a question)\nHASHTAGS: 5-8 niche-targeted\nTHUMBNAIL TEXT: (emotional hook, 3-5 words)\nIMAGE PROMPT: (1.91:1 landscape)\nVOICE NOTE: (warm, friendly, slower pace)\nTARGETING NOTES: audience demo + interests for boosting',
  },
];

/**
 * Top-funnel idea-generation prompt — also ported VERBATIM from MVP fetchIdeas().
 */
export function buildIdeaPrompt(setupData: SetupData, count: number): string {
  const transcripts = (setupData.transcripts || []).filter((t) => (t || '').trim());
  const lines: string[] = [];
  if (setupData.mode === 'clone') {
    lines.push(`The user wants to model their YouTube channel after: ${setupData.channelUrl}`);
    if (setupData.niche) lines.push(`Niche focus: ${setupData.niche}`);
  } else {
    // "Own ideas" path — prefer the two free-form boxes if present.
    if (setupData.ownTopic) {
      lines.push(`What kind of videos the user wants to make:\n"""\n${setupData.ownTopic.slice(0, 1500)}\n"""`);
    } else if (setupData.niche) {
      lines.push(`Niche: ${setupData.niche}`);
    }
    if (setupData.ownNotes && setupData.ownNotes.trim()) {
      lines.push(`Additional context the user provided:\n"""\n${setupData.ownNotes.slice(0, 6000)}\n"""`);
    }
  }
  if (transcripts.length) {
    lines.push(`\n${transcripts.length} reference transcript(s) showing the style they want:`);
    transcripts.forEach((t, i) => lines.push(`\nTRANSCRIPT ${i + 1}:\n"""\n${t.slice(0, 1500)}\n"""`));
  }
  if ((setupData.styleImages || []).length)
    lines.push(`\nThey uploaded ${setupData.styleImages.length} video-style reference image(s).`);
  if ((setupData.thumbnailImages || []).length)
    lines.push(`They uploaded ${setupData.thumbnailImages.length} thumbnail reference image(s).`);
  const dur = (DURATIONS.find((d) => d.v === setupData.duration) || ({} as { label?: string })).label || '10 min';
  lines.push(`\nTarget video length: ${dur}`);
  if (setupData.notes) lines.push(`User notes: ${setupData.notes}`);

  return `You are a viral YouTube content strategist. Generate ${count} unique, highly clickable YouTube video ideas using the context below.

CONTEXT:
${lines.join('\n')}

Generate ${count} ideas that match this creator's style and have viral potential.

For each idea return a JSON object with EXACTLY these fields:
- title: (string) compelling clickable YouTube title (max 80 chars)
- description: (string) 1-2 sentence hook/concept (max 120 chars)
- viral_score: (number) viral probability 70-99
- tier: (string) one of: "VIRAL HIT", "HIGH POTENTIAL", "TRENDING"
- outlier_factor: (string) psychological hook phrase (max 40 chars)
- viewer_payoff: (string) what viewer gains phrase (max 40 chars)

Return ONLY a valid JSON array of ${count} objects. No markdown, no explanation.`;
}
