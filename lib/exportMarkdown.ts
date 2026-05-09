import type { Workbook } from './types';
import { STATES } from './prompts';
import { sanitizeFilename } from './utils';

/** Markdown export — port of MVP exportWorkbook(). */
export function workbookToMarkdown(wb: Workbook): { filename: string; markdown: string } {
  const lines: string[] = [];
  lines.push(`# ${wb.name}`);
  lines.push('');
  lines.push(`**Niche:** ${wb.niche}`);
  lines.push(`**Idea:** ${wb.idea_title}`);
  if (wb.idea_description) lines.push(`**Description:** ${wb.idea_description}`);
  if (wb.idea_score) lines.push(`**Viral Score:** ${wb.idea_score}%`);
  lines.push(`**Created:** ${new Date(wb.created_at).toLocaleString()}`);
  lines.push(`**Updated:** ${new Date(wb.updated_at).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  STATES.forEach((def, i) => {
    const s = wb.states[i];
    if (!s) return;
    lines.push(`## State ${def.n} — ${def.title}`);
    lines.push('');
    if (s.skipped) {
      lines.push('_(skipped)_');
      lines.push('');
      return;
    }
    if (s.input) {
      lines.push('**Input:**');
      lines.push('');
      lines.push(s.input);
      lines.push('');
    }
    if (s.output) {
      lines.push('**Output:**');
      lines.push('');
      lines.push(s.output);
      lines.push('');
    }
    if (def.n === 2) {
      const styleN = s.styleImages?.length || 0;
      const thumbN = s.thumbnailImages?.length || 0;
      if (styleN) lines.push(`_${styleN} style reference image(s) attached._`);
      if (thumbN) lines.push(`_${thumbN} thumbnail reference image(s) attached._`);
      lines.push('');
    }
    if (def.n === 4 && s.duration) {
      lines.push(`_Target duration: ${s.duration} min_`);
      lines.push('');
    }
    if (def.n === 5 && s.generateVideo) {
      lines.push('_Includes video clip prompts._');
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  });

  return {
    filename: sanitizeFilename(wb.name) + '.md',
    markdown: lines.join('\n'),
  };
}
