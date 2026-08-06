import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Send } from "lucide-react";
import type { CritiqueScoreKey } from "@/types";
import { CRITIQUE_DIMENSIONS, submitCritique } from "@/services/critiques";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

const INITIAL: Record<CritiqueScoreKey, number> = {
  emotion: 5,
  logic: 5,
  pacing: 5,
  imagery: 5,
  dialogue: 5,
  originality: 5,
  theme: 5,
  ending: 5,
};

export function CritiqueForm({ storyId }: { storyId: string }) {
  const [scores, setScores] = useState<Record<CritiqueScoreKey, number>>({ ...INITIAL });
  const [reflection, setReflection] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => submitCritique({ storyId, scores, reflection }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["critiques", storyId] });
      queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      setScores({ ...INITIAL });
      setReflection("");
    },
  });

  const average =
    Object.values(scores).reduce((a, b) => a + b, 0) / CRITIQUE_DIMENSIONS.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[28px] border border-border bg-surface p-8 sm:p-10 space-y-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
            Constructive Critique
          </p>
          <h2 className="font-display text-3xl tracking-[-0.03em]">Help it become</h2>
          <p className="text-sm text-secondary leading-relaxed max-w-lg">
            Critique the story, not the author. No dislikes, no scores for toxicity —
            only what this story could become.
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-2 rounded-full bg-danger/10 text-danger border border-danger/20 px-4 py-2 text-[13px] font-semibold">
          <Heart className="h-3.5 w-3.5 fill-current" /> Kindness required
        </span>
      </div>

      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {CRITIQUE_DIMENSIONS.map((d) => (
          <div key={d.key}>
            <div className="flex items-baseline justify-between mb-2">
              <label htmlFor={`score-${d.key}`} className="text-sm font-semibold">
                {d.label}
              </label>
              <span className="text-sm font-bold text-accent">{scores[d.key]}/10</span>
            </div>
            <input
              id={`score-${d.key}`}
              type="range"
              min={1}
              max={10}
              step={1}
              value={scores[d.key]}
              style={{ ["--range-fill" as string]: `${((scores[d.key] - 1) / 9) * 100}%` }}
              onChange={(e) => setScores((s) => ({ ...s, [d.key]: Number(e.target.value) }))}
              className="score-range w-full"
              aria-valuetext={`${d.label}: ${scores[d.key]} of 10`}
            />
            <p className="mt-1.5 text-xs text-secondary">{d.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between gap-6 flex-wrap">
        <div>
          <p className="text-sm text-secondary">Average across dimensions</p>
          <p className="font-display text-3xl">{average.toFixed(1)}</p>
        </div>
        <p className="text-xs text-secondary max-w-[220px] italic">
          A kind score is a gift; a kind sentence is better.
        </p>
      </div>

      <Textarea
        label="Your reflection"
        hint="What stayed with you? What could the next hand carry forward?"
        placeholder="This story taught me something about… The line that stayed with me was… The next hand might…"
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        className="min-h-[140px]"
        rows={5}
      />

      <div className="flex items-center justify-between gap-4">
        <p className={cn("text-sm", reflection.length > 20 ? "text-success" : "text-secondary")}>
          {reflection.length > 20
            ? "Thank you — this will help someone."
            : "A few sentences make it a true critique."}
        </p>
        <Button
          onClick={() => mutation.mutate()}
          disabled={reflection.trim().length < 20 || mutation.isPending}
        >
          <Send className="h-4 w-4" />
          {mutation.isPending ? "Sending…" : "Share critique"}
        </Button>
      </div>
    </motion.section>
  );
}
