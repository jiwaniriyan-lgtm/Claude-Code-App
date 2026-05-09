import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(_request: Request, { params }: { params: { id: string; imgId: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ownership: workbook must belong to user, image must belong to workbook
  const { data: img } = await supabase
    .from('workbook_images')
    .select('id, workbook_id, storage_path')
    .eq('id', params.imgId)
    .single();
  if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: wb } = await supabase
    .from('workbooks')
    .select('id')
    .eq('id', img.workbook_id)
    .eq('user_id', auth.user.id)
    .single();
  if (!wb || wb.id !== params.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await supabase.storage.from('workbook-images').remove([img.storage_path]);
  await supabase.from('workbook_images').delete().eq('id', img.id);

  return NextResponse.json({ ok: true });
}
