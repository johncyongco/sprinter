import { CRITIQUES, STORIES, AUTHORS, delay, critiquesFor, persistLibrary } from "./mock";
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
  await delay(220);
  return critiquesFor(storyId)
    .map((c) => ({ ...c, scores: { ...c.scores } }))
    .sort((a, b) => Number(b.isEditorial) - Number(a.isEditorial));
}

export async function submitCritique(input: CritiqueInput): Promise<Critique> {
  await delay(380);
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
  CRITIQUES.push(critique);
  const story = STORIES.find((s) => s.id === input.storyId);
  if (story) story.critiqueCount += 1;
  const me = AUTHORS.find((a) => a.id === "me");
  if (me) me.stats.critiques += 1;
  persistLibrary();
  return critique;
}

export async function getCritiqueStats(storyId: string) {
  await delay(140);
  const list = critiquesFor(storyId);
  if (list.length === 0) return null;
  const avg: Record<string, number> = {};
  for (const key of CRITIQUE_DIMENSIONS.map((d) => d.key)) {
    const values = list.map((c) => c.scores[key]);
    avg[key] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }
  return avg;
}
