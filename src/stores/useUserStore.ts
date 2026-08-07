import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Genre, WritingGoal } from "@/types";

export interface UserProfile {
  id: string;
  penName: string;
  avatar: string;
  cover?: string;
  bio: string;
  favoriteLine: string;
  genres: Genre[];
  favoriteWordIds: string[];
  goals: WritingGoal[];
  provider?: "email" | "google" | "github";
}

export interface OnboardingProfile {
  penName: string;
  genres: Genre[];
  favoriteWordIds: string[];
  goals: WritingGoal[];
  favoriteLine: string;
}

interface UserState {
  user: UserProfile | null;
  onboarded: boolean;
  signIn: (provider?: UserProfile["provider"]) => void;
  setSessionUser: (user: UserProfile | null, onboarded?: boolean) => void;
  completeOnboarding: (profile: OnboardingProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  signOut: () => void;
}

const DEFAULTS: WritingGoal[] = [
  { id: "g-daily", label: "A sentence every day", wordsPerSession: 50 },
  { id: "g-soft", label: "A quiet paragraph", wordsPerSession: 200 },
  { id: "g-relay", label: "A full continuation", wordsPerSession: 400 },
];

export const GOAL_OPTIONS: WritingGoal[] = [
  { id: "g-slip", label: "A single true line", wordsPerSession: 25 },
  { id: "g-daily", label: "A sentence every day", wordsPerSession: 50 },
  { id: "g-soft", label: "A quiet paragraph", wordsPerSession: 200 },
  { id: "g-relay", label: "A full continuation", wordsPerSession: 400 },
  { id: "g-seed", label: "Seed a new story", wordsPerSession: 600 },
];

const GUEST_USER: UserProfile = {
  id: "me",
  penName: "Guest",
  avatar: "G",
  bio: "",
  favoriteLine: "",
  genres: [],
  favoriteWordIds: [],
  goals: DEFAULTS,
};

/* Persist a user's edited profile keyed by their account uid, so it survives
   logout → login (a returning session's Google name won't clobber edits). */
function profileKey(uid: string): string {
  return `sprinter-profile-${uid}`;
}

function loadStoredProfile(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(profileKey(uid));
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function saveStoredProfile(profile: UserProfile): void {
  if (profile.id === "me" || !profile.id) return;
  try {
    localStorage.setItem(profileKey(profile.id), JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: GUEST_USER,
      onboarded: true,
      signIn: (provider = "email") =>
        set({
          user: {
            id: "me",
            penName: "Your Pen Name",
            avatar: "Y",
            bio: "A writer finding the way back to sentences.",
            favoriteLine: "Someone is always waiting for your next sentence.",
            genres: [],
            favoriteWordIds: [],
            goals: DEFAULTS,
            provider,
          },
          onboarded: false,
        }),
      setSessionUser: (sessionUser, onboarded = true) =>
        set((s) => {
          if (!sessionUser) return { user: sessionUser, onboarded: false };
          // Prefer the edited profile saved for this account, then the live
          // session's user, so a re-login never reverts the pen name.
          const stored = loadStoredProfile(sessionUser.id);
          const prev =
            s.user && s.user.id === sessionUser.id ? s.user : undefined;
          const editable = stored
            ? {
                penName: stored.penName || sessionUser.penName,
                avatar: stored.avatar || sessionUser.avatar,
                bio: stored.bio ?? "",
                favoriteLine: stored.favoriteLine ?? "",
                genres: stored.genres,
                favoriteWordIds: stored.favoriteWordIds,
                goals: stored.goals,
              }
            : {
                penName: prev?.penName || sessionUser.penName,
                avatar: prev?.avatar || sessionUser.avatar,
                bio: prev?.bio ?? "",
                favoriteLine: prev?.favoriteLine ?? "",
                genres: prev?.genres ?? sessionUser.genres,
                favoriteWordIds: prev?.favoriteWordIds ?? sessionUser.favoriteWordIds,
                goals: prev?.goals ?? sessionUser.goals,
              };
          return {
            user: { ...sessionUser, ...editable },
            onboarded,
          };
        }),
      completeOnboarding: (profile) =>
        set((s) => ({
          onboarded: true,
          user: {
            ...(s.user ?? {
              id: "me",
              penName: "Your Pen Name",
              avatar: "Y",
              bio: "",
              favoriteLine: "",
              genres: [],
              favoriteWordIds: [],
              goals: DEFAULTS,
            }),
            ...profile,
            avatar: initials(profile.penName),
          },
        })),
      updateProfile: (patch) =>
        set((s) => {
          if (!s.user) return {};
          const user = {
            ...s.user,
            ...patch,
            ...(patch.penName ? { avatar: initials(patch.penName) } : {}),
          };
          saveStoredProfile(user);
          return { user };
        }),
      signOut: () =>
        set((s) => {
          if (s.user) saveStoredProfile(s.user);
          return { user: GUEST_USER, onboarded: true };
        }),
    }),
    {
      name: "sprinter-user",
      version: 3,
      migrate: () => ({ user: GUEST_USER, onboarded: true }),
    },
  ),
);

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Y";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
