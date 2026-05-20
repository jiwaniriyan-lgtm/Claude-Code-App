-- Generated assets — every image/video/voice/thumbnail produced through the
-- provider picker. Keeps a full history per workbook so users can browse,
-- re-pick, and the workbook page can render galleries.
--
-- One row per generation attempt (not per "kept" asset). The `kept` flag
-- marks the user's final selection; multiple rows per workbook/kind are
-- expected during regeneration cycles.

create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  workbook_id uuid not null references public.workbooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  state_n int,                                   -- which workbook state produced it (5/6/7/etc.)
  kind text not null check (kind in ('image','video','thumbnail','voice')),
  provider_id text not null,                     -- e.g. 'replicate','elevenlabs','heygen'
  prompt text not null,
  refinement text,                               -- additional prompt the user added on regen
  reference_image_url text,                      -- for img2video / thumbnail style
  voice_id text,                                 -- for voice generations
  asset_url text,                                -- final URL once ready (Supabase storage or provider CDN)
  provider_job_id text,                          -- async job id, while processing
  status text not null default 'pending'
    check (status in ('pending','processing','ready','error','external')),
  error text,
  kept boolean not null default false,           -- user marked this one as final
  meta jsonb not null default '{}',              -- provider-specific extras
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generated_assets_workbook_idx on public.generated_assets(workbook_id);
create index if not exists generated_assets_workbook_kind_idx on public.generated_assets(workbook_id, kind);
create index if not exists generated_assets_user_idx on public.generated_assets(user_id);
create index if not exists generated_assets_status_idx on public.generated_assets(status) where status in ('pending','processing');

alter table public.generated_assets enable row level security;

create policy "generated_assets_select_own"
  on public.generated_assets for select
  using (auth.uid() = user_id);

create policy "generated_assets_insert_own"
  on public.generated_assets for insert
  with check (auth.uid() = user_id);

create policy "generated_assets_update_own"
  on public.generated_assets for update
  using (auth.uid() = user_id);

create policy "generated_assets_delete_own"
  on public.generated_assets for delete
  using (auth.uid() = user_id);

-- Touch updated_at on any row update
create or replace function public.touch_generated_assets_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_generated_assets_touch on public.generated_assets;
create trigger trg_generated_assets_touch
  before update on public.generated_assets
  for each row execute function public.touch_generated_assets_updated_at();
