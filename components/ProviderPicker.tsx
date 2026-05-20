'use client';

import { useEffect, useState } from 'react';
import type { AssetKind, ProviderId } from '@/lib/providers/types';

export type ProviderListEntry = {
  id: ProviderId;
  name: string;
  blurb: string;
  mode: 'api' | 'external' | 'research';
  configured: boolean;
  status: 'ready' | 'unconfigured' | 'external' | 'research';
  envKeys: string[];
  pricing?: string;
  signupUrl?: string;
  externalUrl?: string;
};

type Props = {
  kind: AssetKind;
  /** Currently selected provider ids (controlled). */
  selected: ProviderId[];
  onChange: (next: ProviderId[]) => void;
  /** If true, allow multi-select (default). Otherwise single. */
  multi?: boolean;
};

export default function ProviderPicker({ kind, selected, onChange, multi = true }: Props) {
  const [providers, setProviders] = useState<ProviderListEntry[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch(`/api/providers/list?kind=${kind}`);
      const json = (await res.json()) as { providers: ProviderListEntry[] };
      if (alive) setProviders(json.providers);
    })();
    return () => {
      alive = false;
    };
  }, [kind]);

  function toggle(id: ProviderId) {
    if (multi) {
      onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    } else {
      onChange(selected.includes(id) ? [] : [id]);
    }
  }

  if (!providers) {
    return <div className="provider-picker-loading">Loading providers…</div>;
  }

  return (
    <div className="provider-picker">
      <div className="provider-picker-title">
        Pick where to build the {kind}
        {multi && <span className="provider-picker-hint"> (check one or more)</span>}
      </div>
      <div className="provider-grid">
        {providers.map((p) => {
          const isSelected = selected.includes(p.id);
          const badge =
            p.status === 'ready'
              ? { label: '✓ Ready', cls: 'ready' }
              : p.status === 'unconfigured'
                ? { label: '+ Add API key', cls: 'needs-key' }
                : p.status === 'external'
                  ? { label: '↗ Opens externally', cls: 'external' }
                  : { label: 'Research', cls: 'research' };
          return (
            <label
              key={p.id}
              className={`provider-card ${isSelected ? 'selected' : ''} ${p.status}`}
              data-provider={p.id}
            >
              <input
                type={multi ? 'checkbox' : 'radio'}
                checked={isSelected}
                onChange={() => toggle(p.id)}
              />
              <div className="provider-card-body">
                <div className="provider-card-head">
                  <span className="provider-card-name">{p.name}</span>
                  <span className={`provider-badge ${badge.cls}`}>{badge.label}</span>
                </div>
                <div className="provider-card-blurb">{p.blurb}</div>
                {p.pricing && <div className="provider-card-meta">💰 {p.pricing}</div>}
                {p.status === 'unconfigured' && p.signupUrl && (
                  <a
                    href={p.signupUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="provider-card-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Get key → {p.envKeys.join(', ')}
                  </a>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
