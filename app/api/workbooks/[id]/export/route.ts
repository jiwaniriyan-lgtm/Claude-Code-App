import { createClient } from '@/lib/supabase/server';
import { workbookToMarkdown } from '@/lib/exportMarkdown';
import type { Workbook } from '@/lib/types';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response('Unauthorized', { status: 401 });

  const { data: wb } = await supabase
    .from('workbooks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', auth.user.id)
    .single();
  if (!wb) return new Response('Not found', { status: 404 });

  const { data: states } = await supabase
    .from('workbook_states')
    .select('*')
    .eq('workbook_id', params.id)
    .order('state_n');

  const { data: images } = await supabase
    .from('workbook_images')
    .select('state_n, kind')
    .eq('workbook_id', params.id);

  type StateRow = { state_n: number; input: string; output: string; skipped: boolean; metadata: Record<string, unknown> };
  const fullStates = (states as StateRow[] || []).map((s) => ({
    n: s.state_n,
    input: s.input,
    output: s.output,
    skipped: s.skipped,
    duration: (s.metadata as { duration?: string })?.duration,
    generateVideo: (s.metadata as { generateVideo?: boolean })?.generateVideo,
    transcripts: (s.metadata as { transcripts?: string[] })?.transcripts,
    styleImages: (images || []).filter((i) => i.state_n === s.state_n && i.kind === 'style').map(() => 'attached'),
    thumbnailImages: (images || []).filter((i) => i.state_n === s.state_n && i.kind === 'thumbnail').map(() => 'attached'),
  }));

  const wbForExport: Workbook = {
    ...(wb as Workbook),
    states: fullStates,
  };
  const { filename, markdown } = workbookToMarkdown(wbForExport);

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
