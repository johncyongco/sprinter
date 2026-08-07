import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Timer, Users, Trophy, Feather } from "lucide-react";
import { getChallenges, getLeaderboard, getChallengeStory } from "@/services/challenges";
import type { Challenge, ChallengeKind } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/cn";

const KINDS: (ChallengeKind | "All")[] = ["All", "Daily Sprint", "Weekly Prompt", "Relay", "Timed", "Community"];

export default function ChallengesPage() {
  const { data: challenges, isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: getChallenges,
  });
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");

  const { data: leaderboard } = useQuery({
    queryKey: ["challenges", "leaderboard", challenges?.[0]?.id],
    queryFn: () => getLeaderboard(challenges?.[0]?.id ?? "ch-2"),
    enabled: Boolean(challenges?.length),
  });

  const filtered = (challenges ?? []).filter(
    (c) => kind === "All" || c.kind === kind,
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-x-7 gap-y-2 border-b border-border">
        {KINDS.map((k) => {
          const active = kind === k;
          const count =
            k === "All"
              ? challenges?.length ?? 0
              : challenges?.filter((c) => c.kind === k).length ?? 0;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "relative -mb-px flex items-center gap-1.5 pb-2.5 text-sm font-medium transition-colors duration-300",
                active ? "text-primary" : "text-secondary hover:text-primary",
              )}
            >
              {k}
              <span
                className={cn(
                  "text-xs tabular-nums",
                  active ? "text-accent" : "text-secondary/70",
                )}
              >
                {count}
              </span>
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 transition-colors duration-300",
                  active ? "bg-accent" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-[28px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {filtered.map((challenge, i) => (
            <ChallengeCard key={challenge.id} challenge={challenge} index={i} />
          ))}
        </div>
      )}

      {leaderboard && (
        <section className="space-y-8">
          <SectionHeading
            eyebrow="Quality, not quantity"
            title="This month's table"
            subtitle="Rated by the community on craftsmanship and courage. No points for speed."
          />
          <div className="rounded-[34px] border border-border bg-surface p-8 sm:p-10 space-y-4">
            {leaderboard.map((row, i) => (
              <div
                key={row.penName}
                className="flex items-center gap-6 rounded-3xl border border-border bg-card p-6"
              >
                <span
                  className={cn(
                    "grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-lg",
                    i === 0 ? "bg-gold/15 text-gold border border-gold/30" : "bg-surface text-secondary border border-border",
                  )}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{row.penName}</p>
                  <p className="text-sm text-secondary truncate">{row.contribution}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[13px] text-secondary">
                    <Trophy className="h-3.5 w-3.5 text-gold" /> Craft {row.scores.craftsmanship}
                  </span>
                  <span className="flex items-center gap-1.5 text-[13px] text-secondary">
                    <Trophy className="h-3.5 w-3.5 text-accent" /> Courage {row.scores.courage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ChallengeCard({
  challenge,
}: {
  challenge: Challenge;
  index: number;
}) {
  const countdown = useCountdown(challenge.endsAt);
  const featured = getChallengeStory(challenge);

  return (
    <div
      className="flex flex-col justify-between gap-8 rounded-[28px] border border-border/70 bg-card p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
            {challenge.kind}
          </span>
          {!countdown.expired && (
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gold">
              <Timer className="h-3.5 w-3.5" />
              {countdown.days}d {countdown.hours}h {countdown.minutes}m
            </span>
          )}
        </div>
        <div>
          <h3 className="font-display text-3xl tracking-[-0.03em] leading-tight mb-3">{challenge.title}</h3>
          <p className="text-secondary leading-relaxed">{challenge.prompt}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-secondary">
          {typeof challenge.wordLimit === "number" && (
            <span>{challenge.wordLimit.toLocaleString()} words max</span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {challenge.participants.toLocaleString()} writing
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/write?challenge=${challenge.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:scale-[1.03] active:scale-95"
        >
          <Feather className="h-4 w-4" /> Write your entry
        </Link>
        <Link
          to={`/challenges/${challenge.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-secondary transition hover:scale-[1.03] hover:text-primary active:scale-95"
        >
          See details
        </Link>
        {featured && (
          <Link
            to={`/stories/${featured.slug}`}
            className="text-sm font-semibold text-accent hover:text-primary transition-colors"
          >
            See this month's best →
          </Link>
        )}
      </div>
    </div>
  );
}
