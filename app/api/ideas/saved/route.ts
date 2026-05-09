import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('saved_ideas')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('saved_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ideas: data });
}

const SaveSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(''),
  viral_score: z.number().int().min(0).max(100).default(85),
  tier: z.string().max(40).default('VIRAL HIT'),
  outlier_factor: z.string().max(120).default(''),
  viewer_payoff: z.string().max(120).default(''),
  niche: z.string().max(120).default(''),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  // De-dupe by title
  const { data: existing } = await supabase
    .from('saved_ideas')
    .select('id')
    .eq('user_id', auth.user.id)
    .eq('title', parsed.data.title)
    .maybeSingle();
  if (existing) return NextResponse.json({ idea: existing, dedup: true });

  const { data, error } = await supabase
    .from('saved_ideas')
    .insert({ ...parsed.data, user_id: auth.user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ idea: data });
}
