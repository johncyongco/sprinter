import { COLLECTIONS, STORIES, COMMUNITIES, delay, AUTHORS } from "./mock";
import type { Collection, Community } from "@/types";

export async function getCollections(): Promise<Collection[]> {
  await delay(200);
  return COLLECTIONS.map((c) => ({ ...c, storyIds: [...c.storyIds] }));
}

export async function getCollection(id: string): Promise<Collection> {
  await delay(140);
  const found = COLLECTIONS.find((c) => c.id === id);
  if (!found) throw new Error(`Collection not found: ${id}`);
  return found;
}

export async function getCollectionStories(ids: string[]) {
  await delay(160);
  return STORIES.filter((s) => ids.includes(s.id));
}

export async function getCommunities(): Promise<Community[]> {
  await delay(220);
  return COMMUNITIES.map((c) => ({
    ...c,
    memberIds: [...c.memberIds],
    tags: [...c.tags],
    featuredStoryIds: [...c.featuredStoryIds],
    challengeIds: [...c.challengeIds],
    discussion: [...c.discussion],
  }));
}

export async function getCommunity(id: string): Promise<Community> {
  await delay(160);
  const found = COMMUNITIES.find((c) => c.id === id);
  if (!found) throw new Error(`Community not found: ${id}`);
  return found;
}

export async function getCommunityMembers(ids: string[]) {
  await delay(140);
  return AUTHORS.filter((a) => ids.includes(a.id));
}

export async function getCurator(id: string | null) {
  if (!id) return null;
  return AUTHORS.find((a) => a.id === id) ?? null;
}
