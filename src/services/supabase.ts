import { supabase } from "./client";
import type { BeautifulWord, BranchNode, Critique, CritiqueScoreKey, Story, StoryWord } from "@/types";

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

export interface SavedSeedRow {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  cover: string | null;
  genres: string[] | null;
  emotion: string[] | null;
  themes: string[] | null;
  perspective: string;
  pacing: string;
  status: string;
  body: string;
  words: number;
  reading_minutes: number;
  completion: number;
  created_at: string;
  updated_at: string;
}

function isBackendUp(): boolean {
  return supabase !== null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRealUuid(value: string | undefined | null): boolean {
  return typeof value === "string" && UUID_RE.test(value);
}

/** Resolves to `null` if the underlying promise doesn't settle in time. */
async function withTimeout<T>(p: PromiseLike<T>, ms = 1200): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** True only when Supabase has an active session for the given uid. */
async function hasSessionFor(uid: string): Promise<boolean> {
  if (!isRealUuid(uid)) return false;
  try {
    const { data } = await supabase!.auth.getSession();
    return Boolean(data.session && data.session.user.id === uid);
  } catch {
    return false;
  }
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
    const result = await withTimeout(
      supabase!
        .from("stories")
        .select("*, continuations(author_id)")
        .order("updated_at", { ascending: false }),
    );
    if (!result) return null;
    const { data, error } = result;
    if (error) throw error;
    return (data as StoryRow[]).map(storyRowToStory);
  } catch {
    return null;
  }
}

export async function fetchStoryBySlug(slug: string): Promise<Story | null> {
  if (!isBackendUp()) return null;
  try {
    const result = await withTimeout(
      supabase!
        .from("stories")
        .select("*, continuations(author_id)")
        .eq("slug", slug)
        .maybeSingle(),
    );
    if (!result) return null;
    const { data, error } = result;
    if (error) throw error;
    if (!data) return null;
    return storyRowToStory(data as StoryRow);
  } catch {
    return null;
  }
}

export async function fetchStoryById(id: string): Promise<Story | null> {
  if (!isBackendUp() || !isRealUuid(id)) return null;
  try {
    const result = await withTimeout(
      supabase!
        .from("stories")
        .select("*, continuations(author_id)")
        .eq("id", id)
        .maybeSingle(),
    );
    if (!result) return null;
    const { data, error } = result;
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
  // Only write to the cloud when there is an active session for this author;
  // otherwise fall back to local (avoid 401s from an empty/stale session).
  if (!(await hasSessionFor(story.seedAuthorId))) return null;
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
  if (!isBackendUp() || !isRealUuid(storyId)) return null;
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
  if (!(await hasSessionFor(input.authorId))) return null;
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

/* ------------------------ saved seeds ------------------------ */

export function savedSeedRowToStory(row: SavedSeedRow, ownerId: string): Story {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    cover: row.cover ?? "",
    seedAuthorId: ownerId,
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
    beautifulWords: [],
    completion: row.completion,
    contributorIds: [ownerId],
    branchCount: 0,
    continuationCount: 0,
    critiqueCount: 0,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    excerpt: row.body.split(/\s+/).slice(0, 42).join(" ") + "…",
  };
}

export async function fetchSavedSeeds(ownerId: string): Promise<Story[] | null> {
  if (!isBackendUp() || !isRealUuid(ownerId)) return null;
  try {
    const result = await withTimeout(
      supabase!
        .from("saved_seeds")
        .select("*")
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false }),
    );
    if (!result) return null;
    const { data, error } = result;
    if (error) throw error;
    return ((data as SavedSeedRow[]) ?? []).map((r) => savedSeedRowToStory(r, ownerId));
  } catch {
    return null;
  }
}

export async function deleteSavedSeed(storyId: string, ownerId: string): Promise<void> {
  if (!isBackendUp() || !isRealUuid(ownerId) || !isRealUuid(storyId)) return;
  try {
    await supabase!.from("saved_seeds").delete().eq("id", storyId).eq("owner_id", ownerId);
  } catch {
    /* best-effort; local removal still applies */
  }
}

export async function updateSavedSeed(story: Story, ownerId: string): Promise<Story | null> {
  if (!isBackendUp() || !isRealUuid(ownerId) || !isRealUuid(story.id)) return null;
  try {
    const { data, error } = await supabase!
      .from("saved_seeds")
      .update({
        title: story.title,
        cover: story.cover || null,
        genres: story.genres,
        emotion: story.emotion,
        themes: story.themes,
        perspective: story.perspective,
        pacing: story.pacing,
        status: story.status,
        body: story.body,
        words: story.words,
        reading_minutes: story.readingMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", story.id)
      .eq("owner_id", ownerId)
      .select("*")
      .single();
    if (error) throw error;
    return savedSeedRowToStory(data as SavedSeedRow, ownerId);
  } catch {
    return null;
  }
}

export async function deletePublishedStory(storyId: string): Promise<void> {
  if (!isBackendUp() || !isRealUuid(storyId)) return;
  try {
    // continuations cascade via FK; saved_seeds are separate so leave them.
    await supabase!.from("stories").delete().eq("id", storyId);
  } catch {
    /* best-effort */
  }
}

export async function updatePublishedStory(story: Story): Promise<Story | null> {
  if (!isBackendUp() || !isRealUuid(story.id) || !isRealUuid(story.seedAuthorId)) return null;
  try {
    const { data, error } = await supabase!
      .from("stories")
      .update({
        title: story.title,
        cover: story.cover || null,
        genres: story.genres,
        emotion: story.emotion,
        themes: story.themes,
        perspective: story.perspective,
        pacing: story.pacing,
        status: story.status,
        body: story.body,
        words: story.words,
        reading_minutes: story.readingMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", story.id)
      .eq("seed_author_id", story.seedAuthorId)
      .select("*")
      .single();
    if (error) throw error;
    return storyRowToStory(data as StoryRow);
  } catch {
    return null;
  }
}

export async function insertSavedSeed(story: Story, ownerId: string): Promise<Story | null> {
  if (!isBackendUp() || !isRealUuid(ownerId)) return null;
  if (!(await hasSessionFor(ownerId))) return null;
  try {
    const { data, error } = await supabase!
      .from("saved_seeds")
      .insert({
        owner_id: ownerId,
        slug: story.slug,
        title: story.title,
        cover: story.cover || null,
        genres: story.genres,
        emotion: story.emotion,
        themes: story.themes,
        perspective: story.perspective,
        pacing: story.pacing,
        status: story.status,
        body: story.body,
        words: story.words,
        reading_minutes: story.readingMinutes,
        completion: story.completion,
      })
      .select("*")
      .single();
    if (error) throw error;
    return savedSeedRowToStory(data as SavedSeedRow, ownerId);
  } catch {
    return null;
  }
}

export async function insertSavedSeedsBatch(stories: Story[], ownerId: string): Promise<number> {
  if (!isBackendUp() || !isRealUuid(ownerId) || stories.length === 0) return 0;
  try {
    const { error } = await supabase!.from("saved_seeds").insert(
      stories.map((s) => ({
        owner_id: ownerId,
        slug: s.slug,
        title: s.title,
        cover: s.cover || null,
        genres: s.genres,
        emotion: s.emotion,
        themes: s.themes,
        perspective: s.perspective,
        pacing: s.pacing,
        status: s.status,
        body: s.body,
        words: s.words,
        reading_minutes: s.readingMinutes,
        completion: s.completion,
      })),
    );
    if (error) throw error;
    return stories.length;
  } catch {
    return 0;
  }
}

/* ------------------------ critiques ------------------------ */

export interface CritiqueRow {
  id: string;
  story_id: string;
  author_id: string | null;
  scores: Record<string, number>;
  reflection: string;
  is_editorial: boolean;
  created_at: string;
}

export function critiqueRowToCritique(row: CritiqueRow): Critique {
  const scores = {} as Record<CritiqueScoreKey, number>;
  for (const k of Object.keys(row.scores)) {
    scores[k as CritiqueScoreKey] = row.scores[k];
  }
  return {
    id: row.id,
    storyId: row.story_id,
    authorId: row.author_id ?? "me",
    createdAt: (row.created_at ?? "").slice(0, 10),
    scores,
    reflection: row.reflection,
    isEditorial: row.is_editorial,
  };
}

export async function fetchCritiquesForStory(storyId: string): Promise<Critique[] | null> {
  if (!isBackendUp() || !isRealUuid(storyId)) return null;
  try {
    const { data, error } = await supabase!
      .from("critiques")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return ((data as CritiqueRow[]) ?? []).map(critiqueRowToCritique);
  } catch {
    return null;
  }
}

export async function insertCritique(input: {
  storyId: string;
  authorId: string;
  scores: Record<CritiqueScoreKey, number>;
  reflection: string;
}): Promise<Critique | null> {
  if (!isBackendUp() || !isRealUuid(input.authorId) || !isRealUuid(input.storyId)) return null;
  if (!(await hasSessionFor(input.authorId))) return null;
  try {
    const { data, error } = await supabase!
      .from("critiques")
      .insert({
        story_id: input.storyId,
        author_id: input.authorId,
        scores: input.scores,
        reflection: input.reflection,
      })
      .select("*")
      .single();
    if (error) throw error;
    return critiqueRowToCritique(data as CritiqueRow);
  } catch {
    return null;
  }
}

export async function fetchCritiquesByAuthor(authorId: string): Promise<Critique[] | null> {
  if (!isBackendUp() || !isRealUuid(authorId)) return null;
  try {
    const { data, error } = await supabase!
      .from("critiques")
      .select("*")
      .eq("author_id", authorId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as CritiqueRow[]) ?? []).map(critiqueRowToCritique);
  } catch {
    return null;
  }
}

export async function insertCritiquesBatch(
  inputs: {
    storyId: string;
    authorId: string;
    scores: Record<CritiqueScoreKey, number>;
    reflection: string;
  }[],
  ownerId: string,
): Promise<number> {
  if (!isBackendUp() || !isRealUuid(ownerId) || inputs.length === 0) return 0;
  try {
    const { error } = await supabase!.from("critiques").insert(
      inputs.map((c) => ({
        story_id: c.storyId,
        author_id: c.authorId ?? ownerId,
        scores: c.scores,
        reflection: c.reflection,
      })),
    );
    if (error) throw error;
    return inputs.length;
  } catch {
    return 0;
  }
}

/* ------------------------ words ------------------------ */

export interface WordRow {
  id: string;
  term: string;
  meaning: string;
  category: string | null;
  owner_id: string | null;
  usage_count: number;
  contributors: number;
  popularity: number;
  related: string[] | null;
}

export function wordRowToWord(row: WordRow): BeautifulWord {
  return {
    id: row.id,
    term: row.term,
    meaning: row.meaning,
    category: (row.category as BeautifulWord["category"]) ?? undefined,
    usageCount: row.usage_count,
    contributors: row.contributors,
    popularity: row.popularity,
    related: asStringArray(row.related),
  };
}

export async function fetchRemoteWords(): Promise<BeautifulWord[] | null> {
  if (!isBackendUp()) return null;
  try {
    const { data, error } = await supabase!
      .from("words")
      .select("*")
      .order("popularity", { ascending: false })
      .limit(500);
    if (error) throw error;
    return ((data as WordRow[]) ?? []).map(wordRowToWord);
  } catch {
    return null;
  }
}

export async function insertWord(
  word: Omit<BeautifulWord, "id">,
  ownerId: string,
): Promise<BeautifulWord | null> {
  if (!isBackendUp() || !isRealUuid(ownerId)) return null;
  if (!(await hasSessionFor(ownerId))) return null;
  try {
    const { data, error } = await supabase!
      .from("words")
      .insert({
        term: word.term,
        meaning: word.meaning,
        category: word.category ?? null,
        owner_id: ownerId,
        usage_count: word.usageCount,
        contributors: word.contributors,
        popularity: word.popularity,
        related: word.related,
      })
      .select("*")
      .single();
    if (error) throw error;
    return wordRowToWord(data as WordRow);
  } catch {
    return null;
  }
}

export async function insertWordsBatch(
  words: Omit<BeautifulWord, "id">[],
  ownerId: string,
): Promise<number> {
  if (!isBackendUp() || !isRealUuid(ownerId) || words.length === 0) return 0;
  try {
    const { error } = await supabase!.from("words").insert(
      words.map((word) => ({
        term: word.term,
        meaning: word.meaning,
        category: word.category ?? null,
        owner_id: ownerId,
        usage_count: word.usageCount,
        contributors: word.contributors,
        popularity: word.popularity,
        related: word.related,
      })),
    );
    if (error) throw error;
    return words.length;
  } catch {
    return 0;
  }
}

/* ------------------------ profiles ------------------------ */

export interface ProfileRow {
  id: string;
  pen_name: string;
  avatar: string;
  bio: string;
  favorite_line: string;
  genres: string[] | null;
  favorite_word_ids: string[] | null;
  goals: unknown;
}

export async function fetchProfile(uid: string): Promise<ProfileRow | null> {
  if (!isBackendUp() || !isRealUuid(uid)) return null;
  try {
    const result = await withTimeout(
      supabase!.from("profiles").select("*").eq("id", uid).maybeSingle(),
    );
    if (!result) return null;
    const { data, error } = result;
    if (error) throw error;
    return (data as ProfileRow) ?? null;
  } catch {
    return null;
  }
}

export async function upsertProfile(
  profile: {
    id: string;
    penName: string;
    avatar: string;
    bio: string;
    favoriteLine: string;
    genres: string[];
    favoriteWordIds: string[];
    goals: unknown[];
  },
): Promise<boolean> {
  if (!isBackendUp() || !isRealUuid(profile.id)) return false;
  if (!(await hasSessionFor(profile.id))) return false;
  try {
    const { error } = await supabase!.from("profiles").upsert(
      {
        id: profile.id,
        pen_name: profile.penName,
        avatar: profile.avatar,
        bio: profile.bio,
        favorite_line: profile.favoriteLine,
        genres: profile.genres,
        favorite_word_ids: profile.favoriteWordIds,
        goals: profile.goals,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
