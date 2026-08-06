import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Draft } from "@/types";

interface DraftState {
  drafts: Record<string, Draft>;
  lastSaved: number | null;
  saveDraft: (draft: Draft) => void;
  getDraft: (storyId: string) => Draft | undefined;
  clearDraft: (storyId: string) => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      lastSaved: null,
      saveDraft: (draft) =>
        set((s) => ({
          drafts: { ...s.drafts, [draft.storyId]: { ...draft, savedAt: new Date().toISOString() } },
          lastSaved: Date.now(),
        })),
      getDraft: (storyId) => get().drafts[storyId],
      clearDraft: (storyId) =>
        set((s) => {
          const { [storyId]: _removed, ...rest } = s.drafts;
          void _removed;
          return { drafts: rest };
        }),
    }),
    { name: "sprinter-drafts" },
  ),
);
