import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  Search,
  X,
  BookOpen,
  Feather,
  MessageSquareHeart,
  Users,
  ListMusic,
} from "lucide-react";
import { EMPTY_FILTERS, getStoriesByFilter, type StoryFilters, type SortKey } from "@/services/stories";
import { getVault } from "@/services/words";
import { getAnthologies } from "@/services/anthologies";
import { getCommunities } from "@/services/communities";
import { getAllThoughts } from "@/services/thoughts";
import { authorById } from "@/services/mock";
import type { Emotion, Genre, Perspective, Theme, CompletionStatus, BeautifulWord, Anthology, Community, Thought } from "@/types";
import { StoryCard } from "@/components/story/StoryCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
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

const TAB_ITEMS = [
  { id: "stories", label: "Stories" },
  { id: "words", label: "Words" },
  { id: "anthologies", label: "Anthologies" },
  { id: "communities", label: "Communities" },
  { id: "thoughts", label: "Thoughts" },
  { id: "motifs", label: "Motifs & Themes" },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function ExplorePage() {
  const [tab, setTab] = useState("stories");
  const [themeFilter, setThemeFilter] = useState<Theme[]>([]);

  const openTheme = (theme: Theme) => {
    setThemeFilter([theme]);
    setTab("stories");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="The library"
          title="Explore"
          subtitle="Everything waiting to be discovered — stories, beautiful words, anthologies, writing circles, margin thoughts, and the motifs that stitch them together."
          className="mb-0"
        />
      </div>

      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <Tabs items={TAB_ITEMS} active={tab} onChange={setTab} className="whitespace-nowrap" />
      </div>

      <div className="space-y-12">
        {tab === "stories" && <StoriesView themeFilter={themeFilter} />}
        {tab === "words" && <WordsView />}
        {tab === "anthologies" && <AnthologiesView />}
        {tab === "communities" && <CommunitiesView />}
        {tab === "thoughts" && <ThoughtsView />}
        {tab === "motifs" && <MotifsThemesView onOpenTheme={openTheme} />}
      </div>
    </motion.div>
  );
}

function StoriesView({ themeFilter }: { themeFilter: Theme[] }) {
  const [filters, setFilters] = useState<StoryFilters>({ ...EMPTY_FILTERS });
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query.trim().toLowerCase(), 300);

  const applied = { ...filters, themes: [...new Set([...filters.themes, ...themeFilter])], query: debouncedQuery };

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
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-8">
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

        <div className="flex flex-wrap items-center justify-between gap-4 w-full lg:w-auto">
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

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm text-secondary hidden sm:inline">Sort by</span>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, sort: s.key }))}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors",
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
    </div>
  );
}

function WordsView() {
  const { data: words, isLoading } = useQuery({ queryKey: ["vault"], queryFn: getVault });
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim().toLowerCase(), 200);

  const filtered = (words ?? []).filter(
    (w) => w.term.toLowerCase().includes(debounced) || w.meaning.toLowerCase().includes(debounced),
  );

  return (
    <div className="space-y-8">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/70" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the vault…"
          aria-label="Search words"
          className="h-14 w-full rounded-full bg-white dark:bg-card border border-border pl-11 pr-5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-[28px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Feather className="h-8 w-8" strokeWidth={1.25} />}
          title="No words found"
          description="This word hasn't found its way into the vault yet. It may be waiting to be carried by your next sentence."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((w, i) => (
            <WordCard key={w.id} word={w} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function WordCard({ word, index }: { word: BeautifulWord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/words/${word.id}`}
        className="group flex h-full flex-col justify-between rounded-[28px] border border-border/70 bg-card p-7 space-y-6 shadow-card transition-all duration-500 ease-[var(--ease-fluid)] hover:-translate-y-1 hover:shadow-hover"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-4xl tracking-[-0.02em] leading-none">
              {word.term}
            </h3>
            <span className="shrink-0 rounded-full bg-gold/10 text-gold border border-gold/30 px-3 py-1 text-[11px] font-bold">
              {word.popularity}
            </span>
          </div>
          <p className="text-sm text-secondary leading-relaxed">{word.meaning}</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-secondary mb-1.5">
              <span>Beloved by the community</span>
              <span>{word.usageCount} uses</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-all duration-700"
                style={{ width: `${word.popularity}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[13px] text-secondary">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> {word.usageCount} stories
            </span>
            <span className="flex items-center gap-1.5">
              <Feather className="h-3.5 w-3.5" /> {word.contributors} hands
            </span>
            <span className="text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
              Open →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function AnthologiesView() {
  const { data: anthologies, isLoading } = useQuery({ queryKey: ["anthologies"], queryFn: getAnthologies });

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-[34px]" />
          ))}
        </div>
      ) : !anthologies?.length ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" strokeWidth={1.25} />}
          title="No anthologies yet"
          description="The editors gather the season's best stories into a single collection. The first one is on its way."
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {anthologies.map((a, i) => (
            <AnthologyCard key={a.id} anthology={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnthologyCard({ anthology, index }: { anthology: Anthology; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-[34px] border border-border/70 bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={anthology.cover}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-6 top-6 rounded-full bg-background/90 backdrop-blur px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
          {anthology.season}
        </span>
      </div>
      <div className="p-8 space-y-5">
        <h3 className="font-display text-[2rem] leading-none tracking-[-0.03em]">
          {anthology.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-secondary line-clamp-3">
          {anthology.description}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            to={`/anthologies/${anthology.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:scale-[1.03] active:scale-95"
          >
            <BookOpen className="h-4 w-4" /> Read
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function CommunitiesView() {
  const { data: communities, isLoading } = useQuery({ queryKey: ["communities"], queryFn: getCommunities });

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-[34px]" />
          ))}
        </div>
      ) : !communities?.length ? (
        <EmptyState
          icon={<Users className="h-8 w-8" strokeWidth={1.25} />}
          title="No writing circles yet"
          description="Circles are small rooms for writers who share a craft. The first ones will gather soon."
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {communities.map((c, i) => (
            <CommunityCard key={c.id} community={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community, index }: { community: Community; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/communities/${community.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[34px] border border-border/70 bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={community.cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-7 space-y-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-[1.9rem] leading-none tracking-[-0.03em]">
              {community.name}
            </h3>
            <span className="flex items-center gap-1.5 text-[13px] text-secondary shrink-0">
              <Users className="h-3.5 w-3.5" /> {community.memberCount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-secondary leading-relaxed line-clamp-3">
            {community.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {community.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-secondary">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex -space-x-3">
              {community.memberIds.slice(0, 4).map((id) => (
                <Avatar key={id} text={authorById(id)?.avatar ?? "?"} size="sm" className="ring-2 ring-card" />
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              Enter <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ThoughtsView() {
  const { data: thoughts, isLoading } = useQuery({ queryKey: ["thoughts", "all"], queryFn: getAllThoughts });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-secondary">
        <MessageSquareHeart className="h-4 w-4 text-gold" />
        Margin notes from readers — grouped here across every story, quieter than comments, closer to the text.
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : !thoughts?.length ? (
        <EmptyState
          icon={<MessageSquareHeart className="h-8 w-8" strokeWidth={1.25} />}
          title="No thoughts yet"
          description="The first margin note is a line, a question, a small observation left beside a story someone is still writing."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {thoughts.map((t, i) => (
            <ThoughtCard key={t.id} thought={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThoughtCard({ thought, index }: { thought: Thought; index: number }) {
  const author = authorById(thought.authorId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="flex gap-4 rounded-3xl border-l-2 border-gold/50 bg-card p-6"
    >
      <Avatar text={author?.avatar ?? "?"} size="sm" className="mt-1" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{author?.penName ?? "A quiet author"}</p>
          <span className="text-[12px] text-secondary">{thought.createdAt}</span>
        </div>
        {thought.quote && (
          <p className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-[13px] italic leading-relaxed text-secondary">
            “{thought.quote}”
          </p>
        )}
        <p className="text-[15px] leading-relaxed text-primary/90">{thought.content}</p>
      </div>
    </motion.div>
  );
}

function MotifsThemesView({ onOpenTheme }: { onOpenTheme: (theme: Theme) => void }) {
  return (
    <div className="space-y-8">
      <p className="text-sm text-secondary leading-relaxed max-w-2xl">
        The strands that tie Sprinter's stories together. Choose a theme to surf every story that carries it.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((theme, i) => (
          <motion.div
            key={theme}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={() => onOpenTheme(theme)}
              className="group flex h-full w-full flex-col gap-2 rounded-[28px] border border-border/70 bg-card p-7 text-left shadow-card transition-all duration-500 ease-[var(--ease-fluid)] hover:-translate-y-1 hover:shadow-hover"
            >
              <ListMusic className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <h3 className="font-display text-2xl tracking-[-0.02em] leading-tight">{theme}</h3>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold text-accent">
                Explore the theme{" "}
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
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
