import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Feather, Search, BookOpen } from "lucide-react";
import { getVault } from "@/services/words";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";

export default function WordVaultPage() {
  const { data: words, isLoading } = useQuery({ queryKey: ["vault"], queryFn: getVault });
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim().toLowerCase(), 200);

  const filtered = (words ?? []).filter(
    (w) => w.term.toLowerCase().includes(debounced) || w.meaning.toLowerCase().includes(debounced),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading
          eyebrow="Word Vault"
          title="Beautiful words"
          subtitle="Every contribution can attach a word. Each one carries a meaning, a history, and the stories that keep returning to it."
          className="mb-0"
        />
        <div className="relative w-full lg:w-80">
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
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/words/${w.id}`}
                className="group flex h-full flex-col justify-between rounded-[28px] border border-border/70 bg-card p-7 space-y-6 shadow-card transition-all duration-500 ease-[var(--ease-fluid)] hover:-translate-y-1 hover:shadow-hover"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-4xl tracking-[-0.02em] leading-none">
                      {w.term}
                    </h3>
                    <span className="shrink-0 rounded-full bg-gold/10 text-gold border border-gold/30 px-3 py-1 text-[11px] font-bold">
                      {w.popularity}
                    </span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">{w.meaning}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-secondary mb-1.5">
                      <span>Beloved by the community</span>
                      <span>{w.usageCount} uses</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-all duration-700"
                        style={{ width: `${w.popularity}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[13px] text-secondary">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> {w.usageCount} stories
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Feather className="h-3.5 w-3.5" /> {w.contributors} hands
                    </span>
                    <span className="text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                      Open →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
