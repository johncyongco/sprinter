import { NODES, STORIES, MY_SEEDS, AUTHORS, delay, nodesFor, authorById, persistLibrary } from "./mock";
import {
  fetchContinuationsForStory,
  fetchContributionsByAuthor,
  fetchPublishedStories,
  insertContinuation,
} from "./supabase";
import { useUserStore } from "@/stores/useUserStore";
import { countWords } from "@/lib/reading";
import type { BranchNode, ContributionType } from "@/types";

export interface PublishInput {
  storyId: string;
  parentId: string | null;
  type: ContributionType;
  title: string;
  body: string;
  beautifulWordIds: string[];
}

export async function getBranches(storyId: string): Promise<BranchNode[]> {
  const remote = await fetchContinuationsForStory(storyId);
  if (remote) return remote;
  await delay(180);
  return nodesFor(storyId).map((n) => ({ ...n, beautifulWordIds: [...n.beautifulWordIds] }));
}

export async function getNode(nodeId: string): Promise<BranchNode> {
  await delay(120);
  const node = NODES.find((n) => n.id === nodeId);
  if (!node) throw new Error(`Branch not found: ${nodeId}`);
  return node;
}

export async function publishContinuation(input: PublishInput): Promise<BranchNode> {
  const story = STORIES.find((s) => s.id === input.storyId) ?? MY_SEEDS.find((s) => s.id === input.storyId);
  if (!story) throw new Error("Story not found");

  const user = useUserStore.getState().user;
  const authorId = user?.id ?? "me";
  const id = `n-${Date.now()}`;

  const node: BranchNode = {
    id,
    storyId: input.storyId,
    parentId: input.parentId,
    type: input.type,
    authorId,
    title: input.title.trim() || untitledFor(input.type),
    body: input.body.trim(),
    words: countWords(input.body),
    beautifulWordIds: input.beautifulWordIds,
    createdAt: new Date().toISOString().slice(0, 10),
    isSeed: false,
  };

  // Save to Supabase so the branch appears on the published story's tree
  // (Explore) and in the author's own continuations.
  const remote = await insertContinuation({
    storyId: input.storyId,
    parentId: input.parentId,
    type: input.type,
    authorId,
    title: node.title,
    body: node.body,
    words: node.words,
    beautifulWordIds: input.beautifulWordIds,
  });
  const publishedNode = remote ?? node;

  // Mirror into local nodes so offline / fallback still works.
  if (!NODES.some((n) => n.id === publishedNode.id)) NODES.push(publishedNode);
  story.branchCount += 1;
  story.continuationCount += 1;
  story.updatedAt = publishedNode.createdAt;
  if (!story.contributorIds.includes(authorId)) story.contributorIds.push(authorId);
  story.completion = Math.min(100, story.completion + 4);

  const me = AUTHORS.find((a) => a.id === "me");
  if (me) {
    me.stats.wordsAdded += publishedNode.words;
    me.stats.continuations += 1;
  }

  persistLibrary();

  return publishedNode;
}

function untitledFor(type: ContributionType): string {
  const fallback: Record<ContributionType, string> = {
    Continue: "Untitled Continuation",
    Dialogue: "A Spoken Exchange",
    Flashback: "What Came Before",
    "Character Perspective": "Another Voice",
    "Opposing View": "The Other Side",
    "World Building": "The Wider World",
    Foreshadowing: "A Hint of What Comes",
    Rewrite: "A Second Draft",
    "Different Ending": "What Might Have Been",
    Poem: "Untitled",
    Letter: "An Unsent Letter",
    Monologue: "A Voice Alone",
  };
  return fallback[type];
}

export async function getStoryContributors(storyId: string) {
  await delay(120);
  const story = STORIES.find((s) => s.id === storyId) ?? MY_SEEDS.find((s) => s.id === storyId);
  if (!story) return [];
  return story.contributorIds
    .map((id) => ({ id, author: authorById(id), count: countFor(id, storyId) }))
    .sort((a, b) => b.count - a.count);
}

export async function getContributionsByAuthor(authorId: string) {
  const remote = await fetchContributionsByAuthor(authorId);
  if (remote) {
    const stories = (await fetchPublishedStories()) ?? [];
    return remote.map((n) => ({
      node: { ...n, beautifulWordIds: [...n.beautifulWordIds] },
      story: stories.find((s) => s.id === n.storyId) ?? null,
    }));
  }
  await delay(160);
  return NODES.filter((n) => n.authorId === authorId).map((n) => ({
    node: { ...n, beautifulWordIds: [...n.beautifulWordIds] },
    story: STORIES.find((s) => s.id === n.storyId) ?? null,
  }));
}

export async function getStoriesByAuthor(authorId: string) {
  await delay(160);
  const seeded = [
    ...MY_SEEDS.filter((s) => s.seedAuthorId === authorId),
    ...STORIES.filter((s) => s.seedAuthorId === authorId),
  ];
  const contributed = STORIES.filter(
    (s) => s.contributorIds.includes(authorId) && s.seedAuthorId !== authorId,
  );
  return { seeded, contributed };
}

function countFor(authorId: string, storyId: string): number {
  const nodes = nodesFor(storyId);
  const seeds = STORIES.filter((s) => s.seedAuthorId === authorId && s.id === storyId).length;
  return nodes.filter((n) => n.authorId === authorId).length + seeds;
}
