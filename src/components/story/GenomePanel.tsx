import { Users, GitFork, BookOpen, Clock } from "lucide-react";
import type { Story } from "@/types";
import { getGenomeSummary } from "@/services/stories";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";

export function GenomePanel({ story }: { story: Story }) {
  const genome = getGenomeSummary(story);

  const stats = [
    { icon: Users, label: "Contributors", value: genome.contributors },
    { icon: GitFork, label: "Branches", value: genome.branchCount },
    { icon: BookOpen, label: "Continuations", value: genome.continuationCount },
    { icon: Clock, label: "Reading", value: `${genome.readingMinutes}m` },
  ];

  return (
    <div className="flex flex-col gap-8 p-5 lg:p-6">
      <div>
        <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-4">
          Story Genome
        </p>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] font-semibold">Completion</p>
            <p className="text-[13px] text-secondary">{genome.completion}%</p>
          </div>
          <ProgressBar value={genome.completion} tone="gold" />
          <p className="text-xs text-secondary">of this story told · ongoing</p>
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

      <GenomeRow label="Dominant Emotion">
        {genome.emotion.map((e) => (
          <span key={e} className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-[12px] font-medium text-accent">
            {e}
          </span>
        ))}
      </GenomeRow>

      <GenomeRow label="Pacing">
        <span className="font-display text-xl tracking-[-0.02em]">{genome.pacing}</span>
      </GenomeRow>

      <GenomeRow label="Perspective">
        <span className="font-display text-xl tracking-[-0.02em]">{genome.perspective} person</span>
      </GenomeRow>

      <GenomeRow label="Themes">
        {genome.themes.map((t) => (
          <span key={t} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-secondary">
            {t}
          </span>
        ))}
      </GenomeRow>
    </div>
  );
}

function GenomeRow({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className={cn("uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-2")}>
        {icon} {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
