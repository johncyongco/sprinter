import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Feather, GitFork, MessageSquareHeart, Send, Star, Trash2 } from "lucide-react";
import { getSavedStories, deleteStory } from "@/services/stories";
import { getContributionsByAuthor } from "@/services/continuations";
import { getWrittenLibrary, storyById } from "@/services/mock";
import { useUserStore } from "@/stores/useUserStore";
import type { BranchNode, Critique } from "@/types";
import { StoryCard } from "@/components/story/StoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SavedStoriesPage() {
  const me = useUserStore((s) => s.user?.id) ?? "me";
  const queryClient = useQueryClient();

  const savedQuery = useQuery({
    queryKey: ["saved-stories", me],
    queryFn: getSavedStories,
  });
  const continuationsQuery = useQuery({
    queryKey: ["contributions", me],
    queryFn: () => getContributionsByAuthor(me),
  });
  const writtenQuery = useQuery({
    queryKey: ["written", me],
    queryFn: getWrittenLibrary,
  });

  const remove = useMutation({
    mutationFn: (storyId: string) => deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-stories"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["home", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["written"] });
    },
  });

  const stories = savedQuery.data ?? [];
  const continuations = continuationsQuery.data ?? [];
  const nodes: BranchNode[] = continuations.map((c) => c.node);
  const critiques = writtenQuery.data?.critiques ?? [];

  return (
    <div className="space-y-14">
      <div className="space-y-4">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>
        <div className="space-y-2">
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">
            Saved to your desk
          </p>
          <h1 className="font-display text-[3rem] leading-[0.95] tracking-[-0.04em] max-sm:text-[2.6rem]">
            Your writing
          </h1>
          <p className="text-sm text-secondary leading-relaxed max-w-xl">
            The stories you have begun, the branches you have grown, and the critiques you have
            left — all kept here until you are ready to share.
          </p>
        </div>
      </div>

      <Section title="Your stories" count={stories.length}>
        {savedQuery.isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-[28px]" />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            {stories.map((story, i) => (
              <div
                key={story.id}
                className="group relative mb-5 break-inside-avoid"
              >
                <StoryCard story={story} index={i} />
                <button
                  type="button"
                  onClick={() => remove.mutate(story.id)}
                  disabled={remove.isPending}
                  aria-label={`Delete ${story.title}`}
                  title="Delete this story"
                  className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/85 border border-border text-secondary opacity-0 shadow-card backdrop-blur transition group-hover:opacity-100 hover:text-danger disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Feather className="h-8 w-8" strokeWidth={1.25} />}
            title="No stories yet"
            description="Write a story seed or a free piece — it will gather here, whether saved or published, so you always have your work nearby."
          />
        )}
      </Section>

      <Section title="Continuations" count={nodes.length}>
        {nodes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {continuations.map(({ node, story }) => {
              const target = story ?? storyById(node.storyId);
              return (
                <Link
                  key={node.id}
                  to={target ? `/stories/${target.slug}` : "/profile/stories"}
                  className="group rounded-3xl border border-border bg-card p-6 space-y-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card"
                >
                  <div className="flex items-center gap-2 text-secondary">
                    <GitFork className="h-4 w-4 text-accent" strokeWidth={1.75} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.12em]">{node.type}</span>
                    <span className="text-[12px]">{node.createdAt}</span>
                  </div>
                  <p className="font-display text-2xl tracking-[-0.02em]">{node.title}</p>
                  <p className="text-sm text-secondary leading-relaxed line-clamp-2">{node.body}</p>
                  <p className="text-[13px] text-secondary">
                    in {target?.title ?? "a story"}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<GitFork className="h-8 w-8" strokeWidth={1.25} />}
            title="No continuations yet"
            description="When you grow a branch from another writer's story, it will appear here."
          />
        )}
      </Section>

      <Section title="Critiques" count={critiques.length}>
        {critiques.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {critiques.map((c) => (
              <CritiqueRow key={c.id} critique={c} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<MessageSquareHeart className="h-8 w-8" strokeWidth={1.25} />}
            title="No critiques yet"
            description="When you leave a careful reading on a story, it will be kept here."
          />
        )}
      </Section>

      <div className="flex items-center gap-3 rounded-3xl border border-gold/25 bg-gold/5 p-6">
        <Send className="h-5 w-5 shrink-0 text-gold" />
        <p className="text-sm text-secondary leading-relaxed">
          Publishing sends a story to the Explore library, where others can continue it. Your
          saved writing stays just for you until then.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-3xl tracking-[-0.03em]">{title}</h2>
        <span className="text-sm text-secondary font-semibold">{count}</span>
      </div>
      {children}
    </section>
  );
}

function CritiqueRow({ critique }: { critique: Critique }) {
  const target = storyById(critique.storyId);
  const average =
    Math.round(
      (Object.values(critique.scores).reduce((a, b) => a + b, 0) /
        Object.values(critique.scores).length) *
        10,
    ) / 10;
  const ScoreAvg = () => (
    <span className="flex items-center gap-1 text-[13px] font-semibold text-gold">
      <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {average}/10
    </span>
  );
  return (
    <Link
      key={critique.id}
      to={target ? `/stories/${target.slug}` : "/profile/stories"}
      className="group rounded-3xl border border-border bg-card p-6 space-y-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-secondary">
        <span className="text-[12px]">{critique.createdAt}</span>
        <ScoreAvg />
      </div>
      <p className="text-sm leading-relaxed text-primary/90 line-clamp-3">{critique.reflection}</p>
      <p className="text-[13px] text-secondary">on {target?.title ?? "a story"}</p>
    </Link>
  );
}
