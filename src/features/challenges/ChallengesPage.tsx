import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Timer, Users, ArrowRight, Trophy } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <SectionHeading
        eyebrow="Challenges"
        title="Small rooms, gentle deadlines"
        subtitle="Prompts that ask for a sentence, a paragraph, a whole relay. Every challenge is judged on craftsmanship — not on how fast you wrote it."
      />

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300",
              kind === k
                ? "border-primary bg-primary text-background"
                : "border-border bg-card text-secondary hover:text-primary",
            )}
          >
            {k}
          </button>
        ))}
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
              <motion.div
                key={row.penName}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
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
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function ChallengeCard({
  challenge,
  index,
}: {
  challenge: Challenge;
  index: number;
}) {
  const countdown = useCountdown(challenge.endsAt);
  const featured = getChallengeStory(challenge);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
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
          to={`/challenges/${challenge.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:scale-[1.03] active:scale-95"
        >
          Join the prompt <ArrowRight className="h-4 w-4" />
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
    </motion.div>
  );
}
