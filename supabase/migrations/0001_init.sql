-- CopperAI V2 schema (Section 11.2 of COPPERAI_BRIEF.md)
-- Run with: supabase db push, or paste into the SQL editor.

-- ─────────────────────────────────────────────────────────────────────────────
-- Profiles (1:1 with auth.users) — tracks tier, billing, trial
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id                       uuid primary key references auth.users on delete cascade,
  email                    text,
  tier                     text not null default 'free' check (tier in ('free','creator','pro','agency')),
  stripe_customer_id       text unique,
  stripe_subscription_id   text unique,
  trial_ends_at            timestamptz,
  current_period_end       timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Workbooks
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists workbooks (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users on delete cascade not null,
  name                text not null,
  niche               text,
  idea_title          text not null,
  idea_description    text,
  idea_score          int,
  setup_mode          text check (setup_mode in ('clone','own') or setup_mode is null),
  current_state_idx   int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists workbooks_user_updated_idx on workbooks(user_id, updated_at desc);

create table if not exists workbook_states (
  id           uuid primary key default gen_random_uuid(),
  workbook_id  uuid references workbooks on delete cascade not null,
  state_n      int not null check (state_n between 1 and 9),
  input        text not null default '',
  output       text not null default '',
  skipped      boolean not null default false,
  metadata     jsonb not null default '{}'::jsonb,    -- {duration, generateVideo, transcripts:[]}
  unique (workbook_id, state_n)
);

create index if not exists workbook_states_wb_idx on workbook_states(workbook_id, state_n);

create table if not exists workbook_images (
  id           uuid primary key default gen_random_uuid(),
  workbook_id  uuid references workbooks on delete cascade not null,
  state_n      int not null,
  kind         text not null check (kind in ('style','thumbnail')),
  storage_path text not null,
  ord          int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists workbook_images_wb_idx on workbook_images(workbook_id, state_n);

-- ─────────────────────────────────────────────────────────────────────────────
-- Saved ideas (history)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists saved_ideas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users on delete cascade not null,
  title           text not null,
  description     text,
  viral_score     int,
  tier            text,
  outlier_factor  text,
  viewer_payoff   text,
  niche           text,
  saved_at        timestamptz not null default now()
);

create index if not exists saved_ideas_user_idx on saved_ideas(user_id, saved_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Usage log (rate limiting + billing analytics)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists usage_log (
  id          bigserial primary key,
  user_id     uuid references auth.users on delete cascade not null,
  endpoint    text not null,            -- 'generate_ideas' | 'generate_state' | 'generate_state_n2' etc.
  state_n     int,
  tokens_in   int,
  tokens_out  int,
  cost_usd    numeric(10,6),
  created_at  timestamptz not null default now()
);

create index if not exists usage_log_user_idx on usage_log(user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table profiles         enable row level security;
alter table workbooks        enable row level security;
alter table workbook_states  enable row level security;
alter table workbook_images  enable row level security;
alter table saved_ideas      enable row level security;
alter table usage_log        enable row level security;

-- profiles: each user reads/updates own row
drop policy if exists "profiles_self_select" on profiles;
create policy "profiles_self_select" on profiles for select using (auth.uid() = id);
drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles for update using (auth.uid() = id);

-- workbooks: full CRUD on own
drop policy if exists "wb_owner_all" on workbooks;
create policy "wb_owner_all" on workbooks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wbs_owner_all" on workbook_states;
create policy "wbs_owner_all" on workbook_states for all
  using (exists (select 1 from workbooks w where w.id = workbook_id and w.user_id = auth.uid()))
  with check (exists (select 1 from workbooks w where w.id = workbook_id and w.user_id = auth.uid()));

drop policy if exists "wbi_owner_all" on workbook_images;
create policy "wbi_owner_all" on workbook_images for all
  using (exists (select 1 from workbooks w where w.id = workbook_id and w.user_id = auth.uid()))
  with check (exists (select 1 from workbooks w where w.id = workbook_id and w.user_id = auth.uid()));

drop policy if exists "ideas_owner_all" on saved_ideas;
create policy "ideas_owner_all" on saved_ideas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "usage_self_select" on usage_log;
create policy "usage_self_select" on usage_log for select using (auth.uid() = user_id);
-- Inserts to usage_log come from the server using the service-role key, which
-- bypasses RLS — so no INSERT policy needed.

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage bucket for workbook reference images
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
  values ('workbook-images', 'workbook-images', true, 8388608) -- 8 MB cap
  on conflict (id) do nothing;

drop policy if exists "wb_images_owner_rw" on storage.objects;
create policy "wb_images_owner_rw" on storage.objects for all
  using (bucket_id = 'workbook-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'workbook-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "wb_images_public_read" on storage.objects;
create policy "wb_images_public_read" on storage.objects for select using (bucket_id = 'workbook-images');

-- ─────────────────────────────────────────────────────────────────────────────
-- Touch updated_at on workbooks
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists wb_touch on workbooks;
create trigger wb_touch before update on workbooks for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch on profiles;
create trigger profiles_touch before update on profiles for each row execute function public.touch_updated_at();
