import { createClient } from '@/lib/supabase/server';
import HistoryClient from './history-client';
import type { SavedIdea } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('saved_ideas')
    .select('*')
    .order('saved_at', { ascending: false });
  const ideas = (data || []) as SavedIdea[];
  return <HistoryClient initial={ideas} />;
}
