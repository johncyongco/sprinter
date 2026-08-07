import { CRITIQUES, STORIES, AUTHORS, delay, critiquesFor, persistLibrary } from "./mock";
import { fetchCritiquesForStory, insertCritique } from "./supabase";
import { useUserStore } from "@/stores/useUserStore";
import type { Critique, CritiqueScoreKey } from "@/types";

export const CRITIQUE_DIMENSIONS: { key: CritiqueScoreKey; label: string; hint: string }[] = [
  { key: "emotion", label: "Emotion", hint: "Did it move you honestly?" },
  { key: "logic", label: "Logic", hint: "Does the world hold together?" },
  { key: "pacing", label: "Pacing", hint: "Did the timing earn the moment?" },
  { key: "imagery", label: "Imagery", hint: "Did it make a picture in you?" },
  { key: "dialogue", label: "Dialogue", hint: "Did the voices sound true?" },
  { key: "originality", label: "Originality", hint: "Was it new under the sun?" },
  { key: "theme", label: "Theme", hint: "Did it mean more than it said?" },
  { key: "ending", label: "Ending", hint: "Did it close or open the door?" },
];

export interface CritiqueInput {
  storyId: string;
  scores: Record<CritiqueScoreKey, number>;
  reflection: string;
}

export async function getCritiques(storyId: string): Promise<Critique[]> {
  const remote = await fetchCritiquesForStory(storyId);
  if (remote) return remote;
  await delay(100);
  return critiquesFor(storyId)
    .map((c) => ({ ...c, scores: { ...c.scores } }))
    .sort((a, b) => Number(b.isEditorial) - Number(a.isEditorial));
}

export async function submitCritique(input: CritiqueInput): Promise<Critique> {
  const user = useUserStore.getState().user;
  const authorId = user?.id ?? "me";
  const critique: Critique = {
    id: `cr-${Date.now()}`,
    storyId: input.storyId,
    authorId,
    createdAt: new Date().toISOString().slice(0, 10),
    scores: input.scores,
    reflection: input.reflection,
    isEditorial: false,
  };

  // Persist to Supabase when the critique targets a published story and the
  // writer is signed in; otherwise keep it local.
  const remote = await insertCritique({
    storyId: input.storyId,
    authorId,
    scores: input.scores,
    reflection: input.reflection,
  });
  const saved = remote ?? critique;

  if (!CRITIQUES.some((c) => c.id === saved.id)) CRITIQUES.push(saved);
  const story = STORIES.find((s) => s.id === input.storyId);
  if (story) story.critiqueCount += 1;
  const me = AUTHORS.find((a) => a.id === "me");
  if (me) me.stats.critiques += 1;
  persistLibrary();
  return saved;
}

export async function getCritiqueStats(storyId: string) {
  const list = critiquesFor(storyId);
  if (list.length === 0) return null;
  const avg: Record<string, number> = {};
  for (const key of CRITIQUE_DIMENSIONS.map((d) => d.key)) {
    const values = list.map((c) => c.scores[key]);
    avg[key] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }
  return avg;
}
