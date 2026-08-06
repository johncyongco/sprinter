import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SlidersHorizontal, Search, X, BookOpen } from "lucide-react";
import { EMPTY_FILTERS, getStoriesByFilter, type StoryFilters, type SortKey } from "@/services/stories";
import type { Emotion, Genre, Perspective, Theme, CompletionStatus } from "@/types";
import { StoryCard } from "@/components/story/StoryCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/cn";

const GENRES: Genre[] = [
  "Literary Fiction", "Fantasy", "Sci-Fi", "Mystery", "Historical Fiction",
  "Poetry", "Romance", "Horror", "Memoir", "Speculative", "Catholic Fiction", "Minimalist",
];

const EMOTIONS: Emotion[] = ["Yearning", "Grief", "Wonder", "Stillness", "Longing", "Mercy", "Dread", "Hope", "Reverence", "Homesickness"];

const THEMES: Theme[] = ["Home", "Memory", "Grace", "Pilgrimage", "Silence", "Becoming", "Thresholds", "Redemption", "The Sea", "Faith", "Letters", "Roots"];

const PERSPECTIVES: Perspective[] = ["First", "Second", "Third", "Epistolary"];

const STATUSES: CompletionStatus[] = ["Seed", "Unfolding", "Nearly Whole", "Complete"];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "mostContinued", label: "Most Continued" },
  { key: "editorial", label: "Editorial Picks" },
  { key: "needsContinuation", label: "Needs Continuation" },
  { key: "longest", label: "Longest" },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function ExplorePage() {
  const [filters, setFilters] = useState<StoryFilters>({ ...EMPTY_FILTERS });
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query.trim().toLowerCase(), 300);

  const applied = { ...filters, query: debouncedQuery };

  const result = useInfiniteQuery({
    queryKey: ["stories", "explore", applied],
    queryFn: ({ pageParam }) => getStoriesByFilter(applied, pageParam, 9),
    initialPageParam: 0,
    getNextPageParam: (last) => last.next,
  });

  const stories = result.data?.pages.flatMap((p) => p.items) ?? [];
  const activeCount =
    filters.genres.length + filters.emotions.length + filters.themes.length +
    filters.perspectives.length + filters.statuses.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading
          eyebrow="The library"
          title="Explore"
          subtitle="Discover stories by genre, emotion, word, theme, or how far along they are. Nothing here scrolls forever — every shelf has a stopping place."
          className="mb-0"
        />
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/70" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories…"
            aria-label="Search stories"
            className="h-14 w-full rounded-full bg-white dark:bg-card border border-border pl-11 pr-5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:border-accent/30"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary hidden sm:inline">Sort by</span>
          <div className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, sort: s.key }))}
                className={cn(
                  "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                  filters.sort === s.key
                    ? "border-primary bg-primary text-background"
                    : "border-border bg-card text-secondary hover:text-primary",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="rounded-[28px] border border-border bg-surface p-8 space-y-8">
            <FilterRow label="Genre" options={GENRES} selected={filters.genres} onToggle={(g) => setFilters((f) => ({ ...f, genres: toggle(f.genres, g as Genre) }))} />
            <FilterRow label="Emotion" options={EMOTIONS} selected={filters.emotions} onToggle={(e) => setFilters((f) => ({ ...f, emotions: toggle(f.emotions, e as Emotion) }))} />
            <FilterRow label="Theme" options={THEMES} selected={filters.themes} onToggle={(t) => setFilters((f) => ({ ...f, themes: toggle(f.themes, t as Theme) }))} />
            <FilterRow label="Perspective" options={PERSPECTIVES} selected={filters.perspectives} onToggle={(p) => setFilters((f) => ({ ...f, perspectives: toggle(f.perspectives, p as Perspective) }))} />
            <FilterRow label="Completion" options={STATUSES} selected={filters.statuses} onToggle={(s) => setFilters((f) => ({ ...f, statuses: toggle(f.statuses, s as CompletionStatus) }))} />
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, genres: [], emotions: [], themes: [], perspectives: [], statuses: [] }))}
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-danger transition-colors"
              >
                <X className="h-4 w-4" /> Clear all filters
              </button>
            )}
          </div>
        </motion.div>
      )}

      {result.isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-[420px] rounded-[28px]" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" strokeWidth={1.25} />}
          title="Nothing here yet"
          description="This shelf is empty — for now. Try clearing a filter or two, or seed a new story yourself."
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>
      )}

      {result.hasNextPage && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => result.fetchNextPage()}
            disabled={result.isFetchingNextPage}
            className="rounded-full bg-primary text-background px-8 py-4 text-sm font-semibold transition hover:scale-[1.03] active:scale-95 disabled:opacity-50"
          >
            {result.isFetchingNextPage ? "Turning the page…" : "Load more stories"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly T[];
  selected: readonly T[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-4">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(opt)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-300",
                active
                  ? "border-primary bg-primary text-background"
                  : "border-border bg-card text-secondary hover:border-primary/40 hover:text-primary",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
