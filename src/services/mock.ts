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

export const CHALLENGES: Challenge[] = [];

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
  return STORIES.find((s) => s.id === id);
}

export function storyBySlug(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
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
