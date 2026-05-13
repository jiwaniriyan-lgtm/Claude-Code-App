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
