import { NextResponse } from 'next/server';
import { listProviders } from '@/lib/providers/registry';
import type { AssetKind } from '@/lib/providers/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const kind = url.searchParams.get('kind') as AssetKind | null;
  const providers = listProviders(kind ?? undefined);
  return NextResponse.json({ providers });
}
