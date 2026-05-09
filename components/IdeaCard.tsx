'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';
import type { Idea, SavedIdea } from '@/lib/types';

type Props = {
  idea: Idea | SavedIdea;
  index: number;
  niche?: string;
  isHistory?: boolean;
  onDelete?: (id: string) => void;
  initialSaved?: boolean;
  setupContext?: {
    setupMode: 'clone' | 'own';
    state1Input: string;
    state2Transcripts: string[];
    state2StyleImagePaths: string[];
    state2ThumbImagePaths: string[];
    state4Duration: string;
  };
};

export default function IdeaCard({ idea, index, niche, isHistory, onDelete, initialSaved, setupContext }: Props) {
  const { showToast } = useToast();
  const router = useRouter();
  const [saved, setSaved] = useState(!!initialSaved);
  const [busy, setBusy] = useState(false);

  const score = Math.min(99, Math.max(70, idea.viral_score || 85));
  const tier = (idea.tier || 'VIRAL HIT').toUpperCase();
  const tierClass = tier === 'VIRAL HIT' ? 'viral-hit' : tier === 'HIGH POTENTIAL' ? 'high-pot' : 'trending';
  const color = score >= 92 ? '#22c55e' : score >= 85 ? '#a855f7' : '#eab308';
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ - (score / 100) * circ;

  async function copyTitle() {
    try {
      await navigator.clipboard.writeText(idea.title);
      showToast('Copied!', 'success');
    } catch {
      showToast('Copy failed', 'error');
    }
  }

  async function save() {
    if (saved) return;
    setBusy(true);
    const res = await fetch('/api/ideas/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: idea.title,
        description: idea.description,
        viral_score: idea.viral_score,
        tier: idea.tier,
        outlier_factor: idea.outlier_factor,
        viewer_payoff: idea.viewer_payoff,
        niche: niche || ('niche' in idea ? idea.niche : '') || '',
      }),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      showToast('Saved to history!', 'success');
    } else {
      showToast('Save failed', 'error');
    }
  }

  async function deleteSaved() {
    if (!('id' in idea)) return;
    setBusy(true);
    const res = await fetch(`/api/ideas/${idea.id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) {
      onDelete?.(idea.id);
      showToast('Removed', 'success');
    } else {
      showToast('Delete failed', 'error');
    }
  }

  async function deepDive() {
    setBusy(true);
    const useSetup = !isHistory && setupContext;
    const body = {
      name: idea.title.length > 50 ? idea.title.slice(0, 50) + '…' : idea.title,
      niche: niche || ('niche' in idea ? idea.niche : '') || 'General',
      ideaTitle: idea.title,
      ideaDescription: idea.description || '',
      ideaScore: idea.viral_score || 85,
      setupMode: useSetup ? setupContext!.setupMode : null,
      prefill: useSetup
        ? {
            state1Input: setupContext!.setupMode === 'clone' ? setupContext!.state1Input : '',
            state1Skipped: setupContext!.setupMode === 'own',
            state2Transcripts: setupContext!.state2Transcripts,
            state2StyleImagePaths: setupContext!.state2StyleImagePaths,
            state2ThumbImagePaths: setupContext!.state2ThumbImagePaths,
            state4Duration: setupContext!.state4Duration,
            startAtIdx: 3, // jump to State 4 (Script)
          }
        : undefined,
    };
    const res = await fetch('/api/workbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Could not start workbook', 'error');
      return;
    }
    const { workbook } = await res.json();
    router.push(`/workbooks/${workbook.id}`);
  }

  return (
    <div className="idea-card">
      <div className="card-top">
        <div className="idea-meta">
          <div className="idea-num">Idea #{index + 1}</div>
          {isHistory && 'niche' in idea && idea.niche ? <span className="history-niche-tag">{idea.niche}</span> : null}
          <span className={`tag ${tierClass}`}>{tier}</span>
        </div>
        <div className="viral-score" aria-label={`Viral score ${score}%`}>
          <svg viewBox="0 0 68 68">
            <circle className="track" cx="34" cy="34" r={r} />
            <circle className="fill" cx="34" cy="34" r={r} stroke={color} strokeDasharray={circ} strokeDashoffset={dash} />
          </svg>
          <div className="label">
            <span className="pct" style={{ color }}>{score}%</span>
            <span className="word">VIRAL</span>
          </div>
        </div>
      </div>
      <div className="idea-title">{idea.title}</div>
      <div className="idea-desc">{idea.description}</div>
      <div className="factors">
        <div className="factor-box outlier">
          <div className="factor-label">🚀 Outlier Factor</div>
          <div className="factor-value">{idea.outlier_factor}</div>
        </div>
        <div className="factor-box payoff">
          <div className="factor-label">🎯 Viewer Payoff</div>
          <div className="factor-value">{idea.viewer_payoff}</div>
        </div>
      </div>
      <div className="card-actions">
        <button className="action-btn deep-btn" disabled={busy} onClick={deepDive}>
          🚀 Deep Dive →
        </button>
        <div className="action-row">
          <button className="action-btn" onClick={copyTitle}>📋 Copy</button>
          {isHistory ? (
            <button className="action-btn delete-btn" disabled={busy} onClick={deleteSaved}>🗑 Remove</button>
          ) : saved ? (
            <button className="action-btn saved-btn" disabled>✓ Saved</button>
          ) : (
            <button className="action-btn save-btn" disabled={busy} onClick={save}>💾 Save</button>
          )}
        </div>
      </div>
    </div>
  );
}
