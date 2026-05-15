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
