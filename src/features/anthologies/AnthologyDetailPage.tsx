import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Download, BookOpen, Feather } from "lucide-react";
import { getAnthology, getAnthologyStories } from "@/services/anthologies";
import { getBranches } from "@/services/continuations";
import { getCritiques } from "@/services/critiques";
import { exportAnthologyPdf } from "@/lib/pdf";
import { StoryCard } from "@/components/story/StoryCard";
import { CritiqueCard } from "@/components/critique/CritiqueCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import type { BranchNode, Story } from "@/types";

export default function AnthologyDetailPage() {
  const { anthologyId = "" } = useParams();
  const [reading, setReading] = useState(false);

  const anthologyQuery = useQuery({
    queryKey: ["anthology", anthologyId],
    queryFn: () => getAnthology(anthologyId),
  });
  const anthology = anthologyQuery.data;

  const storiesQuery = useQuery({
    queryKey: ["anthology", anthologyId, "stories"],
    queryFn: () => getAnthologyStories(anthology?.storyIds ?? []),
    enabled: Boolean(anthology),
  });
  const stories = storiesQuery.data ?? [];

  const branchesQuery = useQuery({
    queryKey: ["anthology", anthologyId, "branches", stories.map((s) => s.id)],
    queryFn: async () => {
      const all = await Promise.all(stories.map((s) => getBranches(s.id)));
      return all.flat();
    },
    enabled: stories.length > 0,
  });

  const critiquesQuery = useQuery({
    queryKey: ["anthology", anthologyId, "critiques"],
    queryFn: async () => {
      const all = await Promise.all(stories.map((s) => getCritiques(s.id)));
      return all.flat().filter((c) => c.isEditorial);
    },
    enabled: stories.length > 0,
  });

  const featured = useMemo(
    () => stories.filter((s) => anthology?.featuredStoryIds.includes(s.id)),
    [stories, anthology],
  );

  if (anthologyQuery.isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!anthology) {
    return <div className="min-h-[50vh] text-secondary">This anthology is out of print.</div>;
  }

  const allNodes = branchesQuery.data ?? [];
  const topCritiques = critiquesQuery.data ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-14"
    >
      <Link
        to="/anthologies"
        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All anthologies
      </Link>

      <header className="relative overflow-hidden rounded-[42px] border border-border bg-surface">
        <div className="grid lg:grid-cols-[320px_1fr]">
          <div className="relative h-64 lg:h-full">
            <img src={anthology.cover} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="p-10 sm:p-14 space-y-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                {anthology.season}
              </span>
              <span className="rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {anthology.storyIds.length} stories
              </span>
            </div>
            <h1 className="font-display text-[4rem] leading-[0.95] tracking-[-0.05em] max-sm:text-[2.8rem]">
              {anthology.title}
            </h1>
            <p className="text-lg text-primary/85 leading-relaxed max-w-2xl">
              {anthology.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setReading(true)} size="lg">
                <BookOpen className="h-4 w-4" /> Reading mode
              </Button>
              <Button
                variant="outline"
                onClick={() => exportAnthologyPdf(anthology.title, anthology.season, stories, allNodes)}
              >
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {reading && (
        <ReadingMode
          title={anthology.title}
          stories={stories}
          nodes={allNodes}
          onClose={() => setReading(false)}
        />
      )}

      {featured.length > 0 && (
        <section className="space-y-8">
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">
            Featured by the editors
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            {featured.map((s, i) => (
              <StoryCard key={s.id} story={s} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-8">
        <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
          All stories in this volume
        </p>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((s, i) => (
            <StoryCard key={s.id} story={s} index={i} />
          ))}
        </div>
      </section>

      {topCritiques.length > 0 && (
        <section className="space-y-8">
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
            The best critiques of the season
          </p>
          <div className="space-y-6">
            {topCritiques.map((c, i) => (
              <CritiqueCard key={c.id} critique={c} index={i} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function ReadingMode({
  title,
  stories,
  nodes,
  onClose,
}: {
  title: string;
  stories: Story[];
  nodes: BranchNode[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const story = stories[index];
  const storyNodes = nodes.filter((n) => n.storyId === story?.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-background overflow-y-auto"
      role="dialog"
      aria-label={`Reading mode: ${title}`}
    >
      <div className="max-w-2xl mx-auto px-6 py-14 space-y-12">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-secondary transition hover:text-primary"
          >
            ← Exit reading
          </button>
          <p className="text-sm text-secondary">
            {title} · {index + 1} of {stories.length}
          </p>
        </div>

        <motion.article
          key={story?.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-10"
        >
          <header className="space-y-4 text-center">
            <p className="font-display italic text-secondary">{story.genres.join(" · ")}</p>
            <h2 className="font-display text-5xl tracking-[-0.05em] leading-[1.05]">{story.title}</h2>
            <div className="h-px w-16 mx-auto bg-gold" />
          </header>
          <div className="prose-story text-center">
            <p className="whitespace-pre-line">{story.body}</p>
          </div>
          {storyNodes.map((n) => (
            <div key={n.id} className="space-y-4 border-t border-border pt-8">
              <p className="font-display text-2xl tracking-[-0.02em]">{n.title}</p>
              <p className="whitespace-pre-line text-primary/85 leading-[1.9]">{n.body}</p>
            </div>
          ))}
        </motion.article>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            Previous
          </Button>
          {index < stories.length - 1 ? (
            <Button onClick={() => setIndex((i) => i + 1)}>Next story</Button>
          ) : (
            <Button onClick={onClose}>
              <Feather className="h-4 w-4" /> Finish reading
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
