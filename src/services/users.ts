import { AUTHORS, delay } from "./mock";
import { useUserStore } from "@/stores/useUserStore";
import type { Author } from "@/types";

export async function getProfile(): Promise<Author> {
  await delay(120);
  const profile = useUserStore.getState().user;
  const base = AUTHORS.find((a) => a.id === "me") ?? AUTHORS[AUTHORS.length - 1];
  if (!profile) return base;
  return {
    ...base,
    penName: profile.penName,
    avatar: profile.avatar,
    bio: profile.bio || base.bio,
    favoriteLine: profile.favoriteLine || base.favoriteLine,
    genres: profile.genres.length ? profile.genres : base.genres,
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
