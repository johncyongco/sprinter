-- Sprinter — publish/continue schema
-- Only published works live here. Drafts and saved seeds stay local.

create extension if not exists "pgcrypto";

-- A published story (a seed that was shared to the Explore library).
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  cover text,
  seed_author_id uuid,
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
  author_id uuid,
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

-- A writer's own unpublished seeds, synced to their account so saved work
-- survives across devices. Private — only the owner can read or write these.
create table if not exists public.saved_seeds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  slug text not null,
  title text not null,
  cover text,
  genres text[] not null default '{}',
  emotion text[] not null default '{}',
  themes text[] not null default '{}',
  perspective text not null default 'Third',
  pacing text not null default 'Measured',
  status text not null default 'Seed',
  body text not null default '',
  words integer not null default 0,
  reading_minutes integer not null default 1,
  completion integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_seeds enable row level security;

drop policy if exists "owner read saved seeds" on public.saved_seeds;
create policy "owner read saved seeds"
on public.saved_seeds for select to authenticated
using (owner_id = auth.uid());

drop policy if exists "owner insert saved seeds" on public.saved_seeds;
create policy "owner insert saved seeds"
on public.saved_seeds for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "owner update saved seeds" on public.saved_seeds;
create policy "owner update saved seeds"
on public.saved_seeds for update to authenticated
using (owner_id = auth.uid());

-- Critiques left on a published story. Visible to everyone (they belong to
-- a public story) but only their writer may create/update them.
create table if not exists public.critiques (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null,
  author_id uuid,
  scores jsonb not null default '{}',
  reflection text not null default '',
  is_editorial boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.critiques enable row level security;

drop policy if exists "public read critiques" on public.critiques;
create policy "public read critiques"
on public.critiques for select to anon
using (true);

drop policy if exists "authenticated insert critiques" on public.critiques;
create policy "authenticated insert critiques"
on public.critiques for insert to authenticated
with check (author_id = auth.uid());

drop policy if exists "authenticated update critiques" on public.critiques;
create policy "authenticated update critiques"
on public.critiques for update to authenticated
using (author_id = auth.uid());

-- Words a writer has contributed to the shared Vault. Readable by everyone,
-- written by their contributor.
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  meaning text not null default '',
  category text,
  owner_id uuid,
  usage_count integer not null default 0,
  contributors integer not null default 1,
  popularity integer not null default 0,
  related text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.words enable row level security;

drop policy if exists "public read words" on public.words;
create policy "public read words"
on public.words for select to anon
using (true);

drop policy if exists "authenticated insert words" on public.words;
create policy "authenticated insert words"
on public.words for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "authenticated update words" on public.words;
create policy "authenticated update words"
on public.words for update to authenticated
using (owner_id = auth.uid());

-- Row Level Security: anyone can read published stories, but only the
-- writer of a row can create/update their own. This keeps the anon
-- key safe in the frontend while allowing real Google sign-in to publish.
alter table public.stories enable row level security;
alter table public.continuations enable row level security;

drop policy if exists "public read stories" on public.stories;
create policy "public read stories"
on public.stories for select to anon
using (true);

drop policy if exists "public read continuations" on public.continuations;
create policy "public read continuations"
on public.continuations for select to anon
using (true);

-- Signed-in users may publish stories and continuations under their uid.
drop policy if exists "authenticated insert stories" on public.stories;
create policy "authenticated insert stories"
on public.stories for insert to authenticated
with check (seed_author_id = auth.uid());

drop policy if exists "authenticated update stories" on public.stories;
create policy "authenticated update stories"
on public.stories for update to authenticated
using (seed_author_id = auth.uid());

drop policy if exists "authenticated insert continuations" on public.continuations;
create policy "authenticated insert continuations"
on public.continuations for insert to authenticated
with check (author_id = auth.uid());

drop policy if exists "authenticated update continuations" on public.continuations;
create policy "authenticated update continuations"
on public.continuations for update to authenticated
using (author_id = auth.uid());
