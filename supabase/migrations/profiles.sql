-- Sprinter — profiles table (pen name sync across devices)
-- Run this once in supabase.pyl.world SQL editor, or via psql.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pen_name text not null default '',
  avatar text not null default 'Y',
  bio text not null default '',
  favorite_line text not null default '',
  genres text[] not null default '{}',
  favorite_word_ids text[] not null default '{}',
  goals jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "owner read profiles" on public.profiles;
create policy "owner read profiles"
on public.profiles for select to authenticated
using (auth.uid() = id);

drop policy if exists "owner insert profiles" on public.profiles;
create policy "owner insert profiles"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "owner update profiles" on public.profiles;
create policy "owner update profiles"
on public.profiles for update to authenticated
using (auth.uid() = id) with check (auth.uid() = id);
