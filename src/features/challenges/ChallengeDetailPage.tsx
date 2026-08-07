import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Timer, Users, Feather, Trophy } from "lucide-react";
import { getChallenges, getLeaderboard, getChallengeStory } from "@/services/challenges";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useCountdown } from "@/hooks/useCountdown";

export default function ChallengeDetailPage() {
  const { challengeId = "" } = useParams();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: getChallenges,
  });

  const challenge = challenges?.find((c) => c.id === challengeId);

  const { data: leaderboard } = useQuery({
    queryKey: ["challenges", "leaderboard", challengeId],
    queryFn: () => getLeaderboard(challengeId),
    enabled: Boolean(challenge),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!challenge) {
    return <div className="min-h-[50vh] text-secondary">This challenge has closed its doors.</div>;
  }

  const countdown = useCountdown(challenge.endsAt);
  const featured = getChallengeStory(challenge);

  return (
    <div className="space-y-12">
      <Link
        to="/challenges"
        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All challenges
      </Link>

      <header className="relative overflow-hidden rounded-[42px] border border-border bg-surface p-10 sm:p-16 space-y-8">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: "radial-gradient(700px 300px at 85% 0%, rgba(184,155,103,0.12), transparent 60%)",
          }}
        />
        <div className="relative flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
            {challenge.kind}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-secondary">
            <Users className="h-4 w-4" /> {challenge.participants.toLocaleString()} writing
          </span>
        </div>
        <div className="relative space-y-4 max-w-2xl">
          <h1 className="font-display text-[4rem] leading-[0.95] tracking-[-0.05em] max-sm:text-[2.8rem]">
            {challenge.title}
          </h1>
          <p className="text-lg text-primary/85 leading-relaxed">{challenge.prompt}</p>
          {challenge.wordLimit && (
            <p className="text-sm text-secondary">
              Word limit: <strong className="text-primary">{challenge.wordLimit.toLocaleString()}</strong>
            </p>
          )}
        </div>
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="rounded-3xl border border-border bg-card px-6 py-4 flex items-center gap-3">
            <Timer className="h-5 w-5 text-gold" />
            {countdown.expired ? (
              <span className="font-semibold">The lamp has gone out</span>
            ) : (
              <div className="flex items-baseline gap-2 font-display text-2xl tracking-[-0.02em]">
                {countdown.days > 0 && <span>{countdown.days}<small className="text-xs text-secondary font-sans">d</small></span>}
                <span>{countdown.hours}<small className="text-xs text-secondary font-sans">h</small></span>
                <span>{countdown.minutes}<small className="text-xs text-secondary font-sans">m</small></span>
                <span>{countdown.seconds}<small className="text-xs text-secondary font-sans">s</small></span>
              </div>
            )}
          </div>
          {featured ? (
            <Button to={`/stories/${featured.slug}/continue`} size="lg">
              <Feather className="h-4 w-4" /> Write your entry
            </Button>
          ) : (
            <Button to="/explore" size="lg">
              <Feather className="h-4 w-4" /> Find something to continue
            </Button>
          )}
        </div>
      </header>

      {leaderboard && (
        <section className="space-y-6">
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" /> Quality table
          </p>
          <div className="rounded-[34px] border border-border bg-card p-8 sm:p-10 space-y-4">
            {leaderboard.map((row, i) => (
              <div key={row.penName} className="flex items-center gap-6 rounded-3xl border border-border bg-surface p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-base text-primary">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{row.penName}</p>
                  <p className="text-sm text-secondary truncate">{row.contribution}</p>
                </div>
                <span className="text-sm text-secondary shrink-0">
                  Craft <strong className="text-primary">{row.scores.craftsmanship}</strong>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
