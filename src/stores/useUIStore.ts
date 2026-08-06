import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface UIState {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  recentlyViewed: string[];
  notificationPrefs: Record<string, boolean>;
  setTheme: (theme: ThemeMode) => void;
  setResolvedTheme: (theme: "light" | "dark") => void;
  addRecentlyViewed: (storyId: string) => void;
  toggleNotification: (kind: string) => void;
}

const DEFAULT_NOTIFICATION_PREFS = {
  continuation: true,
  critique: true,
  relay: true,
  challenge: true,
  anthology: true,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: "light",
      recentlyViewed: [],
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      setTheme: (theme) => set({ theme }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      addRecentlyViewed: (storyId) =>
        set((s) => ({
          recentlyViewed: [
            storyId,
            ...s.recentlyViewed.filter((id) => id !== storyId),
          ].slice(0, 12),
        })),
      toggleNotification: (kind) =>
        set((s) => ({
          notificationPrefs: {
            ...s.notificationPrefs,
            [kind]: !s.notificationPrefs[kind],
          },
        })),
    }),
    { name: "sprinter-ui", partialize: (s) => ({ theme: s.theme, recentlyViewed: s.recentlyViewed, notificationPrefs: s.notificationPrefs }) },
  ),
);
