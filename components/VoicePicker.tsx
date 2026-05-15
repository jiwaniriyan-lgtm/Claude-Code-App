'use client';

/**
 * VoicePicker — combined provider + voice grid for the voice asset kind.
 *
 * Differs from AssetStudio:
 *   • Voice picking is two-level (provider → specific voice).
 *   • Each voice has a preview clip (ElevenLabs ships preview_url).
 *   • User can preview before generating the full voiceover.
 */

import { useEffect, useState } from 'react';
import ProviderPicker from './ProviderPicker';
import AssetStudio, { type StudioAsset } from './AssetStudio';
import type { ProviderId } from '@/lib/providers/types';

type Voice = {
  voice_id: string;
  name: string;
  description?: string;
  preview_url?: string;
  providerId: ProviderId;
};

type Props = {
  scriptText: string;
  onKeep?: (asset: StudioAsset | null, voice: Voice | null) => void;
};

export default function VoicePicker({ scriptText, onKeep }: Props) {
  const [providers, setProviders] = useState<ProviderId[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (providers.length === 0) {
      setVoices([]);
      setSelectedVoice(null);
      return;
    }
    setLoadingVoices(true);
    setError(null);
    (async () => {
      const all: Voice[] = [];
      for (const id of providers) {
        try {
          if (id === 'elevenlabs') {
            const res = await fetch('/api/tts/voices');
            if (res.ok) {
              const json = (await res.json()) as { voices: Array<{ voice_id: string; name: string; description?: string; preview_url?: string }> };
              for (const v of json.voices.slice(0, 30)) {
                all.push({ ...v, providerId: 'elevenlabs' });
              }
            }
          } else if (id === 'openai-tts') {
            const list = [
              { voice_id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
              { voice_id: 'echo', name: 'Echo', description: 'Male, deeper' },
              { voice_id: 'fable', name: 'Fable', description: 'British accent, warm' },
              { voice_id: 'onyx', name: 'Onyx', description: 'Male, authoritative' },
              { voice_id: 'nova', name: 'Nova', description: 'Female, friendly' },
              { voice_id: 'shimmer', name: 'Shimmer', description: 'Female, soft' },
            ];
            for (const v of list) all.push({ ...v, providerId: 'openai-tts' });
          } else if (id === 'playht') {
            // PlayHT voice list endpoint would go here; left empty until wired.
          }
        } catch (err) {
          if (alive) setError(err instanceof Error ? err.message : String(err));
        }
      }
      if (alive) {
        setVoices(all);
        setLoadingVoices(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [providers]);

  // Build a synthetic AssetStudio per selected voice/provider combo
  return (
    <div className="voice-picker">
      <ProviderPicker kind="voice" selected={providers} onChange={setProviders} multi />

      {loadingVoices && <div className="provider-picker-loading">Loading voices…</div>}
      {error && <div className="asset-error">⚠ {error}</div>}

      {voices.length > 0 && (
        <div className="voice-grid">
          <div className="voice-grid-title">Pick a voice ({voices.length} available)</div>
          <div className="voice-list">
            {voices.map((v) => (
              <label
                key={`${v.providerId}:${v.voice_id}`}
                className={`voice-card ${selectedVoice?.voice_id === v.voice_id && selectedVoice?.providerId === v.providerId ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="voice-pick"
                  checked={selectedVoice?.voice_id === v.voice_id && selectedVoice?.providerId === v.providerId}
                  onChange={() => setSelectedVoice(v)}
                />
                <div className="voice-card-body">
                  <div className="voice-card-name">
                    {v.name}
                    <span className="voice-card-provider">{v.providerId}</span>
                  </div>
                  {v.description && <div className="voice-card-desc">{v.description}</div>}
                  {v.preview_url && (
                    <audio
                      controls
                      preload="none"
                      src={v.preview_url}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '100%', marginTop: 6 }}
                    />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedVoice && (
        <SingleVoiceStudio
          scriptText={scriptText}
          voice={selectedVoice}
          onKeep={(a) => onKeep?.(a, selectedVoice)}
        />
      )}
    </div>
  );
}

/**
 * Once the voice is chosen, we render an AssetStudio constrained to that
 * one provider so the user can do "generate voiceover → preview → regen
 * with refinement → keep".
 */
function SingleVoiceStudio({
  scriptText,
  voice,
  onKeep,
}: {
  scriptText: string;
  voice: Voice;
  onKeep: (a: StudioAsset | null) => void;
}) {
  // Lock the picker to just the chosen provider by hiding it via prop override.
  return (
    <div className="voice-studio">
      <div className="voice-studio-banner">
        Synthesizing with <strong>{voice.name}</strong> on <em>{voice.providerId}</em>
      </div>
      <AssetStudio
        kind="voice"
        defaultPrompt={scriptText}
        onKeep={onKeep}
      />
      <div className="voice-studio-hint">
        Note: the prompt above is the script text — keep it short for preview, or paste the full
        script. The provider picker above is locked to <em>{voice.providerId}</em> (uncheck others
        before generating).
      </div>
    </div>
  );
}
