import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Feather } from "lucide-react";
import { useUserStore, GOAL_OPTIONS } from "@/stores/useUserStore";
import { getVault } from "@/services/words";
import { Logo } from "@/components/common/Logo";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Genre, WritingGoal } from "@/types";

const GENRES: Genre[] = [
  "Literary Fiction",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Historical Fiction",
  "Poetry",
  "Romance",
  "Horror",
  "Memoir",
  "Speculative",
  "Minimalist",
];

const STEPS = ["Your name", "Your genres", "Your words", "Your goal", "Your line"];

export default function OnboardingPage() {
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [penName, setPenName] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [wordIds, setWordIds] = useState<string[]>([]);
  const [goal, setGoal] = useState<WritingGoal | null>(null);
  const [favoriteLine, setFavoriteLine] = useState("");
  const [finishing, setFinishing] = useState(false);

  const { data: vault } = useQuery({ queryKey: ["vault"], queryFn: getVault });

  const canContinue = useMemo(() => {
    switch (step) {
      case 0: return penName.trim().length >= 2;
      case 1: return genres.length > 0;
      case 2: return wordIds.length >= 1;
      case 3: return goal !== null;
      default: return favoriteLine.trim().length > 0;
    }
  }, [step, penName, genres, wordIds, goal, favoriteLine]);

  const next = () => {
    if (step === STEPS.length - 1) {
      setFinishing(true);
      window.setTimeout(() => {
        completeOnboarding({
          penName: penName.trim(),
          genres,
          favoriteWordIds: wordIds,
          goals: goal ? [goal] : [],
          favoriteLine: favoriteLine.trim(),
        });
      }, 400);
      return;
    }
    setStep((s) => s + 1);
  };

  const toggle = (id: string) =>
    setWordIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : prev.length >= 3 ? prev : [...prev, id],
    );

  const toggleGenre = (g: Genre) =>
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="mx-auto w-full max-w-2xl px-6 pt-10 flex items-center justify-between">
        <Logo />
        <span className="text-sm text-secondary font-medium">
          {step + 1} / {STEPS.length}
        </span>
      </header>

      <div className="mx-auto w-full max-w-2xl px-6 pt-8">
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gold"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">{STEPS[step]}</p>

            {step === 0 && (
              <div className="space-y-6">
                <h1 className="font-display text-4xl tracking-[-0.04em] leading-tight">
                  What should the library call you?
                </h1>
                <p className="text-secondary leading-relaxed">
                  A pen name is a small beginning — a way of being yourself on the page without the noise of your real name.
                </p>
                <Input
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  placeholder="e.g. Mara Wren"
                  className="text-xl h-14"
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h1 className="font-display text-4xl tracking-[-0.04em] leading-tight">
                  Where does your writing lean?
                </h1>
                <p className="text-secondary leading-relaxed">
                  Choose as many as feel true. This tunes the stories we set before you.
                </p>
                <div className="flex flex-wrap gap-3">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={cn(
                        "rounded-full border px-5 py-2.5 text-sm font-medium transition",
                        genres.includes(g)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card text-secondary hover:text-primary",
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h1 className="font-display text-4xl tracking-[-0.04em] leading-tight">
                  Choose up to three words you love
                </h1>
                <p className="text-secondary leading-relaxed">
                  The word vault marks the vault of the language. These will follow you as the season does.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vault?.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggle(w.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        wordIds.includes(w.id)
                          ? "border-accent bg-accent/10"
                          : "border-border bg-card hover:border-accent/30",
                      )}
                    >
                      <p className="font-display text-xl tracking-[-0.02em]">{w.term}</p>
                      <p className="text-xs text-secondary mt-1 line-clamp-2">{w.meaning}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h1 className="font-display text-4xl tracking-[-0.04em] leading-tight">
                  How much is enough, today?
                </h1>
                <p className="text-secondary leading-relaxed">
                  Sprinter never demands more. Pick the size of the quiet step you're willing to take.
                </p>
                <div className="space-y-3">
                  {GOAL_OPTIONS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-2xl border p-5 text-left transition",
                        goal?.id === g.id
                          ? "border-accent bg-accent/10"
                          : "border-border bg-card hover:border-accent/30",
                      )}
                    >
                      <span className="font-medium">{g.label}</span>
                      <span className="text-[13px] text-secondary">≈ {g.wordsPerSession} words</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h1 className="font-display text-4xl tracking-[-0.04em] leading-tight">
                  One line that carries you
                </h1>
                <p className="text-secondary leading-relaxed">
                  The line that appears under your name — a sentence you're glad someone else has written, or that you wish you had.
                </p>
                <Input
                  value={favoriteLine}
                  onChange={(e) => setFavoriteLine(e.target.value)}
                  placeholder="Something is always waiting for your next sentence."
                  className="text-lg h-14"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mx-auto w-full max-w-2xl px-6 pb-12 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-secondary transition hover:text-primary disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canContinue || finishing}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-background transition hover:scale-[1.02] disabled:opacity-40"
        >
          {step === STEPS.length - 1 ? (
            finishing ? (
              "Opening the door…"
            ) : (
              <>
                Begin <Feather className="h-4 w-4" />
              </>
            )
          ) : (
            <>
              Continue <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
