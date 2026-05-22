'use client';

import { useEffect, useState } from 'react';

type Voice = { id: string; name: string; category?: string; description?: string; preview_url?: string };
type Job = {
  id: string;
  kind: 'image' | 'video' | 'tts' | 'assembly';
  status: 'queued' | 'processing' | 'done' | 'failed' | 'canceled';
  output?: { url?: string; asset_id?: string } | null;
  error?: string | null;
};

const ASPECTS = ['16:9', '9:16', '1:1', '4:3'] as const;

export default function StudioClient() {
  return (
    <main className="container" style={{ padding: '24px 16px', maxWidth: 1100 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Studio</h1>
        <p style={{ color: '#888', fontSize: 14 }}>Voiceover, image, and video generation — backed by ElevenLabs + Replicate.</p>
      </header>

      <section className="card" style={card}>
        <h2 style={h2}>🎙️ Voiceover</h2>
        <VoiceoverPanel />
      </section>

      <section className="card" style={card}>
        <h2 style={h2}>🖼️ Image generation</h2>
        <ImagePanel />
      </section>

      <section className="card" style={card}>
        <h2 style={h2}>🎬 Image → video animation</h2>
        <VideoPanel />
      </section>

      <section className="card" style={card}>
        <h2 style={h2}>🎞️ Final assembly</h2>
        <AssemblyPanel />
      </section>
    </main>
  );
}

// ─── Voiceover ─────────────────────────────────────────────────────────────

function VoiceoverPanel() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState('');
  const [text, setText] = useState('Welcome to the channel. Today we are going to break down something nobody is talking about.');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tts/voices')
      .then((r) => r.json())
      .then((j) => {
        if (j.voices) {
          setVoices(j.voices);
          if (j.voices[0]) setVoiceId(j.voices[0].id);
        } else if (j.error) setErr(j.error);
      })
      .catch((e) => setErr(String(e)));
  }, []);

  async function synth() {
    if (!voiceId || !text.trim()) return;
    setBusy(true);
    setErr(null);
    setAudioUrl(null);
    try {
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setAudioUrl(j.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label style={lbl}>
        Voice
        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} style={inp}>
          {voices.length === 0 && <option value="">— loading —</option>}
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} {v.category ? `· ${v.category}` : ''}
            </option>
          ))}
        </select>
      </label>
      <label style={lbl}>
        Script
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} style={{ ...inp, resize: 'vertical' }} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={synth} disabled={busy || !voiceId} style={btn(busy)}>
          {busy ? 'Synthesizing…' : 'Generate voiceover'}
        </button>
        {audioUrl && (
          <a href={audioUrl} target="_blank" rel="noreferrer" style={{ ...btn(false), background: '#222' }}>
            Download MP3
          </a>
        )}
      </div>
      {err && <p style={errStyle}>{err}</p>}
      {audioUrl && <audio src={audioUrl} controls style={{ width: '100%' }} />}
    </div>
  );
}

// ─── Image ────────────────────────────────────────────────────────────────

function ImagePanel() {
  const [prompt, setPrompt] = useState('Cinematic establishing shot of a misty mountain forest at sunrise, photorealistic, 35mm');
  const [aspect, setAspect] = useState<(typeof ASPECTS)[number]>('16:9');
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setErr(null);
    setJob(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio: aspect }),
      });
      const j = await res.json();
      if (!res.ok) {
        const detail = Array.isArray(j.issues) && j.issues.length > 0
          ? j.issues.map((i: { path?: (string | number)[]; message: string }) => `${(i.path ?? []).join('.') || 'body'}: ${i.message}`).join('; ')
          : null;
        throw new Error(detail ? `${j.error}: ${detail}` : j.error || `HTTP ${res.status}`);
      }
      pollJob(j.job_id, setJob).catch((e) => setErr(String(e)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const url = job?.output?.url;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label style={lbl}>
        Prompt
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
      </label>
      <label style={lbl}>
        Aspect ratio
        <select value={aspect} onChange={(e) => setAspect(e.target.value as (typeof ASPECTS)[number])} style={inp}>
          {ASPECTS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </label>
      <div>
        <button onClick={start} disabled={busy} style={btn(busy)}>
          {busy ? 'Starting…' : 'Generate image'}
        </button>
      </div>
      {job && <p style={muted}>Job {job.id.slice(0, 8)} · {job.status}</p>}
      {err && <p style={errStyle}>{err}</p>}
      {url && (
        <div>
          <img src={url} alt="generated" style={{ maxWidth: '100%', borderRadius: 8 }} />
          <p style={{ marginTop: 6 }}>
            <a href={url} target="_blank" rel="noreferrer">Open full-size</a>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Video ────────────────────────────────────────────────────────────────

function VideoPanel() {
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('Slow camera push-in, gentle wind moving the trees, cinematic lighting');
  const [duration, setDuration] = useState<5 | 10>(5);
  const [aspect, setAspect] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setErr(null);
    setJob(null);
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt, durationSec: duration, aspectRatio: aspect }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      pollJob(j.job_id, setJob).catch((e) => setErr(String(e)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const url = job?.output?.url;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label style={lbl}>
        Source image URL (e.g. the public URL from the image panel above)
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" style={inp} />
      </label>
      <label style={lbl}>
        Motion prompt
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={lbl}>
          Duration
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value) as 5 | 10)} style={inp}>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
          </select>
        </label>
        <label style={lbl}>
          Aspect
          <select value={aspect} onChange={(e) => setAspect(e.target.value as '16:9' | '9:16' | '1:1')} style={inp}>
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
          </select>
        </label>
      </div>
      <div>
        <button onClick={start} disabled={busy || !imageUrl} style={btn(busy)}>
          {busy ? 'Starting…' : 'Animate to video'}
        </button>
      </div>
      {job && <p style={muted}>Job {job.id.slice(0, 8)} · {job.status} (video can take 1-3 min)</p>}
      {err && <p style={errStyle}>{err}</p>}
      {url && (
        <video src={url} controls style={{ width: '100%', borderRadius: 8 }} />
      )}
    </div>
  );
}

// ─── Assembly ─────────────────────────────────────────────────────────────

type SceneDraft = {
  id: string;
  url: string;
  kind: 'image' | 'video';
  durationSec: number;
  motion: 'static' | 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  caption: string;
};

const PRESETS = [
  { label: '1080p · 16:9 (YouTube)', width: 1920, height: 1080 },
  { label: '1080p · 9:16 (Shorts/Reels/TikTok)', width: 1080, height: 1920 },
  { label: '1080p · 1:1 (Square)', width: 1080, height: 1080 },
];

function AssemblyPanel() {
  const [title, setTitle] = useState('My CopperAI video');
  const [preset, setPreset] = useState(0);
  const [voiceoverUrl, setVoiceoverUrl] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [subtitleScript, setSubtitleScript] = useState('');
  const [scenes, setScenes] = useState<SceneDraft[]>([
    { id: 's1', url: '', kind: 'image', durationSec: 5, motion: 'zoom_in', caption: '' },
  ]);
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function update(i: number, patch: Partial<SceneDraft>) {
    setScenes((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function addScene() {
    setScenes((arr) => [
      ...arr,
      { id: `s${arr.length + 1}`, url: '', kind: 'image', durationSec: 5, motion: 'zoom_in', caption: '' },
    ]);
  }
  function removeScene(i: number) {
    setScenes((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));
  }

  async function start() {
    setBusy(true);
    setErr(null);
    setJob(null);
    try {
      const { width, height } = PRESETS[preset];
      const cleanScenes = scenes.filter((s) => s.url.trim());
      if (cleanScenes.length === 0) throw new Error('Add at least one scene with a URL.');

      const timeline = {
        version: 1 as const,
        title,
        resolution: { width, height, fps: 30 },
        voiceoverUrl: voiceoverUrl.trim() || undefined,
        musicUrl: musicUrl.trim() || undefined,
        musicVolume: musicUrl.trim() ? 0.18 : undefined,
        subtitles: subtitleScript.trim()
          ? {
              srt: buildSrtClient(cleanScenes, subtitleScript),
              fontSize: 30,
              fontColor: '#FFFFFF',
              position: 'bottom' as const,
            }
          : undefined,
        scenes: cleanScenes.map((s) => ({
          id: s.id,
          durationSec: s.durationSec,
          source:
            s.kind === 'image'
              ? { kind: 'image' as const, url: s.url.trim(), motion: s.motion }
              : { kind: 'video' as const, url: s.url.trim() },
          caption: s.caption.trim() || undefined,
        })),
      };

      const res = await fetch('/api/render-assembly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeline }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      pollJob(j.job_id, setJob).catch((e) => setErr(String(e)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const url = job?.output?.url;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
        <label style={lbl}>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} />
        </label>
        <label style={lbl}>
          Format
          <select value={preset} onChange={(e) => setPreset(Number(e.target.value))} style={inp}>
            {PRESETS.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={lbl}>
          Voiceover URL (MP3)
          <input value={voiceoverUrl} onChange={(e) => setVoiceoverUrl(e.target.value)} placeholder="paste from voiceover panel above" style={inp} />
        </label>
        <label style={lbl}>
          Music URL (MP3, optional)
          <input value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="optional background music" style={inp} />
        </label>
      </div>
      <label style={lbl}>
        Subtitles — paste full script (optional, generates burned-in SRT)
        <textarea value={subtitleScript} onChange={(e) => setSubtitleScript(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
      </label>

      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '6px 0' }}>Scenes</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {scenes.map((s, i) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 110px 110px 36px', gap: 6, alignItems: 'end' }}>
              <span style={{ ...muted, alignSelf: 'center' }}>#{i + 1}</span>
              <input
                value={s.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="image or video URL"
                style={inp}
              />
              <select value={s.kind} onChange={(e) => update(i, { kind: e.target.value as 'image' | 'video' })} style={inp}>
                <option value="image">image</option>
                <option value="video">video</option>
              </select>
              <input
                type="number"
                min={1}
                max={60}
                step={0.5}
                value={s.durationSec}
                onChange={(e) => update(i, { durationSec: Number(e.target.value) })}
                style={inp}
              />
              <button onClick={() => removeScene(i)} disabled={scenes.length === 1} style={{ ...btn(false), background: '#333', padding: '6px 10px' }}>
                ×
              </button>
              {s.kind === 'image' && (
                <>
                  <span />
                  <input
                    value={s.caption}
                    onChange={(e) => update(i, { caption: e.target.value })}
                    placeholder="caption (optional)"
                    style={inp}
                  />
                  <select value={s.motion} onChange={(e) => update(i, { motion: e.target.value as SceneDraft['motion'] })} style={inp}>
                    <option value="static">static</option>
                    <option value="zoom_in">zoom in</option>
                    <option value="zoom_out">zoom out</option>
                    <option value="pan_left">pan left</option>
                    <option value="pan_right">pan right</option>
                  </select>
                  <span /><span />
                </>
              )}
            </div>
          ))}
        </div>
        <button onClick={addScene} style={{ ...btn(false), background: '#222', marginTop: 8 }}>
          + Add scene
        </button>
      </div>

      <div>
        <button onClick={start} disabled={busy} style={btn(busy)}>
          {busy ? 'Queuing…' : 'Render final video'}
        </button>
        <span style={{ ...muted, marginLeft: 10 }}>
          Requires the worker (worker/) to be running.
        </span>
      </div>
      {job && <p style={muted}>Job {job.id.slice(0, 8)} · {job.status} — final renders run on the background worker, typically 30-90s.</p>}
      {err && <p style={errStyle}>{err}</p>}
      {url && <video src={url} controls style={{ width: '100%', borderRadius: 8 }} />}
    </div>
  );
}

// Quick client-side SRT mirror of lib/assembly/srt.ts (kept minimal here so
// we don't need to expose server code to the client bundle).
function buildSrtClient(scenes: SceneDraft[], script: string): string {
  const words = script.trim().split(/\s+/).filter(Boolean);
  const total = scenes.reduce((a, s) => a + s.durationSec, 0);
  if (!total || !words.length) return '';
  let cursor = 0;
  const perScene = scenes.map((s, idx) => {
    const count = idx === scenes.length - 1
      ? words.length - cursor
      : Math.max(1, Math.round((s.durationSec / total) * words.length));
    const slice = words.slice(cursor, cursor + count);
    cursor += slice.length;
    return slice;
  });
  const fmt = (sec: number) => {
    const ms = Math.max(0, Math.round(sec * 1000));
    const hh = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
    const mm = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
    const ss = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
    const mss = String(ms % 1000).padStart(3, '0');
    return `${hh}:${mm}:${ss},${mss}`;
  };
  const out: string[] = [];
  let idx = 1, t = 0;
  for (let i = 0; i < scenes.length; i++) {
    const w = perScene[i];
    if (w.length === 0) { t += scenes[i].durationSec; continue; }
    const chunks: string[][] = [];
    for (let j = 0; j < w.length; j += 7) chunks.push(w.slice(j, j + 7));
    const per = scenes[i].durationSec / chunks.length;
    for (let c = 0; c < chunks.length; c++) {
      const start = t + c * per;
      const end = t + (c + 1) * per - 0.05;
      out.push(String(idx++), `${fmt(start)} --> ${fmt(end)}`, chunks[c].join(' '), '');
    }
    t += scenes[i].durationSec;
  }
  return out.join('\n');
}

// ─── shared ────────────────────────────────────────────────────────────────

async function pollJob(jobId: string, onUpdate: (j: Job) => void) {
  const deadline = Date.now() + 5 * 60_000;
  while (Date.now() < deadline) {
    const r = await fetch(`/api/jobs/${jobId}`, { cache: 'no-store' });
    const j = await r.json();
    if (j.job) onUpdate(j.job as Job);
    const s = j.job?.status;
    if (s === 'done' || s === 'failed' || s === 'canceled') return;
    await new Promise((res) => setTimeout(res, 2500));
  }
}

const card: React.CSSProperties = {
  border: '1px solid #2a2a2a',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  background: '#0f0f10',
};
const h2: React.CSSProperties = { fontSize: 18, fontWeight: 600, marginBottom: 12 };
const lbl: React.CSSProperties = { display: 'grid', gap: 4, fontSize: 13, color: '#aaa' };
const inp: React.CSSProperties = {
  background: '#181818',
  border: '1px solid #333',
  borderRadius: 6,
  padding: '8px 10px',
  color: '#eee',
  fontSize: 14,
  fontFamily: 'inherit',
};
const btn = (busy: boolean): React.CSSProperties => ({
  background: busy ? '#555' : 'linear-gradient(135deg,#c97a3f,#b56532)',
  color: 'white',
  border: 0,
  borderRadius: 6,
  padding: '8px 14px',
  fontWeight: 600,
  cursor: busy ? 'wait' : 'pointer',
  fontSize: 14,
  textDecoration: 'none',
  display: 'inline-block',
});
const muted: React.CSSProperties = { color: '#888', fontSize: 13 };
const errStyle: React.CSSProperties = { color: '#ff7070', fontSize: 13 };
