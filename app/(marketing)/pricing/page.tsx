'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PRICING_TIERS } from '@/lib/constants';
import { useToast } from '@/components/Toast';

export default function PricingPage() {
  const { showToast } = useToast();
  const [busy, setBusy] = useState<string>('');

  async function start(tier: 'creator' | 'pro' | 'agency') {
    setBusy(tier);
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });
    setBusy('');
    if (res.status === 401) {
      window.location.href = `/login?next=/pricing`;
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Could not start checkout', 'error');
      return;
    }
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="page-shell">
      <h2 style={{ textAlign: 'center', fontSize: '2.4rem', letterSpacing: '-1px' }}>Pricing</h2>
      <p className="sub" style={{ textAlign: 'center' }}>
        Start free. Every paid plan includes a 7-day trial. Cancel anytime.
      </p>

      <div className="pricing-grid">
        {(['free', 'creator', 'pro', 'agency'] as const).map((id) => {
          const t = PRICING_TIERS[id];
          const featured = id === 'creator';
          return (
            <div key={id} className={`tier-card ${featured ? 'featured' : ''}`}>
              <div className="tier-name">{t.name}</div>
              <div className="tier-price">
                ${t.price}
                <small>{t.price ? `/${t.interval}` : ' · forever'}</small>
              </div>
              <ul className="tier-features">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {id === 'free' ? (
                <Link href="/login?next=/generate" className="tier-cta">Start free</Link>
              ) : (
                <button
                  type="button"
                  className={`tier-cta ${featured ? 'primary' : ''}`}
                  disabled={busy === id}
                  onClick={() => start(id)}
                >
                  {busy === id ? 'Starting...' : `Start ${t.name} trial`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem', marginTop: 32 }}>
        All plans use a single shared OpenAI key on our side — no API keys to manage.
        Need a custom plan? <a href="mailto:hello@copperai.app" style={{ color: 'var(--purple)' }}>Get in touch.</a>
      </p>
    </div>
  );
}
