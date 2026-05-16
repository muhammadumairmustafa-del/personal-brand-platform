-- Run this in the Supabase SQL editor (Dashboard > SQL > New query)
-- It creates a single key-value table per user, plus row-level security.

create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Index for fast bulk-load by user
create index if not exists user_data_user_id_idx on public.user_data(user_id);

-- Row Level Security: a user can only see/modify their own rows
alter table public.user_data enable row level security;

drop policy if exists "Users read own data" on public.user_data;
create policy "Users read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own data" on public.user_data;
create policy "Users insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own data" on public.user_data;
create policy "Users update own data"
  on public.user_data for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own data" on public.user_data;
create policy "Users delete own data"
  on public.user_data for delete
  using (auth.uid() = user_id);

-- Helper trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_data_set_updated_at on public.user_data;
create trigger user_data_set_updated_at
  before update on public.user_data
  for each row execute function public.set_updated_at();

-- =========================================================================
-- STORAGE BUCKET for Proof Vault uploads
-- =========================================================================
-- Run this to enable image uploads (screenshots, testimonials, etc.) in the Proof Vault.
-- Without it, uploads will fail with a 500 from /api/upload.

-- Create the public-read bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('proof', 'proof', true)
on conflict (id) do nothing;

-- Users may upload to a path that starts with their own user_id
drop policy if exists "Users upload own proof" on storage.objects;
create policy "Users upload own proof"
  on storage.objects for insert
  with check (
    bucket_id = 'proof'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users may delete their own uploads
drop policy if exists "Users delete own proof" on storage.objects;
create policy "Users delete own proof"
  on storage.objects for delete
  using (
    bucket_id = 'proof'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read on the bucket (anyone with the URL can fetch the image)
drop policy if exists "Anyone reads proof" on storage.objects;
create policy "Anyone reads proof"
  on storage.objects for select
  using (bucket_id = 'proof');

-- =========================================================================
-- PUBLIC PROFILE PAGE VIEWS
-- =========================================================================
-- Tracks visits to /u/<username>. Inserted via service-role from /api/track
-- (the route is intentionally public, so RLS is "service role only").

create table if not exists public.page_views (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  path text,
  referrer text,
  user_agent text,
  viewed_at timestamptz not null default now()
);

create index if not exists page_views_user_id_idx on public.page_views(user_id, viewed_at desc);
create index if not exists page_views_username_idx on public.page_views(username);

alter table public.page_views enable row level security;

drop policy if exists "Users read own page views" on public.page_views;
create policy "Users read own page views"
  on public.page_views for select
  using (auth.uid() = user_id);

-- =========================================================================
-- NEWSLETTER SUBSCRIBERS
-- =========================================================================
-- One row per (owner, subscriber email). Double-opt-in: `confirmed_at` is null
-- until the subscriber clicks the confirmation link.

create table if not exists public.subscribers (
  id bigserial primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text,
  source text,
  confirm_token text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (owner_id, email)
);

create index if not exists subscribers_owner_idx on public.subscribers(owner_id, created_at desc);

alter table public.subscribers enable row level security;

drop policy if exists "Owners read own subscribers" on public.subscribers;
create policy "Owners read own subscribers"
  on public.subscribers for select
  using (auth.uid() = owner_id);

drop policy if exists "Owners insert own subscribers" on public.subscribers;
create policy "Owners insert own subscribers"
  on public.subscribers for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Owners update own subscribers" on public.subscribers;
create policy "Owners update own subscribers"
  on public.subscribers for update
  using (auth.uid() = owner_id);

drop policy if exists "Owners delete own subscribers" on public.subscribers;
create policy "Owners delete own subscribers"
  on public.subscribers for delete
  using (auth.uid() = owner_id);

-- =========================================================================
-- SCHEDULED POSTS (queue for /api/cron/publish)
-- =========================================================================

create table if not exists public.scheduled_posts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  content text not null,
  metadata jsonb,
  scheduled_for timestamptz not null,
  status text not null default 'pending',
  attempts int not null default 0,
  last_error text,
  posted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists scheduled_posts_pending_idx
  on public.scheduled_posts(scheduled_for)
  where status = 'pending';

create index if not exists scheduled_posts_user_idx
  on public.scheduled_posts(user_id, scheduled_for desc);

alter table public.scheduled_posts enable row level security;

drop policy if exists "Users read own scheduled posts" on public.scheduled_posts;
create policy "Users read own scheduled posts"
  on public.scheduled_posts for select
  using (auth.uid() = user_id);

drop policy if exists "Users write own scheduled posts" on public.scheduled_posts;
create policy "Users write own scheduled posts"
  on public.scheduled_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own scheduled posts" on public.scheduled_posts;
create policy "Users update own scheduled posts"
  on public.scheduled_posts for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own scheduled posts" on public.scheduled_posts;
create policy "Users delete own scheduled posts"
  on public.scheduled_posts for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- POST PERFORMANCE (content feedback loop)
-- =========================================================================
-- Stores user-reported engagement on published posts. Powers "what worked"
-- analysis in the Hook Library and Content Engine.

create table if not exists public.post_performance (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id text,
  platform text,
  url text,
  hook text,
  impressions int,
  likes int,
  comments int,
  shares int,
  dms int,
  posted_at timestamptz,
  recorded_at timestamptz not null default now()
);

create index if not exists post_performance_user_idx
  on public.post_performance(user_id, recorded_at desc);

alter table public.post_performance enable row level security;

drop policy if exists "Users read own perf" on public.post_performance;
create policy "Users read own perf"
  on public.post_performance for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own perf" on public.post_performance;
create policy "Users insert own perf"
  on public.post_performance for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own perf" on public.post_performance;
create policy "Users update own perf"
  on public.post_performance for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own perf" on public.post_performance;
create policy "Users delete own perf"
  on public.post_performance for delete
  using (auth.uid() = user_id);
