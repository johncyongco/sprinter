import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Feather, GitFork, Clock, ArrowRight } from "lucide-react";
import { getStories } from "@/services/stories";
import { getTrendingWords } from "@/services/words";
import { WEEKLY_PROMPT, authorById } from "@/services/mock";
import { cn } from "@/lib/cn";
import type { Story } from "@/types";

type FilterId = "All" | "Waiting" | "Picks";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Waiting", label: "Waiting" },
  { id: "Picks", label: "Picks" },
];

export function StoryFeedSidebar({ activeSlug }: { activeSlug?: string }) {
  const [filter, setFilter] = useState<FilterId>("All");
  const { data: stories } = useQuery({ queryKey: ["stories"], queryFn: getStories });
  const { data: trending } = useQuery({ queryKey: ["vault", "trending"], queryFn: () => getTrendingWords(5) });

  const list = (stories ?? [])
    .filter((s) => {
      if (filter === "Waiting") return s.status !== "Complete";
      if (filter === "Picks") return s.isEditorialPick;
      return true;
    })
    .slice(0, 12);

  return (
    <div className="flex flex-col gap-8 p-5 lg:p-6">
      <div className="space-y-4">
        <p className="font-display text-[26px] tracking-[-0.03em] leading-tight">
          Continue someone's thought
        </p>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors",
                filter === f.id
                  ? "border-primary bg-primary text-background"
                  : "border-border bg-card text-secondary hover:text-primary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {list.map((s, i) => (
          <CompactStoryCard key={s.id} story={s} index={i} active={s.slug === activeSlug} />
        ))}
        {list.length === 0 && (
          <p className="text-sm text-secondary italic">Nothing under this lamp yet.</p>
        )}
      </div>

      {trending && trending.length > 0 && (
        <div className="space-y-3">
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-2">
            <Feather className="h-3.5 w-3.5 text-gold" /> Trending Words
          </p>
          <div className="flex flex-wrap gap-2">
            {trending.map((w) => (
              <Link
                key={w.id}
                to={`/words/${w.id}`}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-primary transition-all duration-300 hover:-translate-y-px hover:border-gold/40"
              >
                {w.term}
              </Link>
            ))}
          </div>
          <Link to="/words" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-primary transition-colors">
            Visit the vault <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="space-y-3 rounded-[28px] border border-gold/25 bg-gold/5 p-6">
        <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">Weekly Prompt</p>
        <p className="font-display text-2xl tracking-[-0.02em] leading-tight">{WEEKLY_PROMPT.title}</p>
        <p className="text-sm text-secondary leading-relaxed">{WEEKLY_PROMPT.detail}</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent hover:text-primary transition-colors"
        >
          Take it up <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function CompactStoryCard({
  story,
  index,
  active,
}: {
  story: Story;
  index: number;
  active: boolean;
}) {
  const author = authorById(story.seedAuthorId);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/stories/${story.slug}`}
        className={cn(
          "group relative flex h-[150px] overflow-hidden rounded-3xl border bg-card transition-all duration-500 ease-[var(--ease-fluid)] hover:-translate-y-0.5 hover:shadow-hover",
          active
            ? "border-gold/50 shadow-card"
            : "border-border/70 shadow-card hover:border-gold/30",
        )}
      >
        <div className="relative w-[116px] shrink-0 overflow-hidden">
          <img
            src={story.cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-fluid)] group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-2 p-5">
          <div className="flex items-center gap-2">
            {story.status !== "Complete" && (
              <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                Waiting
              </span>
            )}
            {story.isEditorialPick && (
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                Pick
              </span>
            )}
          </div>
          <h3 className="font-display text-[19px] leading-[1.15] tracking-[-0.02em] line-clamp-2">
            {story.title}
          </h3>
          <div className="flex items-center gap-2 text-[12px] text-secondary">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
              {author.avatar}
            </span>
            <span className="truncate">{author.penName}</span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-secondary">
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" strokeWidth={1.75} /> {story.continuationCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" strokeWidth={1.75} /> {story.readingMinutes}m
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Continue <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
