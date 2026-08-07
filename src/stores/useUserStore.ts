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
          // Preserve the user's edited profile for a returning session (same
          // uid) instead of clobbering it with the Google/default values.
          const prev =
            s.user && s.user.id === sessionUser.id ? s.user : undefined;
          const editable = prev
            ? {
                penName: prev.penName || sessionUser.penName,
                avatar: prev.avatar || sessionUser.avatar,
                bio: prev.bio,
                favoriteLine: prev.favoriteLine,
                genres: prev.genres,
                favoriteWordIds: prev.favoriteWordIds,
                goals: prev.goals,
              }
            : {
                penName: sessionUser.penName,
                avatar: sessionUser.avatar,
                bio: sessionUser.bio,
                favoriteLine: sessionUser.favoriteLine,
                genres: sessionUser.genres,
                favoriteWordIds: sessionUser.favoriteWordIds,
                goals: sessionUser.goals,
              };
          return {
            user: {
              ...sessionUser,
              ...editable,
            },
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
        set((s) =>
          s.user
            ? {
                user: {
                  ...s.user,
                  ...patch,
                  ...(patch.penName ? { avatar: initials(patch.penName) } : {}),
                },
              }
            : {},
        ),
      signOut: () => set({ user: GUEST_USER, onboarded: true }),
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
