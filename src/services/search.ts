import { STORIES, AUTHORS, VAULT, COLLECTIONS, ANTHOLOGIES, CHALLENGES, COMMUNITIES, delay } from "./mock";
import type { SearchResult } from "@/types";

function fuzzy(needle: string, haystack: string): boolean {
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (h.includes(n)) return true;
  let i = 0;
  for (const ch of h) {
    if (ch === n[i]) i++;
    if (i === n.length) return true;
  }
  return false;
}

export async function globalSearch(query: string): Promise<SearchResult> {
  await delay(320);
  const q = query.trim();
  if (!q) {
    return { stories: [], authors: [], words: [], collections: [], anthologies: [], challenges: [], communities: [] };
  }
  return {
    stories: STORIES.filter((s) => fuzzy(q, s.title) || fuzzy(q, s.excerpt)).slice(0, 6),
    authors: AUTHORS.filter((a) => fuzzy(q, a.penName)).slice(0, 4),
    words: VAULT.filter((w) => fuzzy(q, w.term) || fuzzy(q, w.meaning)).slice(0, 6),
    collections: COLLECTIONS.filter((c) => fuzzy(q, c.title)).slice(0, 4),
    anthologies: ANTHOLOGIES.filter((a) => fuzzy(q, a.title) || fuzzy(q, a.season)).slice(0, 3),
    challenges: CHALLENGES.filter((c) => fuzzy(q, c.title) || fuzzy(q, c.prompt)).slice(0, 3),
    communities: COMMUNITIES.filter((c) => fuzzy(q, c.name) || fuzzy(q, c.description)).slice(0, 3),
  };
}
