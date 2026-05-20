-- ─────────────────────────────────────────────────────────────────────────────
-- 0002_media_pipeline.sql
-- Adds the audio/image/video media pipeline:
--   • media_assets — every generated audio/image/video file lives here
--   • render_jobs  — async generation jobs (TTS, image, video, full-assembly)
--   • workbook-audio / workbook-video storage buckets
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists media_assets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users on delete cascade not null,
  workbook_id     uuid references workbooks(id) on delete cascade,
  kind            text not null check (kind in ('audio', 'image', 'video')),
  provider        text not null,                -- 'elevenlabs' | 'openai' | 'replicate' | ...
  provider_model  text,                         -- 'eleven_turbo_v2_5' | 'gpt-image-1' | 'kling-v2.1' | ...
  storage_path    text not null,                -- path within Supabase Storage bucket
  public_url      text,                         -- cached public URL
  duration_ms     int,                          -- audio/video duration if known
  width           int,
  height          int,
  prompt          text,                         -- prompt or input script
  meta            jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists media_assets_user_idx on media_assets(user_id, created_at desc);
create index if not exists media_assets_wb_idx   on media_assets(workbook_id, created_at desc);

create table if not exists render_jobs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users on delete cascade not null,
  workbook_id     uuid references workbooks(id) on delete cascade,
  kind            text not null check (kind in ('tts', 'image', 'video', 'assembly')),
  provider        text not null,
  provider_job_id text,                         -- id at the upstream provider (Replicate prediction id, etc.)
  status          text not null default 'queued' check (status in ('queued', 'processing', 'done', 'failed', 'canceled')),
  input           jsonb not null default '{}'::jsonb,
  output          jsonb default '{}'::jsonb,    -- { asset_id, url, ... } once done
  error           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists render_jobs_user_idx on render_jobs(user_id, created_at desc);
create index if not exists render_jobs_status_idx on render_jobs(status, created_at);

-- RLS
alter table media_assets enable row level security;
alter table render_jobs  enable row level security;

drop policy if exists "media_owner_all" on media_assets;
create policy "media_owner_all" on media_assets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "jobs_owner_all" on render_jobs;
create policy "jobs_owner_all" on render_jobs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- touch updated_at on render_jobs
drop trigger if exists render_jobs_touch on render_jobs;
create trigger render_jobs_touch before update on render_jobs
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage buckets for generated audio + video
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
  values ('workbook-audio', 'workbook-audio', true, 52428800)  -- 50 MB
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
  values ('workbook-video', 'workbook-video', true, 524288000) -- 500 MB
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
  values ('workbook-generated', 'workbook-generated', true, 16777216) -- 16 MB (generated images)
  on conflict (id) do nothing;

drop policy if exists "wb_audio_owner_rw" on storage.objects;
create policy "wb_audio_owner_rw" on storage.objects for all
  using (bucket_id = 'workbook-audio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'workbook-audio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "wb_audio_public_read" on storage.objects;
create policy "wb_audio_public_read" on storage.objects for select using (bucket_id = 'workbook-audio');

drop policy if exists "wb_video_owner_rw" on storage.objects;
create policy "wb_video_owner_rw" on storage.objects for all
  using (bucket_id = 'workbook-video' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'workbook-video' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "wb_video_public_read" on storage.objects;
create policy "wb_video_public_read" on storage.objects for select using (bucket_id = 'workbook-video');

drop policy if exists "wb_gen_owner_rw" on storage.objects;
create policy "wb_gen_owner_rw" on storage.objects for all
  using (bucket_id = 'workbook-generated' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'workbook-generated' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "wb_gen_public_read" on storage.objects;
create policy "wb_gen_public_read" on storage.objects for select using (bucket_id = 'workbook-generated');
