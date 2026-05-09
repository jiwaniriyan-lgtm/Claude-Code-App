import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { workbookProgress, formatRelative } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type WbRow = {
  id: string;
  name: string;
  niche: string | null;
  idea_title: string;
  updated_at: string;
};
type StateRow = { workbook_id: string; state_n: number; output: string; skipped: boolean };

export default async function WorkbooksListPage() {
  const supabase = createClient();
  const { data: workbooks } = await supabase.from('workbooks').select('*').order('updated_at', { ascending: false });

  const ids = (workbooks || []).map((w: WbRow) => w.id);
  let statesByWb: Record<string, StateRow[]> = {};
  if (ids.length) {
    const { data: states } = await supabase.from('workbook_states').select('workbook_id, state_n, output, skipped').in('workbook_id', ids);
    for (const s of (states || []) as StateRow[]) (statesByWb[s.workbook_id] ||= []).push(s);
  }

  return (
    <div className="page-shell">
      <div className="list-header-row">
        <div>
          <h2>📒 Workbooks</h2>
          <p className="sub">Your active and completed Deep Dive projects.</p>
        </div>
      </div>

      {!workbooks || workbooks.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📓</div>
          <p>No workbooks yet. Generate ideas and click 🚀 Deep Dive to start one.</p>
          <Link href="/generate" className="tier-cta primary" style={{ display: 'inline-block', marginTop: 16, width: 'auto', padding: '10px 20px' }}>
            Generate ideas →
          </Link>
        </div>
      ) : (
        <div className="ideas-grid">
          {(workbooks as WbRow[]).map((w) => {
            const states = statesByWb[w.id] || [];
            const progress = workbookProgress({ states: states.map((s) => ({ n: s.state_n, input: '', output: s.output, skipped: s.skipped })) });
            return (
              <Link key={w.id} href={`/workbooks/${w.id}`} className="workbook-card" style={{ textDecoration: 'none' }}>
                <div className="wb-name">{w.name}</div>
                <div className="wb-meta">
                  <span className="history-niche-tag">{w.niche || 'General'}</span>
                  <span>·</span>
                  <span>{progress.pct}% complete</span>
                  <span>·</span>
                  <span>Updated {formatRelative(w.updated_at)}</span>
                </div>
                <div className="wb-progress-bar">
                  <div className="wb-progress-fill" style={{ width: `${progress.pct}%` }} />
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{w.idea_title}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
