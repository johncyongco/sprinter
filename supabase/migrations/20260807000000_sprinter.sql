-- Sprinter — publish/continue schema
-- Only published works live here. Drafts and saved seeds stay local.

create extension if not exists "pgcrypto";

-- A published story (a seed that was shared to the Explore library).
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  cover text,
  seed_author_id text not null default 'me',
  genres text[] not null default '{}',
  emotion text[] not null default '{}',
  themes text[] not null default '{}',
  perspective text not null default 'Third',
  pacing text not null default 'Measured',
  status text not null default 'Seed',
  body text not null default '',
  words integer not null default 0,
  reading_minutes integer not null default 1,
  beautiful_words jsonb not null default '[]',
  completion integer not null default 5,
  is_editorial_pick boolean not null default false,
  is_weekly_prompt boolean not null default false,
  challenge_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A branch continued from a published story.
create table if not exists public.continuations (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  parent_id uuid references public.continuations (id) on delete set null,
  type text not null default 'Continue',
  author_id text not null default 'me',
  title text not null default '',
  body text not null default '',
  words integer not null default 0,
  beautiful_word_ids text[] not null default '{}',
  is_seed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists continuations_story_id_idx on public.continuations (story_id);
create index if not exists continuations_author_id_idx on public.continuations (author_id);
create index if not exists stories_author_id_idx on public.stories (seed_author_id);

-- Row Level Security: anyone can read published stories, but only the
-- author can create/update/delete their own rows. This keeps the anon
-- key safe in the frontend.
alter table public.stories enable row level security;
alter table public.continuations enable row level security;

drop policy if exists "public read stories" on public.stories;
create policy "public read stories"
on public.stories for select to anon
using (true);

drop policy if exists "author insert stories" on public.stories;
create policy "author insert stories"
on public.stories for insert to anon
with check (seed_author_id = 'me');

drop policy if exists "author update stories" on public.stories;
create policy "author update stories"
on public.stories for update to anon
using (seed_author_id = 'me');

drop policy if exists "public read continuations" on public.continuations;
create policy "public read continuations"
on public.continuations for select to anon
using (true);

drop policy if exists "author insert continuations" on public.continuations;
create policy "author insert continuations"
on public.continuations for insert to anon
with check (author_id = 'me');

drop policy if exists "author update continuations" on public.continuations;
create policy "author update continuations"
on public.continuations for update to anon
using (author_id = 'me');
