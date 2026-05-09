import type { Workbook } from './types';

export function workbookProgress(wb: Pick<Workbook, 'states'>): { done: number; skipped: number; total: number; pct: number } {
  const total = wb.states.length;
  const done = wb.states.filter((s) => s.output && !s.skipped).length;
  const skipped = wb.states.filter((s) => s.skipped).length;
  const pct = Math.round(((done + skipped) / total) * 100);
  return { done, skipped, total, pct };
}

export function sanitizeFilename(s: string): string {
  return (s || 'workbook').replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '_').slice(0, 80) || 'workbook';
}

export function formatDate(iso: string | number | Date): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelative(iso: string | number | Date): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function getMonthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
