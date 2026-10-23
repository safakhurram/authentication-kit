-- Run once in Supabase -> SQL Editor.
-- Creates the public profile table used by auth-kit (name configurable in auth.config.js -> profile.table).
-- If you set profile.sync = false you do NOT need this file.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
  on public.users for select to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
  on public.users for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
