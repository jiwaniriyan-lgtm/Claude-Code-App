import type { Provider, ProviderId, AssetKind, ProviderDescriptor } from './types';
import { replicateProvider } from './replicate-provider';
import { elevenLabsProvider } from './elevenlabs-provider';
import { openaiTtsProvider } from './openai-tts-provider';
import { playHtProvider } from './playht-provider';
import { imagineArtProvider } from './imagineart-provider';
import { picsArtProvider } from './picsart-provider';
import { heyGenProvider } from './heygen-provider';
import { higgsfieldProvider } from './higgsfield-provider';
import { vertexImagenProvider } from './vertex-imagen-provider';
import { vidIqProvider, inVideoProvider, googleImageFxProvider } from './external-providers';

export const ALL_PROVIDERS: Provider[] = [
  // image / thumbnail
  replicateProvider,
  imagineArtProvider,
  picsArtProvider,
  vertexImagenProvider,
  googleImageFxProvider,
  // video
  heyGenProvider,
  higgsfieldProvider,
  inVideoProvider,
  // voice
  elevenLabsProvider,
  openaiTtsProvider,
  playHtProvider,
  // research
  vidIqProvider,
];

export function getProvider(id: ProviderId): Provider | undefined {
  return ALL_PROVIDERS.find((p) => p.descriptor.id === id);
}

export function providersForKind(kind: AssetKind): Provider[] {
  return ALL_PROVIDERS.filter((p) => p.supports(kind));
}

export type ProviderListEntry = ProviderDescriptor & {
  configured: boolean;
  status: 'ready' | 'unconfigured' | 'external' | 'research';
};

export function listProviders(kind?: AssetKind): ProviderListEntry[] {
  const set = kind ? providersForKind(kind) : ALL_PROVIDERS;
  return set.map((p) => {
    const configured = p.isConfigured();
    let status: ProviderListEntry['status'] = configured ? 'ready' : 'unconfigured';
    if (p.descriptor.mode === 'external') status = 'external';
    if (p.descriptor.mode === 'research') status = 'research';
    return { ...p.descriptor, configured, status };
  });
}
