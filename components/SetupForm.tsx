'use client';

import { useState } from 'react';
import { compressImage } from '@/lib/imageCompress';
import { DURATIONS } from '@/lib/constants';
import { useToast } from './Toast';
import IdeaCard from './IdeaCard';
import type { Idea } from '@/lib/types';

type Mode = 'clone' | 'own' | '';

type StagedImage = { dataUrl: string; blob: Blob };

export default function SetupForm() {
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('');
  const [channelUrl, setChannelUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [transcripts, setTranscripts] = useState<string[]>(['', '', '']);
  const [styleImages, setStyleImages] = useState<StagedImage[]>([]);
  const [thumbImages, setThumbImages] = useState<StagedImage[]>([]);
  const [duration, setDuration] = useState('10');
  const [notes, setNotes] = useState('');
  // "Have my own idea" mode — two free-form boxes instead of niche/uploads
  const [ownTopic, setOwnTopic] = useState('');
  const [ownNotes, setOwnNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  // Image paths after attaching to a workbook (lazy-uploaded on Deep Dive)
  // For setup-form purposes the images stay client-side until Deep Dive is clicked.

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>, kind: 'style' | 'thumbnail') {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const f of files) {
      try {
        const { blob, dataUrl } = await compressImage(f);
        if (kind === 'style') setStyleImages((p) => [...p, { dataUrl, blob }]);
        else setThumbImages((p) => [...p, { dataUrl, blob }]);
      } catch {
        showToast(`Could not read ${f.name}`, 'error');
      }
    }
  }

  function addTranscript() {
    setTranscripts((p) => [...p, '']);
  }

  function removeTranscript(idx: number) {
    setTranscripts((p) => p.filter((_, i) => i !== idx));
  }

  function setTranscriptAt(idx: number, val: string) {
    setTranscripts((p) => p.map((t, i) => (i === idx ? val : t)));
  }

  async function generate() {
    if (!mode) {
      showToast('Pick "Clone a Channel" or "Have My Own Ideas" first', 'error');
      return;
    }
    if (mode === 'clone' && !channelUrl.trim()) {
      showToast('Paste the YouTube channel URL or @handle', 'error');
      return;
    }
    if (mode === 'own' && !ownTopic.trim()) {
      showToast('Tell me what kind of videos you want to make', 'error');
      return;
    }

    setLoading(true);
    setIdeas([]);

    // For "own" mode we send the two free-form boxes and derive niche from
    // the first line of the topic box. Clone mode still sends transcripts +
    // images so the rich research path stays intact.
    const derivedNiche = mode === 'own' ? ownTopic.split('\n')[0].slice(0, 60) : niche;
    const setupData = {
      mode,
      channelUrl,
      niche: derivedNiche,
      transcripts: mode === 'clone' ? transcripts : [],
      styleImages: mode === 'clone' ? styleImages.map((s) => s.dataUrl) : [],
      thumbnailImages: mode === 'clone' ? thumbImages.map((s) => s.dataUrl) : [],
      duration,
      notes: mode === 'own' ? ownNotes : notes,
      ownTopic: mode === 'own' ? ownTopic : undefined,
      ownNotes: mode === 'own' ? ownNotes : undefined,
    };

    const res = await fetch('/api/ideas/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setupData }),
    });
    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Generation failed', 'error');
      return;
    }
    const { ideas: list } = (await res.json()) as { ideas: Idea[] };
    setIdeas(list);
    showToast(`Generated ${list.length} ideas!`, 'success');
  }

  const labelNiche =
    mode === 'clone'
      ? niche || `clone of ${channelUrl}`
      : ownTopic.split('\n')[0].slice(0, 60) || niche;

  return (
    <>
      <div className="generator">
        <div className="gen-card">
          <div className="section-label">Pick how you want to start</div>
          <select className="setup-dropdown" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="">— Select an option —</option>
            <option value="clone">🎯 Clone a YouTube Channel</option>
            <option value="own">✨ Have My Own Ideas</option>
          </select>

          {mode === 'clone' && (
            <>
              <div className="section-label">YouTube channel</div>
              <input
                className="setup-input"
                placeholder="https://www.youtube.com/@creatorhandle  or  @creatorhandle"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
              />
              <input
                className="setup-input"
                placeholder="Optional niche/category"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </>
          )}

          {mode === 'own' && (
            <>
              <div className="section-label">What kind of videos do you want to make?</div>
              <textarea
                className="dd-textarea"
                style={{ minHeight: 80, marginBottom: 14 }}
                placeholder="e.g. AI productivity tutorials for solopreneurs. Tone: high-energy, practical. Length 8-12 min. Target: indie hackers."
                value={ownTopic}
                onChange={(e) => setOwnTopic(e.target.value)}
                maxLength={1200}
              />
              <div className="section-label">Paste anything else (scripts, ideas, examples, links)</div>
              <textarea
                className="dd-textarea"
                style={{ minHeight: 120, marginBottom: 4 }}
                placeholder="Paste raw notes, a rough script, competitor video URLs, bullet ideas — the AI will mine this to generate viral ideas in your style."
                value={ownNotes}
                onChange={(e) => setOwnNotes(e.target.value)}
                maxLength={8000}
              />
              <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 18 }}>
                No need to upload thumbnails or transcripts in this mode — just describe what you want and paste any references you have.
              </div>

              <div className="section-label">⏱ Target video length</div>
              <div className="duration-grid">
                {DURATIONS.map((d) => (
                  <button
                    type="button"
                    key={d.v}
                    className={`duration-chip ${duration === d.v ? 'selected' : ''}`}
                    onClick={() => setDuration(d.v)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <button type="button" className="gen-btn" onClick={generate} disabled={loading} style={{ marginTop: 18 }}>
                {loading ? <span className="spinner" /> : null}
                <span>{loading ? 'Generating...' : '⚡ Generate 10 Viral Ideas'}</span>
              </button>
            </>
          )}

          {mode === 'clone' && (
            <>
              <div className="setup-divider" />
              <div className="section-label">Reference transcripts</div>
              <div className="transcript-list">
                {transcripts.map((t, i) => (
                  <div key={i} className="transcript-item">
                    <div className="transcript-head">
                      <span>Transcript {i + 1}</span>
                      {transcripts.length > 1 && (
                        <button type="button" className="transcript-remove" onClick={() => removeTranscript(i)}>
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      className="dd-textarea"
                      style={{ minHeight: 90 }}
                      placeholder="Paste the transcript of a top video..."
                      value={t}
                      onChange={(e) => setTranscriptAt(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <button type="button" className="add-transcript-btn" onClick={addTranscript}>
                + Add Another Transcript
              </button>

              <div className="section-label">🎬 Style reference images</div>
              <div className="image-section">
                <div className="image-section-hint">
                  Upload screenshots of the video style you want (5-10 frames recommended). AI sees these via vision.
                </div>
                <div className="image-grid">
                  {styleImages.map((img, i) => (
                    <div key={i} className="image-preview">
                      <img src={img.dataUrl} alt="" />
                      <button
                        type="button"
                        className="image-remove"
                        onClick={() => setStyleImages((p) => p.filter((_, j) => j !== i))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="upload-btn">
                  📸 Add style images
                  <input type="file" accept="image/*" multiple onChange={(e) => onPickImage(e, 'style')} />
                </label>
              </div>

              <div className="section-label">🖼 Thumbnail references</div>
              <div className="image-section">
                <div className="image-section-hint">3-4 thumbnails from the channel. AI matches their pattern.</div>
                <div className="image-grid">
                  {thumbImages.map((img, i) => (
                    <div key={i} className="image-preview">
                      <img src={img.dataUrl} alt="" />
                      <button
                        type="button"
                        className="image-remove"
                        onClick={() => setThumbImages((p) => p.filter((_, j) => j !== i))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="upload-btn">
                  📸 Add thumbnail references
                  <input type="file" accept="image/*" multiple onChange={(e) => onPickImage(e, 'thumbnail')} />
                </label>
              </div>

              <div className="section-label">⏱ Target video length</div>
              <div className="duration-grid">
                {DURATIONS.map((d) => (
                  <button
                    type="button"
                    key={d.v}
                    className={`duration-chip ${duration === d.v ? 'selected' : ''}`}
                    onClick={() => setDuration(d.v)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="section-label">💭 Notes (optional)</div>
              <textarea
                className="dd-textarea"
                style={{ minHeight: 80, marginBottom: 18 }}
                placeholder="Anything else the AI should know..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <button type="button" className="gen-btn" onClick={generate} disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                <span>{loading ? 'Generating...' : '⚡ Generate 10 Viral Ideas'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {ideas.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <div>
              <h2>{mode === 'clone' ? `Ideas modeled after ${channelUrl}` : `Ideas for "${niche}"`}</h2>
              <span>Click "🚀 Deep Dive" on any idea — your setup carries over so you jump straight to script generation</span>
            </div>
            <span style={{ color: 'var(--muted)' }}>{ideas.length} ideas</span>
          </div>
          <div className="ideas-grid">
            {ideas.map((idea, i) => (
              <IdeaCard
                key={`${idea.title}-${i}`}
                idea={idea}
                index={i}
                niche={labelNiche}
                setupContext={{
                  setupMode: mode === 'clone' ? 'clone' : 'own',
                  state1Input: channelUrl,
                  state2Transcripts: transcripts.filter((t) => t.trim()),
                  // Image upload to workbook is deferred to a future enhancement;
                  // for V1 the staged images count is captured but not pre-attached.
                  // Users can re-upload in State 2 of the workbook for vision context.
                  state2StyleImagePaths: [],
                  state2ThumbImagePaths: [],
                  state4Duration: duration,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
