import { Star } from "lucide-react";
import type { Critique } from "@/types";
import { authorById } from "@/services/mock";
import { Avatar } from "@/components/ui/Avatar";
import { CRITIQUE_DIMENSIONS } from "@/services/critiques";
import { cn } from "@/lib/cn";

export function CritiqueCard({
  critique,
}: {
  critique: Critique;
  index?: number;
}) {
  const author = authorById(critique.authorId);
  const average =
    Object.values(critique.scores).reduce((a, b) => a + b, 0) /
    CRITIQUE_DIMENSIONS.length;

  return (
    <article
      className="rounded-[24px] border border-border bg-card p-8 space-y-6"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar text={author?.avatar ?? "?"} size="sm" />
          <div>
            <p className="font-semibold text-[15px]">{author?.penName ?? "A quiet author"}</p>
            <p className="text-[13px] text-secondary">{critique.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {critique.isEditorial && (
            <span className="rounded-full bg-gold/10 text-gold border border-gold/30 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
              Editorial
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 px-3.5 py-1 text-[13px] font-semibold">
            <Star className="h-3.5 w-3.5 fill-current" />
            {average.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
        {CRITIQUE_DIMENSIONS.map((d) => (
          <div key={d.key}>
            <div className="flex items-center justify-between text-[12px] mb-1.5">
              <span className="text-secondary">{d.label}</span>
              <span className="font-semibold">{critique.scores[d.key]}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-border/60">
              <div
                style={{ width: `${critique.scores[d.key] * 10}%` }}
                className={cn("h-full rounded-full", scoreTone(critique.scores[d.key]))}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[15px] leading-relaxed text-primary/90">{critique.reflection}</p>
    </article>
  );
}

function scoreTone(score: number): string {
  if (score >= 9) return "bg-success";
  if (score >= 7) return "bg-accent";
  if (score >= 5) return "bg-warning";
  return "bg-danger";
}
