'use client';

import Link from 'next/link';
import { useState } from 'react';
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
