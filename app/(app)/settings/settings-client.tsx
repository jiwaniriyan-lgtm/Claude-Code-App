'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/Toast';
import type { UsageStats } from '@/lib/types';

type Props = {
  email: string;
  tier: string;
  tierName: string;
  tierLimits: { ideasPerMonth: number; activeWorkbooks: number };
  usage: UsageStats;
  hasSubscription: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
};

export default function SettingsClient(p: Props) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    setBusy(true);
    const res = await fetch('/api/billing/portal', { method: 'POST' });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Could not open billing portal', 'error');
      return;
    }
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="page-shell" style={{ maxWidth: 760 }}>
      <h2>⚙ Settings</h2>
      <p className="sub">Account and billing.</p>

      <div className="gen-card" style={{ marginBottom: 20 }}>
        <div className="section-label">Account</div>
        <div style={{ fontSize: '.95rem', marginBottom: 6 }}>{p.email}</div>
        <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
          Plan: <strong style={{ color: 'var(--text)' }}>{p.tierName}</strong>
        </div>
      </div>

      <div className="gen-card" style={{ marginBottom: 20 }}>
        <div className="section-label">Usage this month</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: '.95rem' }}>
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Ideas generated</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>
              {p.usage.ideas_this_month}
              <span style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 500 }}> / {p.tierLimits.ideasPerMonth}</span>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Active workbooks</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>
              {p.usage.workbooks_active}
              {p.tierLimits.activeWorkbooks !== -1 && (
                <span style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 500 }}> / {p.tierLimits.activeWorkbooks}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="gen-card">
        <div className="section-label">Billing</div>
        {p.tier === 'free' ? (
          <>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: 16 }}>
              You're on the free plan. Upgrade for higher limits, longer scripts, and video clip prompts.
            </p>
            <Link href="/pricing" className="tier-cta primary" style={{ display: 'inline-block', width: 'auto', padding: '10px 20px' }}>
              See plans
            </Link>
          </>
        ) : (
          <>
            {p.trialEndsAt && new Date(p.trialEndsAt) > new Date() && (
              <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: 12 }}>
                Trial ends {new Date(p.trialEndsAt).toLocaleDateString()}.
              </p>
            )}
            {p.currentPeriodEnd && (
              <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: 16 }}>
                Current period ends {new Date(p.currentPeriodEnd).toLocaleDateString()}.
              </p>
            )}
            {p.hasSubscription ? (
              <button type="button" className="tier-cta" disabled={busy} onClick={openPortal} style={{ width: 'auto', padding: '10px 20px' }}>
                {busy ? 'Loading...' : 'Manage billing'}
              </button>
            ) : (
              <Link href="/pricing" className="tier-cta primary" style={{ display: 'inline-block', width: 'auto', padding: '10px 20px' }}>
                Set up billing
              </Link>
            )}
          </>
        )}
      </div>

      <VoicesCard />

      <p style={{ marginTop: 24, fontSize: '.85rem', color: 'var(--muted)', textAlign: 'center' }}>
        <form action="/api/auth/signout" method="post" style={{ display: 'inline' }}>
          <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', font: 'inherit' }}>
            Sign out
          </button>
        </form>
      </p>
    </div>
  );
}

type Voice = { id: string; name: string; category?: string; description?: string };

function VoicesCard() {
  const { showToast } = useToast();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/tts/voices');
      const j = await r.json();
      if (j.voices) setVoices(j.voices);
      else if (j.error) showToast(j.error, 'error');
    } catch (e) {
      showToast(String(e), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submitClone(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !fileRef.current?.files?.length) {
      showToast('Pick a name and attach 1-3 audio samples', 'error');
      return;
    }
    const fd = new FormData();
    fd.set('name', name.trim());
    if (description.trim()) fd.set('description', description.trim());
    for (const f of Array.from(fileRef.current.files)) fd.append('files', f);

    setUploading(true);
    try {
      const r = await fetch('/api/voices/clone', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      showToast(`Voice "${j.name}" created`, 'success');
      setName('');
      setDescription('');
      if (fileRef.current) fileRef.current.value = '';
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setUploading(false);
    }
  }

  async function remove(voiceId: string, name: string) {
    if (!confirm(`Delete voice "${name}"? This cannot be undone.`)) return;
    const r = await fetch(`/api/voices/${voiceId}`, { method: 'DELETE' });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      showToast(j.error || 'Delete failed', 'error');
      return;
    }
    showToast('Voice deleted', 'success');
    void load();
  }

  const cloned = voices.filter((v) => v.category === 'cloned' || v.category === 'generated');
  const premade = voices.filter((v) => !cloned.includes(v));

  return (
    <div className="gen-card" style={{ marginBottom: 20 }}>
      <div className="section-label">Voices (ElevenLabs)</div>
      <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 12 }}>
        Upload your own voice (1-3 min clean audio recommended). The cloned voice is selectable
        anywhere in Studio. Only clone voices you have permission to use.
      </p>

      <form onSubmit={submitClone} style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Voice name (e.g. 'My main voice')"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={voiceInp}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={voiceInp}
        />
        <input ref={fileRef} type="file" accept="audio/*" multiple style={voiceInp} />
        <button type="submit" disabled={uploading} style={voiceBtn(uploading)}>
          {uploading ? 'Uploading…' : 'Clone voice'}
        </button>
      </form>

      <div style={{ fontSize: '.85rem' }}>
        {loading && <p style={{ color: 'var(--muted)' }}>Loading voices…</p>}
        {!loading && cloned.length > 0 && (
          <>
            <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Your voices</div>
            {cloned.map((v) => (
              <VoiceRow key={v.id} v={v} onDelete={() => remove(v.id, v.name)} />
            ))}
          </>
        )}
        {!loading && premade.length > 0 && (
          <>
            <div style={{ fontWeight: 600, marginTop: 12, marginBottom: 4 }}>Premade ({premade.length})</div>
            <p style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Built-in ElevenLabs voices — listed but not deletable.</p>
          </>
        )}
        {!loading && voices.length === 0 && <p style={{ color: 'var(--muted)' }}>No voices found.</p>}
      </div>
    </div>
  );
}

function VoiceRow({ v, onDelete }: { v: Voice; onDelete: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: '1px solid #1a1a1a' }}>
      <span style={{ flex: 1, color: 'var(--text)' }}>{v.name}</span>
      {v.description && <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{v.description}</span>}
      <button onClick={onDelete} style={{ ...voiceBtn(false), background: '#333', padding: '4px 10px', fontSize: '.78rem' }}>
        Delete
      </button>
    </div>
  );
}

const voiceInp: React.CSSProperties = {
  background: '#181818',
  border: '1px solid #333',
  borderRadius: 6,
  padding: '8px 10px',
  color: '#eee',
  fontSize: 14,
};
const voiceBtn = (busy: boolean): React.CSSProperties => ({
  background: busy ? '#555' : 'linear-gradient(135deg,#c97a3f,#b56532)',
  color: 'white',
  border: 0,
  borderRadius: 6,
  padding: '8px 14px',
  fontWeight: 600,
  cursor: busy ? 'wait' : 'pointer',
  fontSize: 14,
  alignSelf: 'start',
});
