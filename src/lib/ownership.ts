import { useUserStore } from "@/stores/useUserStore";
import type { Story } from "@/types";

/* ============================================================
   Ownership: signed-in users own stories where seedAuthorId is
   their uid; guests share the id "me", so we additionally track
   which guest story ids were created on THIS device.
   ============================================================ */

const CREATED_KEY = "sprinter-created-guest-stories";

function loadCreated(): Set<string> {
  try {
    const raw = localStorage.getItem(CREATED_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveCreated(set: Set<string>): void {
  try {
    localStorage.setItem(CREATED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

export function registerGuestStoryId(storyId: string): void {
  const set = loadCreated();
  if (!set.has(storyId)) {
    set.add(storyId);
    saveCreated(set);
  }
}

/** Whether this device/user is allowed to manage (edit/delete/publish) a story. */
export function canManageStory(story: Pick<Story, "id" | "seedAuthorId">): boolean {
  const user = useUserStore.getState().user;
  const id = user?.id ?? "me";
  if (story.seedAuthorId !== id) return false;
  if (id === "me") {
    // Guest: only stories created on this device.
    return loadCreated().has(story.id);
  }
  // Signed in: ownership via unique uid.
  return true;
}
