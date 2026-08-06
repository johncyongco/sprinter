import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Search, Sparkles } from "lucide-react";
import { getVault, createWord } from "@/services/words";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { BeautifulWord, WordCategory } from "@/types";

const CATEGORIES: WordCategory[] = [
  "Emotion",
  "Nature",
  "The Sacred",
  "Body",
  "Sound",
  "Light",
  "Time",
  "Home",
  "The Sea",
  "Feeling",
];

export function AddWordModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (word: BeautifulWord) => void;
}) {
  const [mode, setMode] = useState<"search" | "create">("search");
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [category, setCategory] = useState<WordCategory | undefined>(undefined);

  const { data: vault } = useQuery({ queryKey: ["vault"], queryFn: getVault });

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vault ?? [];
    return (vault ?? []).filter(
      (w) =>
        w.term.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query, vault]);

  const create = useMutation({
    mutationFn: () =>
      createWord({ term, meaning, category }),
    onSuccess: (word) => {
      onAdd(word);
      reset();
      onClose();
    },
  });

  const reset = () => {
    setQuery("");
    setTerm("");
    setMeaning("");
    setCategory(undefined);
    setMode("search");
  };

  const canCreate = term.trim().length > 0 && meaning.trim().length > 0;

  return (
    <Modal open={open} onClose={onClose} className="max-w-lg" labelledBy="add-word-title">
      <div className="p-8 sm:p-10 space-y-7">
        <div className="space-y-2">
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">Word Vault</p>
          <h2 id="add-word-title" className="font-display text-3xl tracking-[-0.03em]">
            Give this story a word
          </h2>
          <p className="text-sm text-secondary">
            Find one from the vault, or offer the library something new.
          </p>
        </div>

        <div className="flex gap-2">
          {(["search", "create"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors",
                mode === m
                  ? "border-primary bg-primary text-background"
                  : "border-border bg-card text-secondary hover:text-primary",
              )}
            >
              {m === "search" ? <Search className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {m === "search" ? "Search the vault" : "Create new"}
            </button>
          ))}
        </div>

        {mode === "search" ? (
          <div className="space-y-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sehnsucht, silence, mercy…"
              aria-label="Search the word vault"
            />
            <div className="max-h-72 overflow-y-auto space-y-2">
              {matches.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    onAdd(w);
                    reset();
                    onClose();
                  }}
                  className="w-full rounded-2xl border border-border bg-card p-4 text-left transition hover:border-gold/40 hover:-translate-y-px"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-xl tracking-[-0.02em]">{w.term}</p>
                    {w.category && (
                      <span className="text-[11px] uppercase tracking-[0.12em] text-secondary">{w.category}</span>
                    )}
                  </div>
                  <p className="text-[13px] text-secondary leading-relaxed mt-1 line-clamp-2">{w.meaning}</p>
                </button>
              ))}
              {matches.length === 0 && (
                <p className="text-sm text-secondary italic py-4 text-center">
                  Not in the vault. Try creating it.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="w-term" className="text-sm font-semibold">Word</label>
              <Input
                id="w-term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Sehnsucht"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="w-meaning" className="text-sm font-semibold">Meaning</label>
              <Input
                id="w-meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Longing for something beyond reach."
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(category === c ? undefined : c)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                      category === c
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-card text-secondary hover:text-primary",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={!canCreate || create.isPending}
              onClick={() => create.mutate()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.02] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Add to the vault
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
