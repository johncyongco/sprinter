import { STORIES, MY_SEEDS, delay, nodesFor, critiquesFor, makeCover, persistLibrary } from "./mock";
import {
  fetchPublishedStories,
  fetchStoryById,
  fetchStoryBySlug,
  insertPublishedStory,
  fetchSavedSeeds,
  insertSavedSeed,
  deleteSavedSeed,
  deletePublishedStory,
  updatePublishedStory,
  updateSavedSeed,
} from "./supabase";
import { useUserStore } from "@/stores/useUserStore";
import type {
  CompletionStatus,
  Emotion,
  Genre,
  Perspective,
  Pacing,
  Story,
  Theme,
} from "@/types";

export type SortKey =
  | "newest"
  | "mostContinued"
  | "editorial"
  | "needsContinuation"
  | "longest";

export interface StoryFilters {
  genres: Genre[];
  emotions: Emotion[];
  themes: Theme[];
  perspectives: Perspective[];
  statuses: CompletionStatus[];
  sort: SortKey;
  query?: string;
}

export const EMPTY_FILTERS: StoryFilters = {
  genres: [],
  emotions: [],
  themes: [],
  perspectives: [],
  statuses: [],
  sort: "newest",
};

export async function getStories(): Promise<Story[]> {
  const remote = await fetchPublishedStories();
  if (remote) return remote;
  await delay(200);
  return STORIES.map((s) => ({ ...s, contributorIds: [...s.contributorIds] }));
}

export async function getStory(id: string): Promise<Story> {
  const remote = await fetchStoryById(id);
  if (remote) return remote;
  await delay(180);
  const story = STORIES.find((s) => s.id === id) ?? MY_SEEDS.find((s) => s.id === id);
  if (!story) throw new Error(`Story not found: ${id}`);
  return { ...story, contributorIds: [...story.contributorIds] };
}

export async function getStoryBySlug(slug: string): Promise<Story> {
  const remote = await fetchStoryBySlug(slug);
  if (remote) return remote;
  await delay(180);
  const story = STORIES.find((s) => s.slug === slug) ?? MY_SEEDS.find((s) => s.slug === slug);
  if (!story) throw new Error(`Story not found: ${slug}`);
  return { ...story, contributorIds: [...story.contributorIds] };
}

export interface NewStoryInput {
  title: string;
  cover?: string;
  genres: Genre[];
  emotion: Emotion[];
  themes: Theme[];
  perspective: Perspective;
  pacing: Pacing;
  body: string;
  challengeId?: string;
}

export interface FreeWriteInput {
  title: string;
  cover?: string;
  body: string;
}

function slugify(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let slug = base;
  let n = 2;
  while (STORIES.some((s) => s.slug === slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function createStory(input: NewStoryInput): Promise<Story> {
  await delay(420);
  const user = useUserStore.getState().user;
  const body = input.body.trim();
  const title = input.title.trim();
  const words = body.replace(/\s+/g, " ").split(" ").filter(Boolean).length;
  const today = new Date().toISOString().slice(0, 10);
  const story: Story = {
    id: `st-${Date.now()}`,
    title,
    slug: slugify(title),
    cover: input.cover ?? makeCover(title),
    seedAuthorId: user?.id ?? "a1",
    genres: input.genres,
    emotion: input.emotion,
    themes: input.themes,
    perspective: input.perspective,
    pacing: input.pacing,
    status: "Seed",
    createdAt: today,
    updatedAt: today,
    body,
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    beautifulWords: [],
    completion: 5,
    contributorIds: [],
    branchCount: 0,
    continuationCount: 0,
    critiqueCount: 0,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    challengeId: input.challengeId,
    excerpt: body.split(/\s+/).slice(0, 42).join(" ") + "…",
  };
  MY_SEEDS.unshift(story);
  persistLibrary();
  if (user?.id && user.id !== "me") {
    await insertSavedSeed(story, user.id);
  }
  return story;
}

export async function publishStory(storyId: string): Promise<Story> {
  const index = MY_SEEDS.findIndex((s) => s.id === storyId);
  let story: Story;
  if (index === -1) {
    const published = STORIES.find((s) => s.id === storyId);
    if (!published) throw new Error(`Seed not found: ${storyId}`);
    story = published;
  } else {
    story = MY_SEEDS[index];
  }

  // Save to the Explore library (Supabase) so others can continue it.
  const remote = await insertPublishedStory(story);
  if (remote) story = remote;

  // Mirror into local published stories so Explore still works offline /
  // as a fallback, and remove it from saved seeds.
  if (index !== -1) {
    MY_SEEDS.splice(index, 1);
    if (!STORIES.some((s) => s.id === story.id)) {
      STORIES.unshift({ ...story, contributorIds: [...story.contributorIds] });
    }
  }
  persistLibrary();
  return { ...story, contributorIds: [...story.contributorIds] };
}

/**
 * Delete a story the user owns — from the saved list and (if published)
 * from the library/Explore, both locally and in Supabase.
 */
export async function deleteStory(storyId: string): Promise<void> {
  const me = useUserStore.getState().user?.id ?? "me";

  // Published: remove from Supabase stories (+ cascading continuations) and local STORIES.
  const publishedLocalIdx = STORIES.findIndex((s) => s.id === storyId);
  if (publishedLocalIdx !== -1) {
    await deletePublishedStory(storyId);
    STORIES.splice(publishedLocalIdx, 1);
  }

  // Saved: remove from Supabase saved_seeds (when signed in) and local MY_SEEDS.
  const savedLocalIdx = MY_SEEDS.findIndex((s) => s.id === storyId);
  if (savedLocalIdx !== -1) {
    if (me !== "me") await deleteSavedSeed(storyId, me);
    MY_SEEDS.splice(savedLocalIdx, 1);
  }

  persistLibrary();
}

/**
 * Edit an owned story (saved or published). The change mirrors to local
 * storage AND to Supabase (saved_seeds and/or stories) when signed in.
 */
export async function updateStory(
  storyId: string,
  patch: { title: string; body: string },
): Promise<Story> {
  const me = useUserStore.getState().user?.id ?? "me";
  const title = patch.title.trim();
  const body = patch.body.trim();
  const words = body.replace(/\s+/g, " ").split(" ").filter(Boolean).length;

  const savedIdx = MY_SEEDS.findIndex((s) => s.id === storyId);
  const publishedIdx = STORIES.findIndex((s) => s.id === storyId);
  const current = (savedIdx !== -1 ? MY_SEEDS[savedIdx] : undefined) ??
    (publishedIdx !== -1 ? STORIES[publishedIdx] : undefined);
  if (!current) throw new Error("Story not found");

  const updated: Story = {
    ...current,
    title,
    body,
    words,
    updatedAt: new Date().toISOString().slice(0, 10),
    excerpt: body.split(/\s+/).slice(0, 42).join(" ") + "…",
  };

  if (savedIdx !== -1) MY_SEEDS[savedIdx] = updated;
  if (publishedIdx !== -1) STORIES[publishedIdx] = updated;

  if (me !== "me") {
    if (savedIdx !== -1) await updateSavedSeed(updated, me);
    if (publishedIdx !== -1) await updatePublishedStory(updated);
  }

  persistLibrary();
  return updated;
}

export async function createFreeWrite(input: FreeWriteInput): Promise<Story> {
  await delay(420);
  const user = useUserStore.getState().user;
  const body = input.body.trim();
  const title = input.title.trim();
  const words = body.replace(/\s+/g, " ").split(" ").filter(Boolean).length;
  const today = new Date().toISOString().slice(0, 10);
  const story: Story = {
    id: `fw-${Date.now()}`,
    title,
    slug: slugify(title),
    cover: input.cover ?? makeCover(title),
    seedAuthorId: user?.id ?? "a1",
    genres: ["Literary Fiction"],
    emotion: ["Stillness"],
    themes: ["Becoming"],
    perspective: "First",
    pacing: "Measured",
    status: "Seed",
    createdAt: today,
    updatedAt: today,
    body,
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    beautifulWords: [],
    completion: words >= 60 ? 40 : 20,
    contributorIds: [],
    branchCount: 0,
    continuationCount: 0,
    critiqueCount: 0,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    excerpt: body.split(/\s+/).slice(0, 42).join(" ") + "…",
  };
  MY_SEEDS.unshift(story);
  persistLibrary();
  if (user?.id && user.id !== "me") {
    await insertSavedSeed(story, user.id);
  }
  return story;
}

export async function getStoryCount(): Promise<number> {
  const remote = await fetchPublishedStories();
  if (remote) return remote.length;
  return STORIES.length;
}

export async function getSavedStories(): Promise<Story[]> {
  const me = useUserStore.getState().user?.id ?? "me";
  const publishedIds = new Set(STORIES.map((s) => s.id));
  let list: Story[];
  if (me !== "me") {
    const remote = await fetchSavedSeeds(me);
    list = remote ?? MY_SEEDS;
  } else {
    list = MY_SEEDS;
  }
  return list
    .filter((s) => s.seedAuthorId === me && !publishedIds.has(s.id))
    .map((s) => ({ ...s, contributorIds: [...s.contributorIds] }));
}

export async function getStoriesByFilter(
  filters: StoryFilters,
  page = 0,
  perPage = 8,
): Promise<{ items: Story[]; next: number | null }> {
  await delay(30);
  const remote = await fetchPublishedStories();
  let items = remote ? [...remote] : [...STORIES];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    items = items.filter((s) => s.title.toLowerCase().includes(q));
  }
  if (filters.genres.length) {
    items = items.filter((s) => filters.genres.some((g) => s.genres.includes(g)));
  }
  if (filters.emotions.length) {
    items = items.filter((s) => filters.emotions.some((e) => s.emotion.includes(e)));
  }
  if (filters.themes.length) {
    items = items.filter((s) => filters.themes.some((t) => s.themes.includes(t)));
  }
  if (filters.perspectives.length) {
    items = items.filter((s) => filters.perspectives.includes(s.perspective));
  }
  if (filters.statuses.length) {
    items = items.filter((s) => filters.statuses.includes(s.status));
  }

  switch (filters.sort) {
    case "newest":
      items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      break;
    case "mostContinued":
      items.sort((a, b) => b.continuationCount - a.continuationCount);
      break;
    case "editorial":
      items.sort((a, b) => Number(b.isEditorialPick) - Number(a.isEditorialPick));
      break;
    case "needsContinuation":
      items.sort((a, b) => a.completion - b.completion);
      break;
    case "longest":
      items.sort((a, b) => b.words - a.words);
      break;
  }

  const start = page * perPage;
  const slice = items.slice(start, start + perPage);
  const next = start + perPage < items.length ? page + 1 : null;
  return { items: slice.map((s) => ({ ...s })), next };
}

export async function getHomeFeed(): Promise<{
  waiting: Story[];
  weeklyPrompt: Story | null;
  relay: Story | null;
  picks: Story[];
  trendingWordIds: string[];
}> {
  const remote = await fetchPublishedStories();
  const source = remote ? [...remote] : [...STORIES];
  await delay(30);
  const waiting = source
    .filter((s) => s.status !== "Complete")
    .sort((a, b) => b.continuationCount - a.continuationCount)
    .slice(0, 6);
  const weeklyPrompt = source.find((s) => s.isWeeklyPrompt) ?? null;
  const relay = source.find((s) => s.slug === "the-exchange") ?? source.find((s) => s.id === "st-111") ?? null;
  const picks = source.filter((s) => s.isEditorialPick).slice(0, 3);
  const trendingWordIds = ["w-yr", "w-pil", "w-sil", "w-mrc", "w-dst", "w-hom", "w-mem"];
  return { waiting, weeklyPrompt, relay, picks, trendingWordIds };
}

export function getGenomeSummary(story: Story) {
  const nodes = nodesFor(story.id);
  const critiques = critiquesFor(story.id);
  const recurring: { word: string; count: number }[] = [];
  const freq = new Map<string, number>();
  for (const m of (story.body + " " + nodes.map((n) => n.body).join(" ")).toLowerCase().split(/\W+/)) {
    if (m.length > 4) freq.set(m, (freq.get(m) ?? 0) + 1);
  }
  const stop = new Set([
    "there", "their", "through", "about", "would", "could", "should", "which",
    "these", "those", "thing", "things", "something", "nothing", "everything",
    "have", "with", "from", "than", "that", "this", "what", "when", "then",
    "were", "been", "being", "very", "just", "like", "even", "only", "still",
    "after", "before", "until", "while", "because",
  ]);
  for (const [w, c] of freq) {
    if (c > 2 && !stop.has(w)) recurring.push({ word: w, count: c });
  }
  recurring.sort((a, b) => b.count - a.count);

  const totalWords = story.words + nodes.reduce((sum, n) => sum + n.words, 0);
  return {
    emotion: story.emotion,
    themes: story.themes,
    perspective: story.perspective,
    pacing: story.pacing,
    recurring: recurring.slice(0, 6),
    completion: Math.min(100, story.completion + nodes.length * 4),
    contributors: story.contributorIds.length,
    branchCount: story.branchCount,
    continuationCount: story.continuationCount,
    critiqueCount: critiques.length,
    readingMinutes: Math.max(1, Math.round(totalWords / 220)),
    totalWords,
  };
}
