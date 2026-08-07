import type {
  Author,
  BeautifulWord,
  BranchNode,
  Collection,
  Community,
  Challenge,
  Critique,
  Anthology,
  AppNotification,
  Story,
  Genre,
  Thought,
} from "@/types";
import { useUserStore } from "@/stores/useUserStore";

export { delay } from "./client";

/* ============================================================
   Sprinter — in-memory seed library
   A quiet place. Someone is always waiting for your sentence.
   ============================================================ */

export const AUTHORS: Author[] = [];

export const VAULT: BeautifulWord[] = [];

/* ---------- cover art (deterministic, generated) ---------- */

const PALETTES: [string, string, string][] = [
  ["#B89B67", "#F6F4EF", "#5F7384"],
  ["#5F7384", "#F6F4EF", "#B89B67"],
  ["#AF6A6A", "#F6F4EF", "#8B9C7B"],
  ["#8B9C7B", "#F6F4EF", "#B89B67"],
  ["#69655F", "#F6F4EF", "#C69C5A"],
  ["#C69C5A", "#F6F4EF", "#5F7384"],
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function makeCover(seed: string): string {
  const h = hash(seed);
  const [a, b, c] = PALETTES[h % PALETTES.length];
  const cx = 140 + (h % 420);
  const cy = 90 + (h % 300);
  const r = 220 + (h % 180);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='640' viewBox='0 0 900 640'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${b}'/><stop offset='1' stop-color='${a}'/></linearGradient><radialGradient id='h' cx='0.55' cy='0.35' r='0.9'><stop offset='0' stop-color='${b}' stop-opacity='0.9'/><stop offset='1' stop-color='${a}' stop-opacity='0'/></radialGradient></defs><rect width='900' height='640' fill='url(#g)'/><circle cx='${cx}' cy='${cy}' r='${r}' fill='url(#h)'/><path d='M0 520 Q 300 460 900 540 L900 640 L0 640 Z' fill='${c}' opacity='0.16'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ---------- seed stories ---------- */

interface Seed {
  title: string;
  authorId: string;
  genres: Genre[];
  emotion: Story["emotion"];
  themes: Story["themes"];
  perspective: Story["perspective"];
  pacing: Story["pacing"];
  status: Story["status"];
  createdAt: string;
  updatedAt: string;
  body: string;
  beautifulWords: Story["beautifulWords"];
  completion: number;
  isEditorialPick: boolean;
  isWeeklyPrompt: boolean;
}

const SEEDS: Seed[] = [];

export const STORIES: Story[] = SEEDS.map((s, i) => {
  const words = s.body.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  return {
    id: `st-${100 + i}`,
    title: s.title,
    slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    cover: makeCover(s.title),
    seedAuthorId: s.authorId,
    genres: s.genres,
    emotion: s.emotion,
    themes: s.themes,
    perspective: s.perspective,
    pacing: s.pacing,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    body: s.body,
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    beautifulWords: s.beautifulWords,
    completion: s.completion,
    contributorIds: [],
    branchCount: 0,
    continuationCount: 0,
    critiqueCount: 0,
    isEditorialPick: s.isEditorialPick,
    isWeeklyPrompt: s.isWeeklyPrompt,
    excerpt: s.body.split(/\s+/).slice(0, 42).join(" ") + "…",
  };
});

/* ---------- branch tree (continuations) ---------- */

export const MY_SEEDS: Story[] = [];

interface SeedNode {
  story: number;
  id: string;
  parent: string | null;
  type: BranchNode["type"];
  author: string;
  title: string;
  body: string;
  wordIds?: string[];
  createdAt: string;
}

const NODE_BODIES: SeedNode[] = [];

export const NODES: BranchNode[] = NODE_BODIES.map((n) => {
  const story = STORIES[n.story];
  const words = n.body.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  return {
    id: n.id,
    storyId: story.id,
    parentId: n.parent,
    type: n.type,
    authorId: n.author,
    title: n.title,
    body: n.body,
    words,
    beautifulWordIds: n.wordIds ?? [],
    createdAt: n.createdAt,
    isSeed: false,
  };
});

/* keep stories in sync with nodes */
for (const story of STORIES) {
  const nodes = NODES.filter((n) => n.storyId === story.id);
  const contributors = new Set([story.seedAuthorId, ...nodes.map((n) => n.authorId)]);
  story.branchCount = nodes.length;
  story.continuationCount = nodes.length;
  story.contributorIds = Array.from(contributors);
}

/* ---------- critiques ---------- */

interface SeedCritique {
  story: number;
  author: string;
  scores: Critique["scores"];
  reflection: string;
  isEditorial?: boolean;
}

const CRITIQUE_SEEDS: SeedCritique[] = [];

export const CRITIQUES: Critique[] = CRITIQUE_SEEDS.map((c, i) => {
  const story = STORIES[c.story];
  const id = `cr-${100 + i}`;
  const author = AUTHORS.find((a) => a.id === c.author);
  story.critiqueCount += 1;
  void author;
  return {
    id,
    storyId: story.id,
    authorId: c.author,
    createdAt: "2026-07-" + (10 + (i % 18)).toString().padStart(2, "0"),
    scores: c.scores,
    reflection: c.reflection,
    isEditorial: c.isEditorial ?? false,
  };
});

/* ---------- challenges ---------- */

export const CHALLENGES: Challenge[] = [
  {
    id: "ch-1",
    kind: "Daily Sprint",
    title: "One Hundred Quiet Words",
    prompt: "Write 100 words about a small mercy someone almost didn't notice.",
    wordLimit: 100,
    startsAt: "2026-08-05",
    endsAt: "2026-08-06",
    participants: 342,
    featuredStoryId: "st-110",
  },
  {
    id: "ch-2",
    kind: "Weekly Prompt",
    title: "Thresholds",
    prompt: "Continue this story in under 300 words. Begin at the exact moment a character steps across a line they said they never would.",
    wordLimit: 300,
    startsAt: "2026-08-01",
    endsAt: "2026-08-08",
    participants: 587,
    featuredStoryId: "st-100",
  },
  {
    id: "ch-3",
    kind: "Relay",
    title: "The Exchange",
    prompt: "A living relay. One writer opens, the next continues. Twenty hours, twenty hands, one story.",
    startsAt: "2026-07-27",
    endsAt: "2026-08-09",
    participants: 19,
    featuredStoryId: "st-111",
  },
  {
    id: "ch-4",
    kind: "Timed",
    title: "Twenty-Minute Dusk",
    prompt: "You have twenty minutes. The light is leaving. Write the thing you'd write if the light were leaving.",
    wordLimit: 400,
    startsAt: "2026-08-03",
    endsAt: "2026-08-07",
    participants: 208,
    qualityNote: "Judged on the last line.",
  },
  {
    id: "ch-5",
    kind: "Community",
    title: "Catholic Writers — The Mercy Thread",
    prompt: "Open a story with the line 'Mercy is a door with no handle.' Carry it somewhere the door opens.",
    startsAt: "2026-07-30",
    endsAt: "2026-08-12",
    participants: 96,
    featuredStoryId: "st-104",
  },
  {
    id: "ch-6",
    kind: "Daily Sprint",
    title: "Six Words, Exactly",
    prompt: "A whole story in six words. No more. No less. (Hint: the counting is part of the craft.)",
    wordLimit: 6,
    startsAt: "2026-08-06",
    endsAt: "2026-08-07",
    participants: 415,
  },
];

/* ---------- anthologies ---------- */

export const ANTHOLOGIES: Anthology[] = [];

/* ---------- collections ---------- */

export const COLLECTIONS: Collection[] = [];

/* ---------- communities ---------- */

export const COMMUNITIES: Community[] = [];

/* ---------- notifications ---------- */

export const NOTIFICATIONS: AppNotification[] = [];

/* ---------- helpers ---------- */

export function authorById(id: string): Author | null {
  return AUTHORS.find((a) => a.id === id) ?? null;
}

export function wordById(id: string): BeautifulWord | null {
  return (
    VAULT.find((w) => w.id === id) ??
    VAULT_EXTRA.find((w) => w.id === id) ??
    null
  );
}

export const VAULT_EXTRA: BeautifulWord[] = [];

export const THOUGHTS: Thought[] = [];

export function thoughtsFor(storyId: string): Thought[] {
  return THOUGHTS.filter((t) => t.storyId === storyId).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export function nodesFor(storyId: string): BranchNode[] {
  return NODES.filter((n) => n.storyId === storyId);
}

export function critiquesFor(storyId: string): Critique[] {
  return CRITIQUES.filter((c) => c.storyId === storyId);
}

export function storyById(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id) ?? MY_SEEDS.find((s) => s.id === id);
}

export function storyBySlug(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug) ?? MY_SEEDS.find((s) => s.slug === slug);
}

export const WEEKLY_PROMPT = {
  title: "",
  prompt: "",
  detail: "",
};

export const RELAY = {
  storyId: "",
  hand: 0,
  hands: 0,
  hoursRemaining: 0,
  current: "",
};

/* ============================================================
   Local persistence
   Everything a writer contributes is saved on this device and
   hydrated back on the next visit.
   ============================================================ */

const STORAGE_KEYS = {
  stories: "sprinter-stories",
  nodes: "sprinter-nodes",
  critiques: "sprinter-critiques",
  words: "sprinter-words",
  thoughts: "sprinter-thoughts",
  seeds: "sprinter-my-seeds",
} as const;

function loadList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function saveList(key: string, list: unknown[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage unavailable — content stays in memory for the session */
  }
}

export function persistLibrary(): void {
  saveList(STORAGE_KEYS.stories, STORIES);
  saveList(STORAGE_KEYS.nodes, NODES);
  saveList(STORAGE_KEYS.critiques, CRITIQUES);
  saveList(STORAGE_KEYS.words, VAULT_EXTRA);
  saveList(STORAGE_KEYS.thoughts, THOUGHTS);
  saveList(STORAGE_KEYS.seeds, MY_SEEDS);
}

export function getWrittenLibrary() {
  return {
    stories: [...MY_SEEDS, ...STORIES].filter(
      (s) => s.seedAuthorId === useUserStore.getState().user?.id,
    ),
    nodes: NODES.filter((n) => n.authorId === useUserStore.getState().user?.id),
    critiques: CRITIQUES.filter((c) => c.authorId === useUserStore.getState().user?.id),
    words: [...VAULT_EXTRA],
    thoughts: THOUGHTS.filter((t) => t.authorId === useUserStore.getState().user?.id),
  };
}

/* hydrate user-written content so it survives a refresh */
const savedStories = loadList<Story>(STORAGE_KEYS.stories);
const savedNodes = loadList<BranchNode>(STORAGE_KEYS.nodes);
const savedCritiques = loadList<Critique>(STORAGE_KEYS.critiques);
const savedWords = loadList<BeautifulWord>(STORAGE_KEYS.words);
const savedThoughts = loadList<Thought>(STORAGE_KEYS.thoughts);
const savedSeeds = loadList<Story>(STORAGE_KEYS.seeds);

if (savedStories.length) STORIES.splice(0, STORIES.length, ...savedStories);
if (savedNodes.length) NODES.splice(0, NODES.length, ...savedNodes);
if (savedCritiques.length) CRITIQUES.splice(0, CRITIQUES.length, ...savedCritiques);
if (savedWords.length) VAULT_EXTRA.splice(0, VAULT_EXTRA.length, ...savedWords);
if (savedThoughts.length) THOUGHTS.splice(0, THOUGHTS.length, ...savedThoughts);
if (savedSeeds.length) MY_SEEDS.splice(0, MY_SEEDS.length, ...savedSeeds);

/* keep story counters in sync with hydrated branches */
for (const story of STORIES) {
  const nodes = NODES.filter((n) => n.storyId === story.id);
  const contributors = new Set([story.seedAuthorId, ...nodes.map((n) => n.authorId)]);
  story.branchCount = nodes.length;
  story.continuationCount = nodes.length;
  story.contributorIds = Array.from(contributors);
  story.critiqueCount = CRITIQUES.filter((c) => c.storyId === story.id).length;
}
