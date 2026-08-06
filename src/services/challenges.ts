import { CHALLENGES, STORIES, delay } from "./mock";
import type { Challenge } from "@/types";

export async function getChallenges(): Promise<Challenge[]> {
  await delay(240);
  return CHALLENGES.map((c) => ({ ...c }));
}

export async function getActiveChallenges(): Promise<Challenge[]> {
  await delay(160);
  return CHALLENGES.filter((c) => c.endsAt >= new Date().toISOString().slice(0, 10));
}

export function getChallengeStory(challenge: Challenge) {
  if (!challenge.featuredStoryId) return undefined;
  return STORIES.find((s) => s.id === challenge.featuredStoryId);
}

export async function getLeaderboard(challengeId: string) {
  await delay(220);
  const story = CHALLENGES.find((c) => c.id === challengeId)?.featuredStoryId
    ? STORIES.find((s) => s.id === CHALLENGES.find((c) => c.id === challengeId)?.featuredStoryId)
    : undefined;
  return [
    { rank: 1, penName: "Eleanor Voss", contribution: "A Letter of My Own", scores: { craftsmanship: 9.6, courage: 9.2 } },
    { rank: 2, penName: "Ivy Calloway", contribution: "First Snow (a poem)", scores: { craftsmanship: 9.4, courage: 8.8 } },
    { rank: 3, penName: "Soren Whit", contribution: "The Ledger, Open", scores: { craftsmanship: 9.1, courage: 9.3 } },
    { rank: 4, penName: "Amara Cole", contribution: "The Warmth in the Stone", scores: { craftsmanship: 8.9, courage: 8.6 } },
    { rank: 5, penName: "Marek Aldous", contribution: "The Twentieth Bell", scores: { craftsmanship: 8.7, courage: 9.0 } },
  ].filter((row) => row.penName !== undefined || story);
}
