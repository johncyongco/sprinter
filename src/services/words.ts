import { VAULT, VAULT_EXTRA, STORIES, delay, wordById, persistLibrary } from "./mock";
import { fetchRemoteWords, insertWord } from "./supabase";
import { useUserStore } from "@/stores/useUserStore";
import type { BeautifulWord, WordCategory } from "@/types";

export interface WordRelation {
  word: BeautifulWord;
  degree: number;
  sharedStories: number;
}

export interface CreateWordInput {
  term: string;
  meaning: string;
  category?: WordCategory;
}

export async function getVault(): Promise<BeautifulWord[]> {
  const remote = await fetchRemoteWords();
  if (remote && remote.length > 0) return remote;
  await delay(100);
  return [...VAULT, ...VAULT_EXTRA]
    .map((w) => ({ ...w, related: [...w.related] }))
    .sort((a, b) => b.popularity - a.popularity);
}

export async function createWord(input: CreateWordInput): Promise<BeautifulWord> {
  const existing = [...VAULT, ...VAULT_EXTRA].find(
    (w) => w.term.toLowerCase() === input.term.toLowerCase(),
  );
  if (existing) return existing;
  const user = useUserStore.getState().user;
  const word: BeautifulWord = {
    id: `w-${Date.now()}`,
    term: input.term.trim(),
    meaning: input.meaning.trim(),
    category: input.category,
    usageCount: 0,
    contributors: 1,
    popularity: Math.max(1, VAULT.length + VAULT_EXTRA.length),
    related: [],
  };
  const remote = user?.id && user.id !== "me" ? await insertWord(word, user.id) : null;
  const saved = remote ?? word;
  if (!VAULT_EXTRA.some((w) => w.term.toLowerCase() === saved.term.toLowerCase())) {
    VAULT_EXTRA.push(saved);
  }
  persistLibrary();
  return saved;
}

export async function getWord(id: string): Promise<BeautifulWord | null> {
  await delay(140);
  return wordById(id);
}

export async function getWordStories(wordId: string) {
  await delay(180);
  return STORIES.filter((s) => s.beautifulWords.some((bw) => bw.wordId === wordId)).map(
    (s) => ({
      story: s,
      count: s.beautifulWords.find((bw) => bw.wordId === wordId)?.count ?? 1,
    }),
  );
}

export async function getWordRelations(wordId: string): Promise<WordRelation[]> {
  await delay(200);
  const target = wordById(wordId);
  if (!target) return [];
  const storiesWith = new Set(
    STORIES.filter((s) => s.beautifulWords.some((bw) => bw.wordId === wordId)).map((s) => s.id),
  );
  const relations: WordRelation[] = [];

  for (const relatedTerm of target.related) {
    const related = VAULT.find((w) => w.term.toLowerCase() === relatedTerm.toLowerCase());
    if (!related) continue;
    const shared = STORIES.filter(
      (s) => storiesWith.has(s.id) && s.beautifulWords.some((bw) => bw.wordId === related.id),
    ).length;
    relations.push({ word: related, degree: Math.max(1, shared), sharedStories: shared });
  }

  for (const other of VAULT) {
    if (other.id === wordId || relations.some((r) => r.word.id === other.id)) continue;
    const shared = STORIES.filter(
      (s) => s.beautifulWords.some((bw) => bw.wordId === wordId) && s.beautifulWords.some((bw) => bw.wordId === other.id),
    ).length;
    if (shared > 0) {
      relations.push({ word: other, degree: shared, sharedStories: shared });
    }
  }

  return relations.sort((a, b) => b.sharedStories - a.sharedStories).slice(0, 8);
}

export async function getTrendingWords(limit = 8): Promise<BeautifulWord[]> {
  await delay(140);
  return [...VAULT].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}
