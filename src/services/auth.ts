import { supabase } from "./client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/stores/useUserStore";

/* ============================================================
   Supabase auth — Sign in with Google, session hydration,
   and mapping a Supabase auth user into the app's UserProfile.
   Falls back to null when the backend is not configured.
   ============================================================ */

function isBackendUp(): boolean {
  return supabase !== null;
}

export async function getSessionUser(): Promise<User | null> {
  if (!isBackendUp()) return null;
  const { data } = await supabase!.auth.getSession();
  return data.session?.user ?? null;
}

export async function signInWithGoogle(): Promise<void> {
  if (!isBackendUp()) return;
  const { error } = await supabase!.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/auth/v1/callback",
    },
  });
  if (error) throw error;
}

export async function signOutFromSupabase(): Promise<void> {
  if (!isBackendUp()) return;
  await supabase!.auth.signOut();
}

export function onAuthStateChange(
  cb: (user: User | null) => void,
): () => void {
  if (!isBackendUp()) {
    cb(null);
    return () => {};
  }
  const {
    data: { subscription },
  } = supabase!.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null);
  });
  // Emit any session already in localStorage OR recovered from the
  // callback URL immediately, so a refresh / deep-link signs the user in.
  void supabase!.auth.getSession().then(({ data }) => {
    cb(data.session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Y";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function supabaseUserToProfile(user: User): UserProfile {
  const email = user.email ?? "";
  const googleName = user.user_metadata?.full_name ?? email.split("@")[0] ?? "";
  const penName = googleName || "Your Pen Name";
  return {
    id: user.id,
    penName,
    avatar: initials(penName),
    bio: "",
    favoriteLine: "",
    genres: [],
    favoriteWordIds: [],
    goals: [],
    provider: "google",
  };
}
