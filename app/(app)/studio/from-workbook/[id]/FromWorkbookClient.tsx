'use client';

import { useEffect, useMemo, useState } from 'react';

type Voice = { id: string; name: string; category?: string };
type ParsedScene = { scene: number; name: string; prompt: string };
type Storyboard = {
  workbook: { id: string; name: string; niche: string; ideaTitle: string; ideaDescription: string };
  duration: string;
  script: string;
  scriptForVoice: string;
  imagePrompts: ParsedScene[];
  videoPrompts: ParsedScene[];
  voiceNotes: string;
};

type StepStatus = 'pending' | 'running' | 'done' | 'failed';

type Job = {
  id: string;
  kind: 'image' | 'video' | 'tts' | 'assembly';
  status: 'queued' | 'processing' | 'done' | 'failed' | 'canceled';
  output?: { url?: string; asset_id?: string } | null;
  error?: string | null;
};

const FORMATS = [
  { label: '1080p · 16:9 (YouTube)', width: 1920, height: 1080, ar: '16:9' as const },
  { label: '1080p · 9:16 (Shorts)',  width: 1080, height: 1920, ar: '9:16' as const },
  { label: '1080p · 1:1 (Square)',   width: 1080, height: 1080, ar: '1:1' as const },
];

export default function FromWorkbookClient({ workbookId }: { workbookId: string }) {
  const [sb, setSb] = useState<Storyboard | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState('');
  const [formatIdx, setFormatIdx] = useState(0);
  const [musicUrl, setMusicUrl] = useState('');
  const [withSubs, setWithSubs] = useState(true);
  const [running, setRunning] = useState(false);
  const [audioStatus, setAudioStatus] = useState<StepStatus>('pending');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageStatuses, setImageStatuses] = useState<StepStatus[]>([]);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([]);
  const [assemblyStatus, setAssemblyStatus] = useState<StepStatus>('pending');
  const [assemblyJobId, setAssemblyJobId] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/workbooks/${workbookId}/storyboard`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setLoadErr(j.error);
        else setSb(j as Storyboard);
      })
      .catch((e) => setLoadErr(String(e)));
    fetch('/api/tts/voices')
      .then((r) => r.json())
      .then((j) => {
        if (j.voices) {
          setVoices(j.voices);
          if (j.voices[0]) setVoiceId(j.voices[0].id);
        }
      })
      .catch(() => {});
  }, [workbookId]);

  const sceneDurationSec = useMemo(() => {
    if (!sb) return 5;
    // Aim ~150 words/min reading rate; if voice is set we still distribute audio
    // evenly across scenes via the assembler.
    const targetSec = Math.max(20, Math.min(600, parseInt(sb.duration, 10) * 60));
    const n = Math.max(1, sb.imagePrompts.length);
    return Math.max(3, Math.min(15, Math.round(targetSec / n)));
  }, [sb]);

  async function run() {
    if (!sb) return;
    if (sb.imagePrompts.length === 0) {
      setErr('No image prompts found in workbook state 5. Generate them in the Deep Dive first.');
      return;
    }
    if (!voiceId) {
      setErr('Pick a voice first.');
      return;
    }

    setRunning(true);
    setErr(null);
    setAudioStatus('pending');
    setAudioUrl(null);
    setImageStatuses(sb.imagePrompts.map(() => 'pending'));
    setImageUrls(sb.imagePrompts.map(() => null));
    setAssemblyStatus('pending');
    setAssemblyJobId(null);
    setFinalUrl(null);

    try {
      const { ar, width, height } = FORMATS[formatIdx];

      // 1) TTS (sync)
      setAudioStatus('running');
      const ttsRes = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sb.scriptForVoice, voiceId, workbookId }),
      });
      const ttsJson = await ttsRes.json();
      if (!ttsRes.ok) throw new Error(`voiceover: ${ttsJson.error || ttsRes.status}`);
      setAudioUrl(ttsJson.url);
      setAudioStatus('done');

      // 2) Kick off all image jobs in parallel
      const startedJobs = await Promise.all(
        sb.imagePrompts.map(async (p, i) => {
          setImageStatuses((arr) => arr.map((v, idx) => (idx === i ? 'running' : v)));
          const r = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: cleanPrompt(p.prompt),
              aspectRatio: ar,
              workbookId,
            }),
          });
          const j = await r.json();
          if (!r.ok) throw new Error(`image ${i + 1}: ${j.error || r.status}`);
          return j.job_id as string;
        }),
      );

      // 3) Poll all image jobs in parallel
      const imageResults = await Promise.all(
        startedJobs.map(async (jobId, i) => {
          const final = await pollJob(jobId);
          if (final.status === 'done' && final.output?.url) {
            setImageUrls((arr) => arr.map((v, idx) => (idx === i ? final.output!.url! : v)));
            setImageStatuses((arr) => arr.map((v, idx) => (idx === i ? 'done' : v)));
            return final.output.url;
          }
          setImageStatuses((arr) => arr.map((v, idx) => (idx === i ? 'failed' : v)));
          throw new Error(`image ${i + 1}: ${final.error || final.status}`);
        }),
      );

      // 4) Build timeline and queue assembly
      setAssemblyStatus('running');
      const motions: Array<'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right'> = [
        'zoom_in', 'zoom_out', 'pan_left', 'pan_right',
      ];
      const scenes = imageResults.map((url, i) => ({
        id: `s${i + 1}`,
        durationSec: sceneDurationSec,
        source: { kind: 'image' as const, url: url!, motion: motions[i % motions.length] },
        caption: sb.imagePrompts[i].name || undefined,
      }));

      const subtitles = withSubs
        ? {
            srt: buildSrtClient(scenes, sb.scriptForVoice),
            fontSize: 32,
            fontColor: '#FFFFFF',
            position: 'bottom' as const,
          }
        : undefined;

      const timeline = {
        version: 1 as const,
        title: sb.workbook.name || sb.workbook.ideaTitle,
        resolution: { width, height, fps: 30 },
        voiceoverUrl: ttsJson.url as string,
        musicUrl: musicUrl.trim() || undefined,
        musicVolume: musicUrl.trim() ? 0.18 : undefined,
        subtitles,
        transitions: { type: 'fade' as const, durationSec: 0.4 },
        scenes,
      };

      const asmRes = await fetch('/api/render-assembly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeline, workbookId }),
      });
      const asmJson = await asmRes.json();
      if (!asmRes.ok) throw new Error(`assembly: ${asmJson.error || asmRes.status}`);
      setAssemblyJobId(asmJson.job_id);

      // 5) Poll assembly job
      const finalJob = await pollJob(asmJson.job_id, 15 * 60_000);
      if (finalJob.status === 'done' && finalJob.output?.url) {
        setFinalUrl(finalJob.output.url);
        setAssemblyStatus('done');
      } else {
        setAssemblyStatus('failed');
        throw new Error(`assembly: ${finalJob.error || finalJob.status}`);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  if (loadErr) return <main style={{ padding: 24 }}><p style={errStyle}>{loadErr}</p></main>;
  if (!sb) return <main style={{ padding: 24 }}><p style={muted}>Loading workbook…</p></main>;

  const hasImagePrompts = sb.imagePrompts.length > 0;
  const hasScript = sb.scriptForVoice.length > 50;

  return (
    <main className="container" style={{ padding: '24px 16px', maxWidth: 1100 }}>
      <header style={{ marginBottom: 16 }}>
        <p style={muted}>Workbook</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{sb.workbook.name}</h1>
        <p style={{ color: '#888', fontSize: 14 }}>{sb.workbook.ideaTitle} · {sb.workbook.niche}</p>
      </header>

      <section style={card}>
        <h2 style={h2}>Detected from workbook</h2>
        <ul style={{ paddingLeft: 18, color: '#bbb', fontSize: 14, lineHeight: 1.7 }}>
          <li>Script: <strong>{hasScript ? `${sb.scriptForVoice.length.toLocaleString()} chars` : <span style={errStyle}>missing (state 4)</span>}</strong></li>
          <li>Image prompts (state 5): <strong>{sb.imagePrompts.length}</strong></li>
          <li>Video clip prompts (state 5, optional): <strong>{sb.videoPrompts.length}</strong></li>
          <li>Voice direction (state 6): <strong>{sb.voiceNotes ? 'present' : '—'}</strong></li>
          <li>Target duration: <strong>{sb.duration} min</strong> → ~<strong>{sceneDurationSec}s</strong>/scene</li>
        </ul>
      </section>

      <section style={card}>
        <h2 style={h2}>Render settings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={lbl}>
            Format
            <select value={formatIdx} onChange={(e) => setFormatIdx(Number(e.target.value))} style={inp}>
              {FORMATS.map((f, i) => <option key={i} value={i}>{f.label}</option>)}
            </select>
          </label>
          <label style={lbl}>
            Voice
            <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} style={inp}>
              {voices.length === 0 && <option>— loading —</option>}
              {voices.map((v) => <option key={v.id} value={v.id}>{v.name}{v.category ? ` · ${v.category}` : ''}</option>)}
            </select>
          </label>
          <label style={lbl}>
            Music URL (optional)
            <input value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="https://… (background, will be ducked)" style={inp} />
          </label>
          <label style={{ ...lbl, alignSelf: 'end' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={withSubs} onChange={(e) => setWithSubs(e.target.checked)} />
              Burn in subtitles from script
            </span>
          </label>
        </div>
        <div style={{ marginTop: 14 }}>
          <button onClick={run} disabled={running || !hasImagePrompts || !hasScript || !voiceId} style={btn(running)}>
            {running ? 'Rendering…' : `Render full video (${sb.imagePrompts.length} scenes, ~${Math.round(sceneDurationSec * sb.imagePrompts.length)}s)`}
          </button>
          <span style={{ ...muted, marginLeft: 10 }}>Worker must be running for final assembly.</span>
        </div>
        {err && <p style={errStyle}>{err}</p>}
      </section>

      <section style={card}>
        <h2 style={h2}>Progress</h2>
        <StepRow label="Voiceover (ElevenLabs)" status={audioStatus} url={audioUrl} kind="audio" />
        {sb.imagePrompts.map((p, i) => (
          <StepRow
            key={p.scene}
            label={`Scene ${p.scene}: ${p.name || cleanPrompt(p.prompt).slice(0, 60) + '…'}`}
            status={imageStatuses[i] ?? 'pending'}
            url={imageUrls[i] ?? null}
            kind="image"
          />
        ))}
        <StepRow label={`Final assembly${assemblyJobId ? ` · job ${assemblyJobId.slice(0, 8)}` : ''}`} status={assemblyStatus} url={finalUrl} kind="video" />
      </section>

      {finalUrl && (
        <section style={card}>
          <h2 style={h2}>Final video</h2>
          <video src={finalUrl} controls style={{ width: '100%', borderRadius: 8 }} />
          <p style={{ marginTop: 6 }}>
            <a href={finalUrl} target="_blank" rel="noreferrer">Download MP4</a>
          </p>
        </section>
      )}
    </main>
  );
}

function StepRow({ label, status, url, kind }: { label: string; status: StepStatus; url: string | null; kind: 'audio' | 'image' | 'video' }) {
  const icon = status === 'done' ? '✓' : status === 'running' ? '…' : status === 'failed' ? '✗' : '·';
  const color = status === 'done' ? '#5ed184' : status === 'running' ? '#e0a04b' : status === 'failed' ? '#ff7070' : '#666';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: '1px solid #1a1a1a' }}>
      <span style={{ color, width: 16, textAlign: 'center', fontWeight: 700 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: '#ccc' }}>{label}</span>
      {url && kind === 'image' && <img src={url} alt="" style={{ width: 60, height: 34, objectFit: 'cover', borderRadius: 4 }} />}
      {url && <a href={url} target="_blank" rel="noreferrer" style={{ ...muted, fontSize: 12 }}>open</a>}
    </div>
  );
}

function cleanPrompt(p: string): string {
  return p.replace(/--ar\s+\S+/gi, '').replace(/--style\s+\S+/gi, '').replace(/\s+/g, ' ').trim();
}

async function pollJob(jobId: string, timeoutMs = 5 * 60_000): Promise<Job> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const r = await fetch(`/api/jobs/${jobId}`, { cache: 'no-store' });
    const j = await r.json();
    const job: Job | undefined = j.job;
    if (job && (job.status === 'done' || job.status === 'failed' || job.status === 'canceled')) return job;
    await new Promise((res) => setTimeout(res, 2500));
  }
  return { id: jobId, kind: 'image', status: 'failed', error: 'timeout' };
}

function buildSrtClient(scenes: { id: string; durationSec: number }[], script: string): string {
  const words = script.trim().split(/\s+/).filter(Boolean);
  const total = scenes.reduce((a, s) => a + s.durationSec, 0);
  if (!total || !words.length) return '';
  let cursor = 0;
  const per = scenes.map((s, idx) => {
    const c = idx === scenes.length - 1 ? words.length - cursor : Math.max(1, Math.round((s.durationSec / total) * words.length));
    const slice = words.slice(cursor, cursor + c);
    cursor += slice.length;
    return slice;
  });
  const fmt = (sec: number) => {
    const ms = Math.max(0, Math.round(sec * 1000));
    const hh = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
    const mm = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
    const ss = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
    return `${hh}:${mm}:${ss},${String(ms % 1000).padStart(3, '0')}`;
  };
  const out: string[] = [];
  let idx = 1, t = 0;
  for (let i = 0; i < scenes.length; i++) {
    const w = per[i];
    if (w.length === 0) { t += scenes[i].durationSec; continue; }
    const chunks: string[][] = [];
    for (let j = 0; j < w.length; j += 7) chunks.push(w.slice(j, j + 7));
    const each = scenes[i].durationSec / chunks.length;
    for (let c = 0; c < chunks.length; c++) {
      const start = t + c * each;
      const end = t + (c + 1) * each - 0.05;
      out.push(String(idx++), `${fmt(start)} --> ${fmt(end)}`, chunks[c].join(' '), '');
    }
    t += scenes[i].durationSec;
  }
  return out.join('\n');
}

// shared styles
const card: React.CSSProperties = { border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 16, background: '#0f0f10' };
const h2: React.CSSProperties = { fontSize: 17, fontWeight: 600, marginBottom: 10 };
const lbl: React.CSSProperties = { display: 'grid', gap: 4, fontSize: 13, color: '#aaa' };
const inp: React.CSSProperties = { background: '#181818', border: '1px solid #333', borderRadius: 6, padding: '8px 10px', color: '#eee', fontSize: 14, fontFamily: 'inherit' };
const btn = (busy: boolean): React.CSSProperties => ({ background: busy ? '#555' : 'linear-gradient(135deg,#c97a3f,#b56532)', color: 'white', border: 0, borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: busy ? 'wait' : 'pointer', fontSize: 15 });
const muted: React.CSSProperties = { color: '#888', fontSize: 13 };
const errStyle: React.CSSProperties = { color: '#ff7070', fontSize: 13 };
