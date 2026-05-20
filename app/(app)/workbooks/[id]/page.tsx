import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkbookEditor from '@/components/WorkbookEditor';
import type { Workbook, WorkbookStateData } from '@/lib/types';

export const dynamic = 'force-dynamic';

type StateRow = {
  state_n: number;
  input: string;
  output: string;
  skipped: boolean;
  metadata: Record<string, unknown>;
};

type ImageRow = {
  id: string;
  state_n: number;
  kind: 'style' | 'thumbnail';
  storage_path: string;
  ord: number;
};

export default async function WorkbookEditorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: wb } = await supabase.from('workbooks').select('*').eq('id', params.id).single();
  if (!wb) notFound();

  const { data: states } = await supabase
    .from('workbook_states')
    .select('*')
    .eq('workbook_id', params.id)
    .order('state_n');
  const { data: images } = await supabase.from('workbook_images').select('*').eq('workbook_id', params.id).order('ord');

  const enrichedStates: WorkbookStateData[] = (states as StateRow[] || []).map((s) => ({
    n: s.state_n,
    input: s.input,
    output: s.output,
    skipped: s.skipped,
    duration: (s.metadata as { duration?: string })?.duration,
    generateVideo: (s.metadata as { generateVideo?: boolean })?.generateVideo,
    transcripts: (s.metadata as { transcripts?: string[] })?.transcripts,
  }));

  // Pad to length 9 in case of missing rows (shouldn't happen, but defensive)
  while (enrichedStates.length < 9) {
    const n = enrichedStates.length + 1;
    enrichedStates.push({ n, input: '', output: '', skipped: false });
  }

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workbook-images/`;
  const imagesWithUrls = ((images as ImageRow[]) || []).map((i) => ({ ...i, url: baseUrl + i.storage_path }));

  const wbData: Workbook = {
    ...(wb as Workbook),
    states: enrichedStates,
  };

  // Show the "Render full video" link once the script + image-prompt states
  // have outputs to feed the pipeline.
  const hasScript = (enrichedStates[3]?.output || '').length > 100;
  const hasImagePrompts = (enrichedStates[4]?.output || '').includes('SCENE');

  return (
    <>
      {hasScript && hasImagePrompts && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #222', background: '#0a0a0a', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#aaa', fontSize: 13 }}>✨ Ready to render a final video from this workbook.</span>
          <Link
            href={`/studio/from-workbook/${params.id}`}
            style={{
              background: 'linear-gradient(135deg,#c97a3f,#b56532)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Render full video →
          </Link>
        </div>
      )}
      <WorkbookEditor workbook={wbData} images={imagesWithUrls} />
    </>
  );
}
