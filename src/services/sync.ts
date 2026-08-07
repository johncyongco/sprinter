import { STORIES, MY_SEEDS, NODES } from "./mock";
import { fetchSavedSeeds, insertSavedSeedsBatch, isRealUuid } from "./supabase";
import type { Story } from "@/types";

/* ============================================================
   One-time migration of guest-authored local works into a
   signed-in account. Called after Google sign-in, with the
   user's explicit consent (see SyncPrompt).
   ============================================================ */

export interface SyncResult {
  seedsImported: number;
}

export function localGuestSeeds(): Story[] {
  return MY_SEEDS.filter((s) => s.seedAuthorId === "me");
}

export function hasGuestWorks(): boolean {
  return (
    localGuestSeeds().length > 0 ||
    STORIES.some((s) => s.seedAuthorId === "me") ||
    NODES.some((n) => n.authorId === "me")
  );
}

/**
 * Upload the writer's local saved seeds into their account, re-tagged
 * with the real uid so they survive across devices. Does NOT publish
 * them (saved seeds stay private), and never duplicates ones already
 * in the cloud (matched by slug).
 */
export async function migrateLocalWorks(uid: string): Promise<SyncResult> {
  const result: SyncResult = { seedsImported: 0 };
  if (!isRealUuid(uid)) return result;

  const remote = await fetchSavedSeeds(uid);
  const remoteSlugs = new Set((remote ?? []).map((s) => s.slug));

  const toImport = localGuestSeeds().filter((s) => !remoteSlugs.has(s.slug));
  if (toImport.length > 0) {
    const reTagged = toImport.map((s) => ({
      ...s,
      seedAuthorId: uid,
      contributorIds: [uid, ...s.contributorIds.filter((id) => id !== "me")],
    }));
    result.seedsImported = await insertSavedSeedsBatch(reTagged, uid);
  }

  return result;
}

/**
 * Mark this device as having finished importing so the prompt does not
 * recur on every sign-in. Keys off the uid so two accounts don't share.
 */
export function syncFinishedKey(uid: string): string {
  return `sprinter-sync-${uid}`;
}
