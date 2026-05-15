import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers/registry';
import type { GenerateParams, ProviderId } from '@/lib/providers/types';

type Body = GenerateParams & { providerId: ProviderId };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.providerId) return NextResponse.json({ error: 'providerId required' }, { status: 400 });
  if (!body.kind) return NextResponse.json({ error: 'kind required' }, { status: 400 });
  if (!body.prompt?.trim()) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  const provider = getProvider(body.providerId);
  if (!provider) return NextResponse.json({ error: `Unknown provider: ${body.providerId}` }, { status: 404 });
  if (!provider.supports(body.kind)) {
    return NextResponse.json(
      { error: `${provider.descriptor.name} does not support ${body.kind}` },
      { status: 400 },
    );
  }

  const result = await provider.generate(body);
  return NextResponse.json({ result, providerId: body.providerId });
}
