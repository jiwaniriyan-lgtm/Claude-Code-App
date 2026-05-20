/**
 * Word-level subtitle generation via OpenAI Whisper.
 *
 * Posts the rendered voiceover to /v1/audio/transcriptions with
 * response_format=verbose_json + timestamp_granularities=['word'] and turns
 * the word timings into a tight SRT (4-7 words per cue).
 */

import * as fs from 'fs/promises';

const OPENAI_BASE = 'https://api.openai.com/v1';

type WhisperWord = { word: string; start: number; end: number };
type WhisperResp = { words?: WhisperWord[]; segments?: { start: number; end: number; text: string }[]; text?: string };

const WORDS_PER_CUE = 5;
const MIN_CUE_SEC = 1.0;
const MAX_CUE_SEC = 4.0;

function fmt(sec: number): string {
  const ms = Math.max(0, Math.round(sec * 1000));
  const hh = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
  const mm = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
  const ss = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
  const mss = String(ms % 1000).padStart(3, '0');
  return `${hh}:${mm}:${ss},${mss}`;
}

export async function transcribeToSrt(audioPath: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set in worker env; cannot transcribe');

  const buf = await fs.readFile(audioPath);
  const fd = new FormData();
  // FormData accepts a Blob; use a Uint8Array view to avoid Buffer-typing issues.
  fd.set('file', new Blob([new Uint8Array(buf)], { type: 'audio/mpeg' }), 'voiceover.mp3');
  fd.set('model', 'whisper-1');
  fd.set('response_format', 'verbose_json');
  fd.append('timestamp_granularities[]', 'word');
  fd.append('timestamp_granularities[]', 'segment');

  const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`whisper ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as WhisperResp;

  // Prefer word timings; fall back to segments.
  if (json.words && json.words.length > 0) return wordsToSrt(json.words);
  if (json.segments && json.segments.length > 0) {
    const out: string[] = [];
    json.segments.forEach((s, i) => {
      out.push(String(i + 1), `${fmt(s.start)} --> ${fmt(s.end)}`, s.text.trim(), '');
    });
    return out.join('\n');
  }
  return '';
}

function wordsToSrt(words: WhisperWord[]): string {
  const lines: string[] = [];
  let idx = 1;
  let cue: WhisperWord[] = [];
  let cueStart = words[0]?.start ?? 0;

  function flush() {
    if (cue.length === 0) return;
    const start = cue[0].start;
    const end = cue[cue.length - 1].end;
    lines.push(String(idx++), `${fmt(start)} --> ${fmt(end)}`, cue.map((w) => w.word).join(' ').trim(), '');
    cue = [];
  }

  for (const w of words) {
    if (cue.length === 0) cueStart = w.start;
    cue.push(w);
    const dur = w.end - cueStart;
    const punctuated = /[.!?]$/.test(w.word.trim());
    if (cue.length >= WORDS_PER_CUE || dur >= MAX_CUE_SEC || (punctuated && dur >= MIN_CUE_SEC)) {
      flush();
    }
  }
  flush();
  return lines.join('\n');
}
