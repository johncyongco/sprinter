import { authorById } from "@/services/mock";
import { useUserStore } from "@/stores/useUserStore";

/**
 * Resolve a displayable pen name for an author id, falling back to the
 * current signed-in user's own profile (Supabase users aren't in the local
 * mock AUTHORS list) and finally to a neutral fallback.
 */
export function penNameFor(authorId: string): string {
  const fromMock = authorById(authorId)?.penName;
  if (fromMock) return fromMock;
  const current = useUserStore.getState().user;
  if (current && current.id === authorId) return current.penName || "a quiet author";
  return authorId === "me" ? "Guest" : "a quiet author";
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Y";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** Resolve an avatar letter for an author id (current user included). */
export function avatarFor(authorId: string): string {
  const fromMock = authorById(authorId)?.avatar;
  if (fromMock) return fromMock;
  const current = useUserStore.getState().user;
  if (current && current.id === authorId) return current.avatar || initials(current.penName);
  return "?";
}
