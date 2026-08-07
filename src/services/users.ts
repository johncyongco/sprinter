import { AUTHORS, delay } from "./mock";
import { useUserStore } from "@/stores/useUserStore";
import type { Author } from "@/types";

export async function getProfile(): Promise<Author> {
  await delay(120);
  const profile = useUserStore.getState().user;
  const base = AUTHORS.find((a) => a.id === "me") ?? AUTHORS[AUTHORS.length - 1] ?? null;
  return {
    id: "me",
    penName: profile?.penName || base?.penName || "Guest",
    avatar: profile?.avatar || base?.avatar || "G",
    bio: profile?.bio || base?.bio || "",
    favoriteLine: profile?.favoriteLine || base?.favoriteLine || "",
    genres: profile && profile.genres.length ? profile.genres : (base?.genres ?? []),
    joinedAt: base?.joinedAt ?? new Date().toISOString().slice(0, 10),
    stats: base?.stats ?? { storiesStarted: 0, continuations: 0, wordsAdded: 0, critiques: 0 },
  };
}

export async function getAuthors(): Promise<Author[]> {
  await delay(160);
  return AUTHORS.map((a) => ({ ...a }));
}

export async function getAuthor(id: string): Promise<Author> {
  await delay(140);
  const found = AUTHORS.find((a) => a.id === id);
  if (!found) throw new Error(`Author not found: ${id}`);
  return found;
}
