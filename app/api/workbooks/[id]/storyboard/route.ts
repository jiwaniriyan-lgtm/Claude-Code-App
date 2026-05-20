import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildStoryboard } from '@/lib/assembly/parseStoryboard';

export const runtime = 'nodejs';

/**
 * Parse a workbook's state outputs into a storyboard-ready shape:
 *   { script, scriptForVoice, imagePrompts, videoPrompts, voiceNotes }
 *
 * Powers the one-click "Generate full video" flow in /studio/from-workbook/[id].
 */
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const supa = createClient();
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: wb, error } = await supa
    .from('workbooks')
    .select('id, name, niche, idea_title, idea_description, current_state_idx')
    .eq('id', ctx.params.id)
    .eq('user_id', auth.user.id)
    .single();
  if (error || !wb) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: states } = await supa
    .from('workbook_states')
    .select('state_n, output, metadata')
    .eq('workbook_id', wb.id);

  const byN: Record<number, string> = {};
  let duration = '10';
  for (const s of states || []) {
    byN[s.state_n as number] = (s.output as string) || '';
    const md = (s.metadata as Record<string, unknown>) || {};
    if (s.state_n === 4 && typeof md.duration === 'string') duration = md.duration as string;
  }

  const storyboard = buildStoryboard(byN);
  return NextResponse.json({
    workbook: {
      id: wb.id,
      name: wb.name,
      niche: wb.niche,
      ideaTitle: wb.idea_title,
      ideaDescription: wb.idea_description,
    },
    duration,
    ...storyboard,
  });
}
