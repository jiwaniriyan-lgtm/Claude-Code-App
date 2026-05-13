/**
 * Minimal SRT generator. Distributes a script across scenes proportionally to
 * their durations, then chunks each scene's slice into ~7-word subtitle lines.
 *
 * For word-level accuracy you'd run Whisper on the rendered audio — that lives
 * in the worker (worker/whisper.ts in a future slice).
 */

import type { Scene } from './timeline';

const WORDS_PER_LINE = 7;

function fmtTs(sec: number): string {
  const ms = Math.max(0, Math.round(sec * 1000));
  const hh = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
  const mm = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
  const ss = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
  const mss = String(ms % 1000).padStart(3, '0');
  return `${hh}:${mm}:${ss},${mss}`;
}

export function generateSrtFromScript(scenes: Scene[], script: string): string {
  const totalWords = script.trim().split(/\s+/).filter(Boolean);
  const totalDuration = scenes.reduce((a, s) => a + s.durationSec, 0);
  if (totalDuration <= 0 || totalWords.length === 0) return '';

  // Allocate words to scenes proportionally to their duration.
  let cursor = 0;
  const sceneWords: string[][] = scenes.map((s, idx) => {
    const share = s.durationSec / totalDuration;
    const count = idx === scenes.length - 1
      ? totalWords.length - cursor
      : Math.max(1, Math.round(share * totalWords.length));
    const slice = totalWords.slice(cursor, cursor + count);
    cursor += slice.length;
    return slice;
  });

  const lines: string[] = [];
  let cueIdx = 1;
  let timeCursor = 0;

  for (let s = 0; s < scenes.length; s++) {
    const words = sceneWords[s];
    const dur = scenes[s].durationSec;
    if (words.length === 0) {
      timeCursor += dur;
      continue;
    }
    const chunks: string[][] = [];
    for (let i = 0; i < words.length; i += WORDS_PER_LINE) chunks.push(words.slice(i, i + WORDS_PER_LINE));
    const perChunk = dur / chunks.length;

    for (let c = 0; c < chunks.length; c++) {
      const start = timeCursor + c * perChunk;
      const end = timeCursor + (c + 1) * perChunk - 0.05;
      lines.push(`${cueIdx++}`);
      lines.push(`${fmtTs(start)} --> ${fmtTs(end)}`);
      lines.push(chunks[c].join(' '));
      lines.push('');
    }
    timeCursor += dur;
  }

  return lines.join('\n');
}

/** Use scene captions as subtitles, one cue per scene. */
export function generateSrtFromCaptions(scenes: Scene[]): string {
  const lines: string[] = [];
  let cueIdx = 1;
  let t = 0;
  for (const s of scenes) {
    if (s.caption && s.caption.trim()) {
      lines.push(`${cueIdx++}`);
      lines.push(`${fmtTs(t)} --> ${fmtTs(t + s.durationSec - 0.05)}`);
      lines.push(s.caption.trim());
      lines.push('');
    }
    t += s.durationSec;
  }
  return lines.join('\n');
}
