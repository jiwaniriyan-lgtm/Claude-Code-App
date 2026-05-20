import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers/registry';
import type { ProviderId } from '@/lib/providers/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const providerId = url.searchParams.get('providerId') as ProviderId | null;
  const jobId = url.searchParams.get('jobId');
  if (!providerId || !jobId) {
    return NextResponse.json({ error: 'providerId and jobId required' }, { status: 400 });
  }
  const provider = getProvider(providerId);
  if (!provider) return NextResponse.json({ error: `Unknown provider: ${providerId}` }, { status: 404 });
  if (!provider.getStatus) {
    return NextResponse.json({ error: `${provider.descriptor.name} has no async status endpoint` }, { status: 400 });
  }
  const result = await provider.getStatus(jobId);
  return NextResponse.json({ result });
}
