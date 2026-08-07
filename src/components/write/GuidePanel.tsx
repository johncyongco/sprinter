import { useDeferredValue, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, MessageSquareQuote, Lightbulb, PenLine } from "lucide-react";
import { reviewWriting, type GuideReview, type GuideObservationType } from "@/services/guide";
import { cn } from "@/lib/cn";

const TYPE_ICON: Record<GuideObservationType, typeof MessageSquareQuote> = {
  question: MessageSquareQuote,
  note: Lightbulb,
  suggestion: PenLine,
};

interface GuidePanelProps {
  text: string;
  title?: string;
  kind?: string;
  wordLimit?: number;
}

export function GuidePanel({ text, title, kind, wordLimit }: GuidePanelProps) {
  const deferred = useDeferredValue(text);
  const [review, setReview] = useState<GuideReview | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const body = deferred.trim();
    if (!body) {
      setReview(null);
      return;
    }
    let alive = true;
    const timer = window.setTimeout(async () => {
      setBusy(true);
      try {
        const result = await reviewWriting({
          text: body,
          title,
          kind,
          wordLimit,
        });
        if (alive) setReview(result);
      } finally {
        if (alive) setBusy(false);
      }
    }, 700);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [deferred, title, kind, wordLimit]);

  return (
    <section className="rounded-[32px] border border-border bg-surface p-7 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <div>
            <p className="font-display text-2xl tracking-[-0.02em] leading-none">The quiet coach</p>
            <p className="text-[13px] text-secondary mt-1">
              A Socratic reader asking what your words might become.
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
            review?.provider === "ai"
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-border bg-card text-secondary",
          )}
        >
          {review?.provider === "ai" ? "AI reader" : "Local coach"}
        </span>
      </div>

      {busy && !review && (
        <div className="flex items-center gap-3 text-sm text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-gold" /> Reading your sentences…
        </div>
      )}

      {!busy && !review && (
        <p className="text-sm text-secondary italic leading-relaxed">
          Write a sentence, and the coach will ask you what it might become.
        </p>
      )}

      {review && (
        <AnimatePresence mode="wait">
          <motion.div
            key={review.generatedAt}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-2">
              {[
                `${review.metrics.words.toLocaleString()} words`,
                `${review.metrics.sentences} sentences`,
                `~${review.metrics.avgSentence} w/sentence`,
                review.metrics.passiveCount > 0
                  ? `${review.metrics.passiveCount} passive`
                  : "no passive voice",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-secondary"
                >
                  {chip}
                </span>
              ))}
            </div>

            <ul className="space-y-3">
              {review.observations.map((o, i) => {
                const Icon = TYPE_ICON[o.type];
                return (
                  <li
                    key={`${i}-${o.point.slice(0, 24)}`}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-4"
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        o.type === "question"
                          ? "text-accent"
                          : o.type === "suggestion"
                            ? "text-gold"
                            : "text-secondary",
                      )}
                      strokeWidth={1.5}
                    />
                    <p className="text-[14px] leading-relaxed text-primary/85">{o.point}</p>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
