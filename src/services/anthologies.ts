import { ANTHOLOGIES, STORIES, delay } from "./mock";
import type { Anthology } from "@/types";

export async function getAnthologies(): Promise<Anthology[]> {
  await delay(240);
  return ANTHOLOGIES.map((a) => ({
    ...a,
    storyIds: [...a.storyIds],
    featuredStoryIds: [...a.featuredStoryIds],
    topCritiqueIds: [...a.topCritiqueIds],
  }));
}

export async function getAnthology(id: string): Promise<Anthology> {
  await delay(160);
  const found = ANTHOLOGIES.find((a) => a.id === id);
  if (!found) throw new Error(`Anthology not found: ${id}`);
  return found;
}

export async function getAnthologyStories(ids: string[]) {
  await delay(180);
  return STORIES.filter((s) => ids.includes(s.id));
}
