import { motion } from "framer-motion";
import { GitFork, BookOpen, Users, Clock, Repeat } from "lucide-react";
import type { Story } from "@/types";
import { getGenomeSummary } from "@/services/stories";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function GenomeSidebar({ story }: { story: Story }) {
  const genome = getGenomeSummary(story);

  const stats = [
    { icon: Users, label: "Contributors", value: genome.contributors },
    { icon: GitFork, label: "Branches", value: genome.branchCount },
    { icon: BookOpen, label: "Continuations", value: genome.continuationCount },
    { icon: Clock, label: "Reading time", value: `${genome.readingMinutes} min` },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="w-[300px] shrink-0 rounded-[30px] border border-border bg-white/70 dark:bg-card/70 backdrop-blur-md p-8 space-y-8 max-xl:w-[260px] max-lg:w-full"
    >
      <div>
        <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-5">
          Story Genome
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-[13px] font-semibold mb-2">Completion</p>
            <ProgressBar value={genome.completion} tone="gold" />
            <p className="text-xs text-secondary mt-2">{genome.completion}% of this story told</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
            <s.icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
            <p className="text-xl font-semibold leading-none">{s.value}</p>
            <p className="text-[11px] text-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-3">
            Emotion
          </p>
          <div className="flex flex-wrap gap-2">
            {genome.emotion.map((e) => (
              <span key={e} className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-[12px] font-medium text-accent">
                {e}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-3">
            Themes
          </p>
          <div className="flex flex-wrap gap-2">
            {genome.themes.map((t) => (
              <span key={t} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-secondary">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-3">
            Perspective
          </p>
          <p className="font-display text-xl">{genome.perspective} person</p>
        </div>

        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-3">
            Pacing
          </p>
          <p className="font-display text-xl capitalize">{genome.pacing}</p>
        </div>
      </div>

      <div>
        <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-3 flex items-center gap-2">
          <Repeat className="h-3.5 w-3.5" /> Recurring Words
        </p>
        <div className="flex flex-wrap gap-2">
          {genome.recurring.map((r) => (
            <span key={r.word} className="rounded-full bg-primary/5 border border-border px-3 py-1.5 text-[12px] text-primary">
              {r.word} <span className="text-secondary/70">×{r.count}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
