'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATES } from '@/lib/prompts';
import { DURATIONS, PLATFORMS } from '@/lib/constants';
import type { Workbook, WorkbookStateData } from '@/lib/types';
import { useToast } from './Toast';

type Image = { id: string; state_n: number; kind: 'style' | 'thumbnail'; storage_path: string; url: string; ord: number };

type Props = { workbook: Workbook; images: Image[] };

export default function WorkbookEditor({ workbook: initial, images: initialImages }: Props) {
  const { showToast } = useToast();
  const router = useRouter();
  const [wb, setWb] = useState<Workbook>(initial);
  const [images, setImages] = useState<Image[]>(initialImages);
  const [idx, setIdx] = useState(initial.current_state_idx ?? 0);
  const [generating, setGenerating] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const def = STATES[idx];
  const state = wb.states[idx];

  function patchLocalState(partial: Partial<WorkbookStateData>) {
    setWb((prev) => ({
      ...prev,
      states: prev.states.map((s, i) => (i === idx ? { ...s, ...partial } : s)),
    }));
  }

  // Auto-save state changes (350ms debounce)
  function scheduleSave(payload: { input?: string; output?: string; skipped?: boolean; metadata?: Record<string, unknown> }) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await fetch(`/api/workbooks/${wb.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: { n: def.n, ...payload } }),
      });
    }, 350);
  }

  function setInput(v: string) {
    patchLocalState({ input: v });
    scheduleSave({ input: v });
  }
  function setOutput(v: string) {
    patchLocalState({ output: v });
    scheduleSave({ output: v });
  }
  function setMetadata(meta: Record<string, unknown>) {
    patchLocalState(meta);
    scheduleSave({ metadata: meta });
  }

  async function saveName(name: string) {
    setWb((p) => ({ ...p, name }));
    await fetch(`/api/workbooks/${wb.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  async function jumpTo(newIdx: number) {
    setIdx(newIdx);
    await fetch(`/api/workbooks/${wb.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_state_idx: newIdx }),
    });
  }

  async function skipState() {
    if (!def.optional) return;
    patchLocalState({ skipped: true, output: '' });
    await fetch(`/api/workbooks/${wb.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: { n: def.n, skipped: true, output: '' } }),
    });
    if (idx < STATES.length - 1) jumpTo(idx + 1);
  }

  async function generate() {
    setGenerating(true);
    const body: Record<string, unknown> = { input: state.input || '' };
    if (def.n === 2) body.transcripts = state.transcripts || [];
    if (def.n === 4) body.duration = state.duration || '10';
    if (def.n === 5) body.generateVideo = !!state.generateVideo;
    const res = await fetch(`/api/workbooks/${wb.id}/states/${def.n}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setGenerating(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Generation failed', 'error');
      return;
    }
    const { output } = await res.json();
    patchLocalState({ output, skipped: false });
    showToast('Generated!', 'success');
  }

  async function uploadImage(file: File, kind: 'style' | 'thumbnail') {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    fd.append('state_n', '2');
    const res = await fetch(`/api/workbooks/${wb.id}/images`, { method: 'POST', body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Upload failed', 'error');
      return;
    }
    const { image, url } = await res.json();
    setImages((p) => [...p, { ...image, url }]);
  }

  async function deleteImage(imgId: string) {
    const res = await fetch(`/api/workbooks/${wb.id}/images/${imgId}`, { method: 'DELETE' });
    if (res.ok) setImages((p) => p.filter((i) => i.id !== imgId));
  }

  const styleImgs = useMemo(() => images.filter((i) => i.state_n === 2 && i.kind === 'style'), [images]);
  const thumbImgs = useMemo(() => images.filter((i) => i.state_n === 2 && i.kind === 'thumbnail'), [images]);

  async function copyOutput() {
    if (!state.output) return;
    await navigator.clipboard.writeText(state.output);
    showToast('Copied!', 'success');
  }

  async function deleteWorkbook() {
    if (!confirm('Delete this workbook? This cannot be undone.')) return;
    const res = await fetch(`/api/workbooks/${wb.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/workbooks');
  }

  return (
    <div className="dd-shell">
      <button className="dd-back" onClick={() => router.push('/workbooks')}>← Workbooks</button>

      <div className="dd-header">
        <input
          className="dd-name-input"
          value={wb.name}
          onChange={(e) => saveName(e.target.value)}
        />
        <div className="dd-breadcrumb">
          <span className="niche-pill">{wb.niche}</span>
          <span className="arrow">→</span>
          <span className="idea">{wb.idea_title}</span>
        </div>
      </div>

      <div className="stepper-wrap">
        <div className="stepper">
          {STATES.map((s, i) => {
            const ws = wb.states[i];
            const cls = i === idx ? 'current' : ws?.skipped ? 'skipped' : ws?.output ? 'done' : '';
            const symbol = ws?.skipped ? '⊘' : ws?.output ? '✓' : s.n;
            return (
              <button key={s.n} type="button" className={`step ${cls}`} onClick={() => jumpTo(i)}>
                <div className="step-circle">{symbol}</div>
                <div className="step-label">{s.short}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="state-panel">
        <div className="state-num-row">
          <span className="state-num">State {def.n} of {STATES.length}</span>
          {def.optional && <span className="state-optional-tag">Optional</span>}
        </div>
        <h2 className="state-title">{def.title}</h2>
        <p className="state-helper">{def.helper}</p>

        {/* INPUT — varies by state kind */}
        {def.kind === 'simple' && (
          <>
            <div className="field-label">Your input <span className="field-hint">{def.optional ? 'optional' : 'required'}</span></div>
            <textarea
              className="dd-textarea dd-input"
              placeholder={def.inputPlaceholder}
              value={state.input}
              onChange={(e) => setInput(e.target.value)}
            />
          </>
        )}

        {def.kind === 'transcripts' && (
          <>
            <div className="field-label">Transcripts</div>
            <div className="transcript-list">
              {(state.transcripts || ['']).map((t, i) => (
                <div key={i} className="transcript-item">
                  <div className="transcript-head">
                    <span>Transcript {i + 1}</span>
                    {(state.transcripts || []).length > 1 && (
                      <button
                        type="button"
                        className="transcript-remove"
                        onClick={() => {
                          const arr = (state.transcripts || []).filter((_, j) => j !== i);
                          setMetadata({ transcripts: arr });
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    className="dd-textarea"
                    style={{ minHeight: 90 }}
                    placeholder="Paste a transcript..."
                    value={t}
                    onChange={(e) => {
                      const arr = [...(state.transcripts || [])];
                      arr[i] = e.target.value;
                      setMetadata({ transcripts: arr });
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-transcript-btn"
              onClick={() => setMetadata({ transcripts: [...(state.transcripts || []), ''] })}
            >
              + Add Another Transcript
            </button>

            <div className="image-section">
              <div className="image-section-title">🎬 Style reference images</div>
              <div className="image-section-hint">Used by GPT-4o vision to match style.</div>
              <div className="image-grid">
                {styleImgs.map((img) => (
                  <div key={img.id} className="image-preview">
                    <img src={img.url} alt="" />
                    <button type="button" className="image-remove" onClick={() => deleteImage(img.id)}>×</button>
                  </div>
                ))}
              </div>
              <label className="upload-btn">
                📸 Add style images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    for (const f of Array.from(e.target.files || [])) await uploadImage(f, 'style');
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            <div className="image-section">
              <div className="image-section-title">🖼 Thumbnail references</div>
              <div className="image-section-hint">3-4 thumbnails. AI matches their pattern.</div>
              <div className="image-grid">
                {thumbImgs.map((img) => (
                  <div key={img.id} className="image-preview">
                    <img src={img.url} alt="" />
                    <button type="button" className="image-remove" onClick={() => deleteImage(img.id)}>×</button>
                  </div>
                ))}
              </div>
              <label className="upload-btn">
                📸 Add thumbnail references
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    for (const f of Array.from(e.target.files || [])) await uploadImage(f, 'thumbnail');
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </>
        )}

        {def.kind === 'script' && (
          <>
            <div className="field-label">⏱ Target duration</div>
            <div className="duration-grid">
              {DURATIONS.map((d) => (
                <button
                  type="button"
                  key={d.v}
                  className={`duration-chip ${(state.duration || '10') === d.v ? 'selected' : ''}`}
                  onClick={() => setMetadata({ duration: d.v })}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="field-label">Notes (optional)</div>
            <textarea
              className="dd-textarea dd-input"
              placeholder={def.inputPlaceholder}
              value={state.input}
              onChange={(e) => setInput(e.target.value)}
            />
          </>
        )}

        {def.kind === 'imagevideo' && (
          <>
            <div className="field-label">Notes (optional)</div>
            <textarea
              className="dd-textarea dd-input"
              placeholder={def.inputPlaceholder}
              value={state.input}
              onChange={(e) => setInput(e.target.value)}
            />
            <label className="video-toggle">
              <input
                type="checkbox"
                checked={!!state.generateVideo}
                onChange={(e) => setMetadata({ generateVideo: e.target.checked })}
              />
              <span className="video-toggle-label">🎥 Also generate video clip prompts</span>
              <span className="video-toggle-hint">Runway / Sora / Kling-ready</span>
            </label>
          </>
        )}

        {def.kind === 'platform' && (
          <>
            <div className="field-label">Notes (optional)</div>
            <textarea
              className="dd-textarea dd-input"
              placeholder={def.inputPlaceholder}
              value={state.input}
              onChange={(e) => setInput(e.target.value)}
            />
          </>
        )}

        <button type="button" className="ai-gen-btn" disabled={generating} onClick={generate}>
          {generating ? <span className="spinner" /> : null}
          <span>{generating ? 'Generating...' : `⚡ Generate ${def.title}`}</span>
        </button>

        {/* OUTPUT */}
        {def.kind === 'platform' && state.output ? (
          <PlatformOutput output={state.output} />
        ) : (
          <>
            <div className="copy-row">
              {state.output ? <button className="mini-btn" onClick={copyOutput}>📋 Copy</button> : null}
            </div>
            <textarea
              className="dd-textarea dd-output"
              placeholder="AI output appears here. Click ⚡ Generate above."
              value={state.output}
              onChange={(e) => setOutput(e.target.value)}
            />
          </>
        )}
      </div>

      <div className="dd-nav">
        <button className="dd-nav-btn" disabled={idx === 0} onClick={() => jumpTo(idx - 1)}>← Previous</button>
        {def.optional && <button className="dd-nav-btn skip" onClick={skipState}>⊘ Skip</button>}
        <a className="dd-nav-btn export" href={`/api/workbooks/${wb.id}/export`}>⬇ Export</a>
        <button
          className="dd-nav-btn next"
          disabled={idx === STATES.length - 1}
          onClick={() => jumpTo(Math.min(STATES.length - 1, idx + 1))}
        >
          Next →
        </button>
        <button className="dd-nav-btn" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,.3)' }} onClick={deleteWorkbook}>
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

function PlatformOutput({ output }: { output: string }) {
  const [active, setActive] = useState<(typeof PLATFORMS)[number]>('YouTube');
  const sections = useMemo(() => parsePlatformOutput(output), [output]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <>
      <div className="platform-tabs">
        {PLATFORMS.map((p) => (
          <button
            type="button"
            key={p}
            className={`platform-tab ${p === active ? 'active' : ''}`}
            onClick={() => setActive(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="copy-row">
        <button className="mini-btn" onClick={() => copy(sections[active] || '')}>📋 Copy {active}</button>
        <button className="mini-btn" onClick={() => copy(output)}>📋 Copy All</button>
      </div>
      <textarea
        readOnly
        className="dd-textarea dd-output"
        style={{ minHeight: 320 }}
        value={sections[active] || '(empty)'}
      />
    </>
  );
}

function parsePlatformOutput(output: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of PLATFORMS) {
    const re = new RegExp(`===\\s*${p.toUpperCase()}\\s*===([\\s\\S]*?)(?===\\s*[A-Z]+\\s*===|$)`);
    const m = output.match(re);
    out[p] = (m?.[1] || '').trim();
  }
  return out;
}
