import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) not set');
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');

export const supa = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const VIDEO_BUCKET = 'workbook-video';
