'use client';

/**
 * AssetStudio — wraps a provider picker + generation + preview gallery
 * for ONE asset kind (image / video / thumbnail).
 *
 * Flow:
 *   1. User reads the AI-generated prompt (passed in as `defaultPrompt`).
 *   2. Picks one or more providers via ProviderPicker.
 *   3. Clicks Generate → spawns one job per selected provider.
 *   4. Previews stream in as jobs complete (polled via /api/providers/status).
 *   5. User can:
 *        - Add a refinement to the prompt and regenerate
 *        - Click ⭐ on a result to mark it as "kept" (the final selection)
 *
 * The component intentionally does NOT persist to Supabase yet — that
 * lands when we wire it into the WorkbookEditor. Here it manages local
 * state only. Parent can read `kept` via the onKeep callback.
 */

import { useEffect, useRef, useState } from 'react';
import ProviderPicker from './ProviderPicker';
import type { AssetKind, ProviderId, GenerateResult } from '@/lib/providers/types';

export type StudioAsset = {
  id: string;                   // local id (uuid)
  providerId: ProviderId;
  providerName: string;
  prompt: string;
  refinement?: string;
  status: 'pending' | 'processing' | 'ready' | 'error' | 'external';
  assetUrl?: string;
  error?: string;
  externalUrl?: string;
  externalInstructions?: string;
  jobId?: string;
  kept?: boolean;
};

type Props = {
  kind: AssetKind;
  defaultPrompt: string;
  /** For video: optional reference image URL (img2video) */
  referenceImageUrl?: string;
  /** For voice: voice id selected by the parent picker */
  voiceId?: string;
  /** Notified whenever the kept selection changes */
  onKeep?: (asset: StudioAsset | null) => void;
  /** Optional aspect-ratio default */
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
};

export default function AssetStudio({
  kind,
  defaultPrompt,
  referenceImageUrl,
  voiceId,
  onKeep,
  aspectRatio = '16:9',
}: Props) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [refinement, setRefinement] = useState('');
  const [providers, setProviders] = useState<ProviderId[]>([]);
  const [providerNames, setProviderNames] = useState<Record<ProviderId, string>>(
    {} as Record<ProviderId, string>,
  );
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const pollTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Hydrate provider name lookup so we can show pretty names without re-fetching
  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch(`/api/providers/list?kind=${kind}`);
      const json = (await res.json()) as { providers: Array<{ id: ProviderId; name: string }> };
      if (!alive) return;
      const map = {} as Record<ProviderId, string>;
      for (const p of json.providers) map[p.id] = p.name;
      setProviderNames(map);
    })();
    return () => {
      alive = false;
    };
  }, [kind]);

  useEffect(() => {
    setPrompt(defaultPrompt);
  }, [defaultPrompt]);

  useEffect(() => {
    const timers = pollTimers.current;
    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t));
    };
  }, []);

  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  async function pollJob(asset: StudioAsset) {
    if (!asset.jobId) return;
    try {
      const res = await fetch(
        `/api/providers/status?providerId=${asset.providerId}&jobId=${encodeURIComponent(asset.jobId)}`,
      );
      const json = (await res.json()) as { result: GenerateResult };
      const r = json.result;
      if (r.status === 'ready') {
        setAssets((prev) =>
          prev.map((a) => (a.id === asset.id ? { ...a, status: 'ready', assetUrl: r.assetUrl } : a)),
        );
        return;
      }
      if (r.status === 'error') {
        setAssets((prev) =>
          prev.map((a) => (a.id === asset.id ? { ...a, status: 'error', error: r.error } : a)),
        );
        return;
      }
      // still processing — schedule another poll
      pollTimers.current[asset.id] = setTimeout(() => pollJob(asset), 3000);
    } catch (err) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === asset.id
            ? { ...a, status: 'error', error: err instanceof Error ? err.message : String(err) }
            : a,
        ),
      );
    }
  }

  async function runOne(providerId: ProviderId, finalPrompt: string) {
    const localId = uid();
    const seed: StudioAsset = {
      id: localId,
      providerId,
      providerName: providerNames[providerId] || providerId,
      prompt: finalPrompt,
      refinement: refinement.trim() || undefined,
      status: 'pending',
    };
    setAssets((prev) => [seed, ...prev]);
    try {
      const res = await fetch('/api/providers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          kind,
          prompt: finalPrompt,
          referenceImageUrl,
          aspectRatio,
          voiceId,
        }),
      });
      const json = (await res.json()) as { result: GenerateResult };
      const r = json.result;
      if (r.status === 'ready') {
        setAssets((prev) =>
          prev.map((a) => (a.id === localId ? { ...a, status: 'ready', assetUrl: r.assetUrl } : a)),
        );
      } else if (r.status === 'processing') {
        const updated: StudioAsset = { ...seed, status: 'processing', jobId: r.jobId };
        setAssets((prev) => prev.map((a) => (a.id === localId ? updated : a)));
        pollTimers.current[localId] = setTimeout(() => pollJob(updated), 2500);
      } else if (r.status === 'external') {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === localId
              ? { ...a, status: 'external', externalUrl: r.openUrl, externalInstructions: r.instructions }
              : a,
          ),
        );
      } else if (r.status === 'unconfigured') {
        setAssets((prev) =>
          prev.map((a) => (a.id === localId ? { ...a, status: 'error', error: r.reason } : a)),
        );
      } else if (r.status === 'error') {
        setAssets((prev) =>
          prev.map((a) => (a.id === localId ? { ...a, status: 'error', error: r.error } : a)),
        );
      }
    } catch (err) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === localId
            ? { ...a, status: 'error', error: err instanceof Error ? err.message : String(err) }
            : a,
        ),
      );
    }
  }

  async function generate() {
    if (providers.length === 0) return;
    if (!prompt.trim()) return;
    setBusy(true);
    const finalPrompt = refinement.trim() ? `${prompt}\n\nADDITIONAL DIRECTION: ${refinement.trim()}` : prompt;
    await Promise.all(providers.map((id) => runOne(id, finalPrompt)));
    setBusy(false);
  }

  function setKept(asset: StudioAsset) {
    setAssets((prev) => prev.map((a) => ({ ...a, kept: a.id === asset.id })));
    onKeep?.({ ...asset, kept: true });
  }

  function removeAsset(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (pollTimers.current[id]) {
      clearTimeout(pollTimers.current[id]);
      delete pollTimers.current[id];
    }
  }

  const verb = kind === 'voice' ? 'Synthesize' : 'Generate';

  return (
    <div className="asset-studio">
      <ProviderPicker kind={kind} selected={providers} onChange={setProviders} multi />

      <div className="asset-studio-prompt">
        <div className="field-label">Prompt</div>
        <textarea
          className="dd-textarea"
          style={{ minHeight: 80 }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="The AI-generated prompt will appear here — edit as needed."
        />
        <div className="field-label" style={{ marginTop: 10 }}>
          Additional direction (optional)
        </div>
        <textarea
          className="dd-textarea"
          style={{ minHeight: 50 }}
          value={refinement}
          onChange={(e) => setRefinement(e.target.value)}
          placeholder="e.g. 'more cinematic lighting', 'darker mood', 'add text saying NEW'"
        />
      </div>

      <button
        type="button"
        className="ai-gen-btn"
        disabled={busy || providers.length === 0 || !prompt.trim()}
        onClick={generate}
      >
        {busy ? <span className="spinner" /> : null}
        <span>
          {busy
            ? `${verb}ing on ${providers.length} provider${providers.length === 1 ? '' : 's'}...`
            : providers.length === 0
              ? `Pick a provider above to ${verb.toLowerCase()}`
              : `⚡ ${verb} on ${providers.length} provider${providers.length === 1 ? '' : 's'}`}
        </span>
      </button>

      {assets.length > 0 && (
        <div className="asset-results">
          <div className="asset-results-title">Results</div>
          <div className="asset-grid">
            {assets.map((a) => (
              <AssetCard
                key={a.id}
                asset={a}
                kind={kind}
                onKeep={() => setKept(a)}
                onRemove={() => removeAsset(a.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetCard({
  asset,
  kind,
  onKeep,
  onRemove,
}: {
  asset: StudioAsset;
  kind: AssetKind;
  onKeep: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`asset-card ${asset.status} ${asset.kept ? 'kept' : ''}`}>
      <div className="asset-card-head">
        <span className="asset-card-provider">{asset.providerName}</span>
        <button type="button" className="asset-card-remove" onClick={onRemove}>
          ×
        </button>
      </div>
      <div className="asset-card-media">
        {asset.status === 'pending' && <div className="asset-spinner">Queueing…</div>}
        {asset.status === 'processing' && <div className="asset-spinner">Generating…</div>}
        {asset.status === 'error' && <div className="asset-error">⚠ {asset.error}</div>}
        {asset.status === 'external' && (
          <div className="asset-external">
            <p>{asset.externalInstructions}</p>
            {asset.externalUrl && (
              <a className="mini-btn" href={asset.externalUrl} target="_blank" rel="noreferrer noopener">
                Open ↗
              </a>
            )}
          </div>
        )}
        {asset.status === 'ready' && asset.assetUrl && (
          <>
            {kind === 'image' || kind === 'thumbnail' ? (
              <img src={asset.assetUrl} alt="generated" />
            ) : kind === 'video' ? (
              <video src={asset.assetUrl} controls preload="metadata" />
            ) : (
              <audio src={asset.assetUrl} controls preload="metadata" />
            )}
          </>
        )}
      </div>
      {asset.refinement && <div className="asset-card-refinement">+ {asset.refinement}</div>}
      {asset.status === 'ready' && (
        <button
          type="button"
          className={`asset-keep-btn ${asset.kept ? 'kept' : ''}`}
          onClick={onKeep}
        >
          {asset.kept ? '★ Kept' : '☆ Keep this'}
        </button>
      )}
    </div>
  );
}
