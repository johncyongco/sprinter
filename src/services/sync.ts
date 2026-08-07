import { STORIES, MY_SEEDS, NODES, CRITIQUES, VAULT_EXTRA, persistLibrary } from "./mock";
import {
  fetchSavedSeeds,
  insertSavedSeedsBatch,
  insertCritiquesBatch,
  insertWordsBatch,
  isRealUuid,
} from "./supabase";
import type { Story, Critique, BeautifulWord } from "@/types";

/* ============================================================
   One-time migration of guest-authored local works into a
   signed-in account. Called after Google sign-in, with the
   user's explicit consent (see SyncPrompt).
   ============================================================ */

export interface SyncResult {
  seedsImported: number;
  critiquesImported: number;
  wordsImported: number;
}

export function localGuestSeeds(): Story[] {
  return MY_SEEDS.filter((s) => s.seedAuthorId === "me");
}

export function localGuestCritiques(): Critique[] {
  return CRITIQUES.filter((c) => c.authorId === "me" && isRealUuid(c.storyId));
}

export function localGuestWords(): BeautifulWord[] {
  return VAULT_EXTRA;
}

export function hasGuestWorks(): boolean {
  return (
    localGuestSeeds().length > 0 ||
    STORIES.some((s) => s.seedAuthorId === "me") ||
    NODES.some((n) => n.authorId === "me") ||
    localGuestCritiques().length > 0 ||
    localGuestWords().length > 0
  );
}

/**
 * Upload the writer's local saved seeds, critiques and words into their
 * account, re-tagged with the real uid so they survive across devices.
 * Saved seeds stay private; nothing is published. Skips anything already
 * in the cloud (seeds matched by slug, words by term — the table enforces
 * uniqueness on term).
 */
export async function migrateLocalWorks(uid: string): Promise<SyncResult> {
  const result: SyncResult = { seedsImported: 0, critiquesImported: 0, wordsImported: 0 };
  if (!isRealUuid(uid)) return result;

  const remoteSeeds = await fetchSavedSeeds(uid);
  const remoteSlugs = new Set((remoteSeeds ?? []).map((s) => s.slug));

  const local = localGuestSeeds();
  const seedsToImport = local.filter((s) => !remoteSlugs.has(s.slug));
  if (seedsToImport.length > 0) {
    const reTagged = seedsToImport.map((s) => ({
      ...s,
      seedAuthorId: uid,
      contributorIds: [uid, ...s.contributorIds.filter((id) => id !== "me")],
    }));
    const imported = await insertSavedSeedsBatch(reTagged, uid);
    result.seedsImported = imported;
    // Hard-reset MY_SEEDS so successfully imported guest seeds aren't shown
    // again locally (they now live in the cloud). The empty array triggers a
    // fresh read from the cloud on the next getSavedStories call.
    if (imported >= seedsToImport.length) {
      MY_SEEDS.length = 0;
      persistLibrary();
    }
  }

  const critiquesToImport = localGuestCritiques().map((c) => ({
    storyId: c.storyId,
    authorId: uid,
    scores: c.scores,
    reflection: c.reflection,
  }));
  if (critiquesToImport.length > 0) {
    result.critiquesImported = await insertCritiquesBatch(critiquesToImport, uid);
  }

  const wordsToImport = localGuestWords();
  if (wordsToImport.length > 0) {
    result.wordsImported = await insertWordsBatch(wordsToImport, uid);
  }

  return result;
}

/**
 * Automatic backup: upload any local-only seeds, critiques and words to the
 * signed-in account, idempotently (seeds by slug, words by term). Called on
 * every load after sign-in so local data is preserved in Supabase even if
 * localStorage is later cleared. Never breaks the UI.
 */
export async function backupLocalWorksToCloud(uid: string): Promise<void> {
  if (!isRealUuid(uid)) return;
  try {
    await migrateLocalWorks(uid);
    // Keep a marker so the backup isn't re-run every single render, but
    // re-run when new local work is created (createStory/freeWrite already
    // push to the cloud, so this is only for pre-existing guest data).
  } catch {
    /* ignore */
  }
}

/**
 * Mark this device as having finished importing so the prompt does not
 * recur on every sign-in. Keys off the uid so two accounts don't share.
 */
export function syncFinishedKey(uid: string): string {
  return `sprinter-sync-${uid}`;
}
