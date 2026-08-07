import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Feather, Timer, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getHomeFeed } from "@/services/stories";
import { getTrendingWords } from "@/services/words";
import { WEEKLY_PROMPT, RELAY, authorById } from "@/services/mock";
import type { BeautifulWord } from "@/types";
import { StoryCard } from "@/components/story/StoryCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomePage() {
  const { data: feed, isLoading } = useQuery({
    queryKey: ["home", "feed"],
    queryFn: getHomeFeed,
  });

  const { data: trending } = useQuery({
    queryKey: ["words", "trending"],
    queryFn: () => getTrendingWords(7),
  });

  return (
    <div className="space-y-16 max-sm:space-y-12">
      <Hero />

      <section className="border-t border-border pt-12">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-[28px]" />
            ))}
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            {feed?.waiting.map((story, i) => (
              <div key={story.id} className="mb-5 break-inside-avoid">
                <StoryCard story={story} index={i} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 sm:mt-10">
          <Link
            to="/explore"
            className="group flex flex-col gap-4 rounded-[28px] border border-gold/25 bg-gradient-to-br from-gold/15 via-card to-accent/10 p-7 sm:p-9 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
                The library
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                Explore the Library{" "}
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </span>
            </div>
            <p className="text-sm text-secondary leading-relaxed max-w-xl">
              Every story, word, and branch waiting to be carried. Step in and leave your sentence.
            </p>
          </Link>
        </div>
      </section>

      <TrendingWordsSection words={trending} />

      <section className="rounded-[28px] border border-success/25 bg-gradient-to-br from-success/15 via-surface to-gold/10 p-7 sm:p-9">
        <div className="mb-6 space-y-4">
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
            From the editors
          </p>
          <p className="text-sm text-secondary leading-relaxed max-w-xl">
            A quiet shelf of picks from the library — stories the editors are grateful to see growing.
          </p>
        </div>
        <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
          {feed?.picks.map((story, i) => (
            <div key={story.id} className="mb-5 break-inside-avoid">
              <StoryCard story={story} index={i} />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WeeklyPromptCard />
        <RelayCard />
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-2 sm:pt-16 sm:pb-6">
      <div className="relative mx-auto max-w-4xl space-y-5 text-center sm:space-y-8">
        <h1 className="font-display text-[4.5rem] leading-[0.94] tracking-[-0.045em] max-lg:text-[3.5rem] max-sm:text-[2rem] max-sm:leading-[1.08]">
          Leave a sentence someone else will carry.
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-secondary max-sm:text-[15px] max-sm:leading-relaxed">
          Stories begin in one mind and evolve through many. Continue a thought,
          branch it into alternate timelines, or leave it a little more unfinished —
          every contribution matters.
        </p>
        <div className="flex flex-col items-center gap-2.5 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          <Button to="/explore" size="lg" className="w-full sm:w-auto">
            Continue Someone's Thought
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button to="/write" variant="outline" size="lg" className="w-full sm:w-auto">
            <Feather className="h-4 w-4" />
            Start Your Own
          </Button>
        </div>
      </div>
    </section>
  );
}

function TrendingWordsSection({ words }: { words: BeautifulWord[] | undefined }) {
  return (
    <section className="rounded-[28px] border border-accent/25 bg-gradient-to-br from-accent/15 via-card to-gold/5 p-7 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
          Trending words
        </p>
        <Link
          to="/words"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          Browse the vault <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-4 text-sm text-secondary leading-relaxed max-w-xl">
        Words the library is leaning into this week — carry one into your next branch.
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {words?.map((w) => (
          <div
            key={w.id}
          >
            <Link
              to={`/words/${w.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:border-accent/40 hover:bg-accent/5 hover:-translate-y-0.5"
            >
              <Feather className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
              {w.term}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function WeeklyPromptCard() {
  if (!WEEKLY_PROMPT.title) return null;
  return (
    <div
      className="group relative overflow-hidden rounded-[28px] border border-border bg-card p-7 sm:p-9 flex flex-col justify-between gap-8 min-h-[260px] sm:min-h-[320px] transition-shadow duration-500 hover:shadow-hover"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-gold" />
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">
            Weekly Prompt
          </p>
        </div>
        <h3 className="font-display text-4xl tracking-[-0.03em] leading-tight">
          {WEEKLY_PROMPT.title}
        </h3>
        <p className="text-secondary leading-relaxed">{WEEKLY_PROMPT.prompt}</p>
        <p className="text-[15px] text-primary/80 leading-relaxed italic">
          {WEEKLY_PROMPT.detail}
        </p>
      </div>
      <div>
        <Button to="/challenges">
          Join the prompt <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function RelayCard() {
  if (!RELAY.storyId) return null;
  const current = authorById(RELAY.current);
  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-primary bg-primary p-7 sm:p-9 flex flex-col justify-between gap-8 min-h-[260px] sm:min-h-[320px] text-background"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">
            Relay Story
          </p>
        </div>
        <h3 className="font-display text-4xl tracking-[-0.03em] leading-tight">The Exchange</h3>
        <p className="text-background/70 leading-relaxed">
          Twenty hours, nineteen hands, one story. Hand {RELAY.hand} of {RELAY.hands} is with{" "}
          <span className="text-background font-semibold">{current?.penName ?? "another writer"}</span> now.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="grid h-8 w-8 place-items-center rounded-full border border-background/20 bg-background/10 text-[10px] font-bold backdrop-blur"
              >
                {String.fromCharCode(65 + i)}
              </span>
            ))}
          </div>
          <span className="text-sm text-background/70">
            {RELAY.hoursRemaining} hours left this hand
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/15">
          <div
            className="h-full rounded-full bg-gold transition-all duration-700"
            style={{ width: `${(RELAY.hand / RELAY.hands) * 100}%` }}
          />
        </div>
        <Link
          to={`/stories/the-exchange`}
          className="inline-flex items-center gap-2 rounded-full bg-background text-primary px-6 py-3 text-sm font-semibold transition hover:scale-[1.03] active:scale-95 w-fit"
        >
          Read the relay <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
