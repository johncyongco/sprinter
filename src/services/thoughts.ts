import { THOUGHTS, thoughtsFor, delay } from "./mock";
import { useUserStore } from "@/stores/useUserStore";
import type { Thought } from "@/types";

export async function getThoughts(storyId: string): Promise<Thought[]> {
  await delay(180);
  return thoughtsFor(storyId).map((t) => ({ ...t }));
}

export async function addThought(
  storyId: string,
  content: string,
  quote?: string,
): Promise<Thought> {
  await delay(300);
  const user = useUserStore.getState().user;
  const thought: Thought = {
    id: `th-${Date.now()}`,
    storyId,
    authorId: user?.id ?? "me",
    content: content.trim(),
    quote: quote?.trim() || undefined,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  THOUGHTS.push(thought);
  return thought;
}
