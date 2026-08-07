import { fetchProfile, upsertProfile } from "./supabase";
import type { UserProfile } from "@/stores/useUserStore";

/* ============================================================
   Sync a writer's profile (pen name, bio, favorite line, etc.)
   to Supabase `profiles` so edits persist across devices.
   ============================================================ */

export async function saveProfileToCloud(profile: UserProfile): Promise<boolean> {
  if (profile.id === "me" || !profile.id) return false;
  return upsertProfile({
    id: profile.id,
    penName: profile.penName,
    avatar: profile.avatar || "Y",
    bio: profile.bio,
    favoriteLine: profile.favoriteLine,
    genres: profile.genres,
    favoriteWordIds: profile.favoriteWordIds,
    goals: profile.goals,
  });
}

/** Load the stored cloud profile for a uid, or null if none exists. */
export async function loadProfileFromCloud(uid: string): Promise<UserProfile | null> {
  const row = await fetchProfile(uid);
  if (!row) return null;
  return {
    id: uid,
    penName: row.pen_name || "",
    avatar: row.avatar || "Y",
    bio: row.bio || "",
    favoriteLine: row.favorite_line || "",
    genres: Array.isArray(row.genres) ? (row.genres as UserProfile["genres"]) : [],
    favoriteWordIds: Array.isArray(row.favorite_word_ids)
      ? (row.favorite_word_ids as string[])
      : [],
    goals: Array.isArray(row.goals) ? (row.goals as UserProfile["goals"]) : [],
  };
}
