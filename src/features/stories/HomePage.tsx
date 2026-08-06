import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Feather, Timer, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getHomeFeed } from "@/services/stories";
import { getTrendingWords } from "@/services/words";
import { WEEKLY_PROMPT, RELAY, authorById } from "@/services/mock";
import { StoryCard } from "@/components/story/StoryCard";
import { SectionHeading } from "@/components/common/SectionHeading";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-24 max-sm:space-y-16"
    >
      <Hero />

      <section>
        <SectionHeading
          eyebrow="The library is alive"
          title="Continue Waiting"
          subtitle="Stories that began in one mind and are ready for another. Someone has left the lamp on for you."
          action={
            <Button to="/explore" variant="outline" className="shrink-0">
              Explore the library <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-[28px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {feed?.waiting.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[34px] border border-border bg-surface p-10 sm:p-16 space-y-10">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold mb-3">
              Trending Words
            </p>
            <h2 className="font-display text-[42px] leading-none tracking-[-0.04em] max-sm:text-[34px]">
              Words the stories keep returning to
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {trending?.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/words/${w.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-[15px] font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-background hover:border-primary hover:-translate-y-0.5"
              >
                <Feather className="h-4 w-4 text-gold" strokeWidth={1.75} />
                {w.term}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <WeeklyPromptCard />
        <RelayCard />
      </section>

      <section>
        <SectionHeading
          eyebrow="From the editors"
          title="Community Picks"
          subtitle="Stories the community has quietly lifted up this month."
        />
        {feed?.picks.map((story, i) => (
          <StoryCard key={story.id} story={story} index={i} className="mb-8" />
        ))}
      </section>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[42px] border border-border bg-surface px-8 py-20 sm:px-16 sm:py-28 max-sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(1200px 400px at 80% -10%, rgba(184,155,103,0.14), transparent 60%), radial-gradient(900px 400px at 0% 110%, rgba(95,115,132,0.12), transparent 60%)",
        }}
      />
      <div className="relative max-w-3xl space-y-10">
        <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
          Sprinter — a collaborative writing salon
        </p>
        <h1 className="font-display text-[4.5rem] leading-[0.92] tracking-[-0.05em] max-lg:text-[3.5rem] max-sm:text-[2.9rem]">
          Someone is always waiting for your <em className="text-accent">next sentence</em>.
        </h1>
        <p className="text-secondary text-lg leading-relaxed max-w-xl">
          Stories begin in one mind and evolve through many. Continue a thought,
          branch it into alternate timelines, or leave it a little more unfinished —
          every contribution matters.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button to="/explore" size="lg">
            Continue Someone's Thought
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button to="/write" variant="outline" size="lg">
            <Feather className="h-4 w-4" />
            Start Your Own
          </Button>
          <Button to="/words" variant="ghost" size="lg">
            Browse the Word Vault
          </Button>
        </div>
      </div>
    </section>
  );
}

function WeeklyPromptCard() {
  if (!WEEKLY_PROMPT.title) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[34px] border border-border bg-card p-10 flex flex-col justify-between gap-8 min-h-[320px] transition-shadow duration-500 hover:shadow-hover"
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
    </motion.div>
  );
}

function RelayCard() {
  if (!RELAY.storyId) return null;
  const current = authorById(RELAY.current);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[34px] border border-border bg-primary p-10 flex flex-col justify-between gap-8 min-h-[320px] text-background"
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
    </motion.div>
  );
}
