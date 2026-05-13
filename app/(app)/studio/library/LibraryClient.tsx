'use client';

import { useEffect, useState } from 'react';

type Asset = {
  id: string;
  kind: 'audio' | 'image' | 'video';
  provider: string;
  provider_model: string | null;
  public_url: string;
  prompt: string | null;
  duration_ms: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

type Filter = 'all' | 'audio' | 'image' | 'video';

export default function LibraryClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const q = filter === 'all' ? '' : `?kind=${filter}`;
      const r = await fetch(`/api/media${q}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setAssets(j.assets);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  function copy(url: string, id: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
    });
  }

  return (
    <main className="container" style={{ padding: '24px 16px', maxWidth: 1100 }}>
      <header style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Library</h1>
          <p style={muted}>Every asset you have generated.</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'audio', 'image', 'video'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...filterBtn,
                background: f === filter ? 'linear-gradient(135deg,#c97a3f,#b56532)' : '#1f1f1f',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {err && <p style={errStyle}>{err}</p>}
      {loading && <p style={muted}>Loading…</p>}
      {!loading && assets.length === 0 && <p style={muted}>No assets yet. Generate one in Studio.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {assets.map((a) => (
          <article key={a.id} style={card}>
            <Preview a={a} />
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 12, color: '#999', display: 'flex', justifyContent: 'space-between' }}>
                <span>{a.kind} · {a.provider}{a.provider_model ? ` · ${a.provider_model}` : ''}</span>
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
              {a.prompt && (
                <p style={{ fontSize: 12, color: '#bbb', marginTop: 6, maxHeight: 38, overflow: 'hidden' }}>
                  {a.prompt}
                </p>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <a href={a.public_url} target="_blank" rel="noreferrer" style={smallBtn}>Open</a>
                <button onClick={() => copy(a.public_url, a.id)} style={smallBtn}>
                  {copied === a.id ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function Preview({ a }: { a: Asset }) {
  if (a.kind === 'image') {
    return <img src={a.public_url} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />;
  }
  if (a.kind === 'video') {
    return <video src={a.public_url} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', background: '#000' }} muted playsInline preload="metadata" />;
  }
  return (
    <div style={{ padding: 12, background: '#0a0a0a' }}>
      <audio src={a.public_url} controls style={{ width: '100%' }} />
    </div>
  );
}

const card: React.CSSProperties = { border: '1px solid #2a2a2a', borderRadius: 10, background: '#0f0f10', overflow: 'hidden' };
const filterBtn: React.CSSProperties = { border: 0, color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, textTransform: 'capitalize', cursor: 'pointer' };
const smallBtn: React.CSSProperties = { background: '#222', color: '#ddd', border: 0, borderRadius: 4, padding: '5px 10px', fontSize: 12, textDecoration: 'none', cursor: 'pointer' };
const muted: React.CSSProperties = { color: '#888', fontSize: 13 };
const errStyle: React.CSSProperties = { color: '#ff7070', fontSize: 13 };
