import { supabase } from "./client";
import type { BranchNode, Story, StoryWord } from "@/types";

/* ============================================================
   Supabase adapter — drops the domain types to/from Postgres rows.
   Every function returns null / throws when the backend is off,
   so callers fall back to the local mock library.
   ============================================================ */

export interface StoryRow {
  id: string;
  slug: string;
  title: string;
  cover: string | null;
  seed_author_id: string;
  genres: string[] | null;
  emotion: string[] | null;
  themes: string[] | null;
  perspective: string;
  pacing: string;
  status: string;
  body: string;
  words: number;
  reading_minutes: number;
  beautiful_words: unknown;
  completion: number;
  is_editorial_pick: boolean;
  is_weekly_prompt: boolean;
  challenge_id: string | null;
  created_at: string;
  updated_at: string;
  continuations?: { author_id: string }[] | { count: unknown }[];
}

export interface ContinuationRow {
  id: string;
  story_id: string;
  parent_id: string | null;
  type: string;
  author_id: string;
  title: string;
  body: string;
  words: number;
  beautiful_word_ids: string[] | null;
  is_seed: boolean;
  created_at: string;
  story?: StoryRow | null;
}

function isBackendUp(): boolean {
  return supabase !== null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRealUuid(value: string | undefined | null): boolean {
  return typeof value === "string" && UUID_RE.test(value);
}

function asStringArray(v: string[] | null | undefined): string[] {
  return Array.isArray(v) ? v : [];
}

function asStyleWords(v: unknown): StoryWord[] {
  if (!Array.isArray(v)) return [];
  return v as StoryWord[];
}

function contributorsFromContinuations(
  seedAuthorId: string,
  rows?: { author_id: string }[],
): string[] {
  const set = new Set<string>([seedAuthorId]);
  for (const r of rows ?? []) if (r.author_id) set.add(r.author_id);
  return Array.from(set);
}

/* ------------------------ stories ------------------------ */

export function storyRowToStory(row: StoryRow): Story {
  const conts: { author_id: string }[] = Array.isArray(row.continuations)
    ? (row.continuations as { author_id: string }[])
    : [];
  const contributorIds = contributorsFromContinuations(row.seed_author_id, conts);
  const branchCount = conts.length;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    cover: row.cover ?? "",
    seedAuthorId: row.seed_author_id,
    genres: asStringArray(row.genres),
    emotion: asStringArray(row.emotion),
    themes: asStringArray(row.themes),
    perspective: row.perspective as Story["perspective"],
    pacing: row.pacing as Story["pacing"],
    status: row.status as Story["status"],
    createdAt: (row.created_at ?? "").slice(0, 10),
    updatedAt: (row.updated_at ?? row.created_at ?? "").slice(0, 10),
    body: row.body,
    words: row.words,
    readingMinutes: row.reading_minutes,
    beautifulWords: asStyleWords(row.beautiful_words),
    completion: row.completion,
    contributorIds,
    branchCount,
    continuationCount: branchCount,
    critiqueCount: 0,
    isEditorialPick: row.is_editorial_pick,
    isWeeklyPrompt: row.is_weekly_prompt,
    challengeId: row.challenge_id ?? undefined,
    excerpt: row.body.split(/\s+/).slice(0, 42).join(" ") + "…",
  };
}

export async function fetchPublishedStories(): Promise<Story[] | null> {
  if (!isBackendUp()) return null;
  try {
    const { data, error } = await supabase!
      .from("stories")
      .select("*, continuations(author_id)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as StoryRow[]).map(storyRowToStory);
  } catch {
    return null;
  }
}

export async function fetchStoryBySlug(slug: string): Promise<Story | null> {
  if (!isBackendUp()) return null;
  try {
    const { data, error } = await supabase!
      .from("stories")
      .select("*, continuations(author_id)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return storyRowToStory(data as StoryRow);
  } catch {
    return null;
  }
}

export async function fetchStoryById(id: string): Promise<Story | null> {
  if (!isBackendUp()) return null;
  try {
    const { data, error } = await supabase!
      .from("stories")
      .select("*, continuations(author_id)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return storyRowToStory(data as StoryRow);
  } catch {
    return null;
  }
}

export async function insertPublishedStory(story: Story): Promise<Story | null> {
  if (!isBackendUp()) return null;
  if (!isRealUuid(story.seedAuthorId)) return null;
  try {
    const { data, error } = await supabase!
      .from("stories")
      .insert({
        slug: story.slug,
        title: story.title,
        cover: story.cover || null,
        seed_author_id: story.seedAuthorId,
        genres: story.genres,
        emotion: story.emotion,
        themes: story.themes,
        perspective: story.perspective,
        pacing: story.pacing,
        status: story.status,
        body: story.body,
        words: story.words,
        reading_minutes: story.readingMinutes,
        beautiful_words: story.beautifulWords,
        completion: story.completion,
        is_editorial_pick: story.isEditorialPick,
        is_weekly_prompt: story.isWeeklyPrompt,
        challenge_id: story.challengeId ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return storyRowToStory(data as StoryRow);
  } catch {
    return null;
  }
}

export async function deleteStoryBySlug(slug: string): Promise<void> {
  if (!isBackendUp()) return;
  const { error } = await supabase!.from("stories").delete().eq("slug", slug);
  if (error) throw error;
}

/* --------------------- continuations --------------------- */

export function continuationRowToNode(row: ContinuationRow): BranchNode {
  return {
    id: row.id,
    storyId: row.story_id,
    parentId: row.parent_id,
    type: row.type as BranchNode["type"],
    authorId: row.author_id,
    title: row.title,
    body: row.body,
    words: row.words,
    beautifulWordIds: asStringArray(row.beautiful_word_ids),
    createdAt: (row.created_at ?? "").slice(0, 10),
    isSeed: row.is_seed,
  };
}

export async function fetchContinuationsForStory(storyId: string): Promise<BranchNode[] | null> {
  if (!isBackendUp()) return null;
  try {
    const { data, error } = await supabase!
      .from("continuations")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return ((data as ContinuationRow[]) ?? []).map(continuationRowToNode);
  } catch {
    return null;
  }
}

export async function insertContinuation(input: {
  storyId: string;
  parentId: string | null;
  type: string;
  authorId: string;
  title: string;
  body: string;
  words: number;
  beautifulWordIds: string[];
}): Promise<BranchNode | null> {
  if (!isBackendUp()) return null;
  if (!isRealUuid(input.authorId)) return null;
  try {
    const { data, error } = await supabase!
      .from("continuations")
      .insert({
        story_id: input.storyId,
        parent_id: input.parentId,
        type: input.type,
        author_id: input.authorId,
        title: input.title,
        body: input.body,
        words: input.words,
        beautiful_word_ids: input.beautifulWordIds,
      })
      .select()
      .single();
    if (error) throw error;
    return continuationRowToNode(data as ContinuationRow);
  } catch {
    return null;
  }
}

export async function fetchContributionsByAuthor(authorId: string): Promise<BranchNode[] | null> {
  if (!isBackendUp()) return null;
  try {
    const { data, error } = await supabase!
      .from("continuations")
      .select("*")
      .eq("author_id", authorId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as ContinuationRow[]) ?? []).map(continuationRowToNode);
  } catch {
    return null;
  }
}

export async function fetchStoriesByAuthor(authorId: string): Promise<Story[] | null> {
  if (!isBackendUp()) return null;
  try {
    const { data, error } = await supabase!
      .from("stories")
      .select("*, continuations(author_id)")
      .eq("seed_author_id", authorId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return ((data as StoryRow[]) ?? []).map(storyRowToStory);
  } catch {
    return null;
  }
}
