import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { globalSearch } from "@/services/search";
import { useDebounce } from "@/hooks/useDebounce";
import { StoryCard } from "@/components/story/StoryCard";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debounced = useDebounce(query.trim(), 250);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => globalSearch(debounced),
    enabled: debounced.length > 0,
  });

  const updateQuery = (value: string) => {
    setQuery(value);
    if (value.trim()) setParams({ q: value.trim() }, { replace: true });
  };

  const total = data
    ? data.stories.length + data.authors.length + data.words.length + data.collections.length +
      data.anthologies.length + data.challenges.length + data.communities.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-10"
    >
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">Search</p>
        <h1 className="font-display text-[3.5rem] leading-[0.95] tracking-[-0.05em] max-sm:text-[2.5rem]">
          Find the story, word, or writer you're looking for
        </h1>
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary/60" />
          <input
            type="search"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Stories, authors, words, collections…"
            aria-label="Global search"
            className="h-16 w-full rounded-full bg-white dark:bg-card border border-border pl-14 pr-6 text-[16px] shadow-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[28px]" />
          ))}
        </div>
      ) : debounced.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8" strokeWidth={1.25} />}
          title="Start with a word"
          description="Search the whole library — stories, writers, beautiful words, collections, anthologies, challenges, and communities."
        />
      ) : total === 0 ? (
        <EmptyState
          title="Nothing matched"
          description={`No results for “${debounced}”. Try a beautiful word instead — the vault is full of them.`}
        />
      ) : (
        <div className="space-y-14">
          {data!.stories.length > 0 && (
            <section className="space-y-6">
              <GroupLabel>Stories</GroupLabel>
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {data!.stories.map((s, i) => (
                  <StoryCard key={s.id} story={s} index={i} />
                ))}
              </div>
            </section>
          )}

          {data!.authors.length > 0 && (
            <section className="space-y-6">
              <GroupLabel>Writers</GroupLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {data!.authors.map((a) => (
                  <Link
                    key={a.id}
                    to={a.id === "me" ? "/profile" : `/profile?author=${a.id}`}
                    className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <Avatar text={a.avatar} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{a.penName}</p>
                      <p className="text-[13px] text-secondary truncate">
                        {a.genres.slice(0, 2).join(" · ") || "Writer"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {data!.words.length > 0 && (
            <section className="space-y-6">
              <GroupLabel>Words</GroupLabel>
              <div className="flex flex-wrap gap-3">
                {data!.words.map((w) => (
                  <Link
                    key={w.id}
                    to={`/words/${w.id}`}
                    className="rounded-full border border-border bg-card px-5 py-3 text-[15px] font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-background hover:border-primary"
                  >
                    {w.term}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <MiniGrid
            label="Collections"
            items={data!.collections.map((c) => ({
              id: c.id,
              title: c.title,
              meta: `${c.storyIds.length} stories${c.isCommunity ? " · community" : ""}`,
              to: "/collections",
            }))}
          />
          <MiniGrid
            label="Anthologies"
            items={data!.anthologies.map((a) => ({
              id: a.id,
              title: a.title,
              meta: a.season,
              to: `/anthologies/${a.id}`,
            }))}
          />
          <MiniGrid
            label="Challenges"
            items={data!.challenges.map((c) => ({
              id: c.id,
              title: c.title,
              meta: c.kind,
              to: `/challenges/${c.id}`,
            }))}
          />
          <MiniGrid
            label="Communities"
            items={data!.communities.map((c) => ({
              id: c.id,
              title: c.name,
              meta: `${c.memberCount.toLocaleString()} members`,
              to: `/communities/${c.id}`,
            }))}
          />
        </div>
      )}
    </motion.div>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">{children}</p>
  );
}

function MiniGrid({ label, items }: { label: string; items: { id: string; title: string; meta: string; to: string }[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-6">
      <GroupLabel>{label}</GroupLabel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className="rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
          >
            <p className="font-display text-2xl tracking-[-0.02em] leading-tight">{item.title}</p>
            <p className="text-[13px] text-secondary mt-2">{item.meta}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
