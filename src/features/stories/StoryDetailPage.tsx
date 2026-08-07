import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Download,
  MessageSquareHeart,
  Quote,
  Star,
  Users,
  ArrowLeft,
  Sparkles,
  Send,
} from "lucide-react";
import { getStoryBySlug, getStories, publishStory } from "@/services/stories";
import { getBranches } from "@/services/continuations";
import { getCritiques, getCritiqueStats, CRITIQUE_DIMENSIONS } from "@/services/critiques";
import { wordById, authorById } from "@/services/mock";
import { StoryFeedSidebar } from "@/components/story/StoryFeedSidebar";
import { GenomePanel } from "@/components/story/GenomePanel";
import { WorkspaceSplit } from "@/components/story/WorkspaceSplit";
import { ContributionPanel, type ContributionPanelHandle } from "@/components/story/ContributionPanel";
import { BranchTree } from "@/components/story/BranchTree";
import { ThoughtsPanel } from "@/components/story/ThoughtsPanel";
import { CritiqueCard } from "@/components/critique/CritiqueCard";
import { CritiqueForm } from "@/components/critique/CritiqueForm";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Markdown } from "@/lib/markdown";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/cn";
import type { BranchNode, Critique, Story } from "@/types";

const READING_TABS = [
  { id: "story", label: "Story" },
  { id: "tree", label: "Tree" },
  { id: "thoughts", label: "Thoughts" },
  { id: "critique", label: "Critique" },
];

function penNameFor(authorId: string): string {
  const fromMock = authorById(authorId)?.penName;
  if (fromMock) return fromMock;
  const current = useUserStore.getState().user;
  if (current && current.id === authorId) return current.penName;
  return authorId === "me" ? "Guest" : "a quiet author";
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Y";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function avatarFor(authorId: string): string {
  const fromMock = authorById(authorId)?.avatar;
  if (fromMock) return fromMock;
  const current = useUserStore.getState().user;
  if (current && current.id === authorId) return current.avatar || initials(current.penName);
  return "?";
}

export default function StoryDetailPage() {
  const { slug = "" } = useParams();
  const addRecentlyViewed = useUIStore((s) => s.addRecentlyViewed);

  const storyQuery = useQuery({
    queryKey: ["story", "slug", slug],
    queryFn: () => getStoryBySlug(slug),
  });
  const story = storyQuery.data;

  const branchesQuery = useQuery({
    queryKey: ["branches", story?.id],
    queryFn: () => getBranches(story!.id),
    enabled: Boolean(story),
  });
  const critiquesQuery = useQuery({
    queryKey: ["critiques", story?.id],
    queryFn: () => getCritiques(story!.id),
    enabled: Boolean(story),
  });

  useEffect(() => {
    if (story) addRecentlyViewed(story.id);
  }, [story, addRecentlyViewed]);

  if (storyQuery.isLoading) return <DetailSkeleton />;
  if (!story) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-secondary">
        This story has wandered off. It may still be waiting for its continuation.
      </div>
    );
  }

  const branches = branchesQuery.data ?? [];
  const critiques = critiquesQuery.data ?? [];

  return (
    <>
      <div className="hidden lg:block lg:-mx-10 lg:-mt-10 lg:h-[calc(100vh-88px)]">
        <DesktopWorkspace
          story={story}
          branches={branches}
          critiques={critiques}
        />
      </div>

      <div className="lg:hidden space-y-10">
        <MobileView story={story} branches={branches} critiques={critiques} />
      </div>
    </>
  );
}

/* ------------------------- desktop workspace ------------------------- */

function DesktopWorkspace({
  story,
  branches,
  critiques,
}: {
  story: Story;
  branches: BranchNode[];
  critiques: Critique[];
}) {
  const contributionRef = useRef<ContributionPanelHandle>(null);
  const navigate = useNavigate();

  const onPublished = (node: BranchNode) => {
    navigate(`?branch=${node.id}#tree`);
    window.setTimeout(() => {
      document.querySelector('[data-tree-tab]')?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    }, 50);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="hidden xl:flex w-[320px] shrink-0 flex-col border-r border-border overflow-y-auto bg-background/40">
        <StoryFeedSidebar activeSlug={story.slug} />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <WorkspaceSplit
          rightLabel="Contribution"
          left={
            <ReadingPane
              story={story}
              branches={branches}
              critiques={critiques}
              onReference={(quote) =>
                contributionRef.current?.addReference(
                  quote,
                  `${story.title} — the seed`,
                  null,
                )
              }
            />
          }
          right={<ContributionPanel ref={contributionRef} story={story} branches={branches} onPublished={onPublished} />}
        />
      </main>

      <aside className="hidden xl:flex w-[280px] shrink-0 flex-col border-l border-border overflow-y-auto bg-background/40">
        <GenomePanel story={story} />
      </aside>
    </div>
  );
}

/* ------------------------- publish seed button ------------------------- */

function PublishSeedButton({ story }: { story: Story }) {
  const me = useUserStore((s) => s.user?.id) ?? "me";
  const queryClient = useQueryClient();
  const { data: allStories } = useQuery({
    queryKey: ["stories"],
    queryFn: getStories,
  });
  const publish = useMutation({
    mutationFn: () => publishStory(story.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["saved-stories"] });
      queryClient.invalidateQueries({ queryKey: ["story", "slug", story.slug] });
      queryClient.invalidateQueries({ queryKey: ["story", story.id] });
    },
  });

  const isOwner = story.seedAuthorId === me;
  const isPublished = allStories?.some((s) => s.id === story.id) ?? false;
  if (isPublished || !isOwner) return null;

  return (
    <button
      type="button"
      onClick={() => publish.mutate()}
      disabled={publish.isPending}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 text-[13px] font-semibold text-gold transition hover:bg-gold/20 disabled:opacity-60"
    >
      <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
      {publish.isPending ? "Publishing…" : "Publish to library"}
    </button>
  );
}

/* ------------------------- reading pane ------------------------- */

function ReadingPane({
  story,
  branches,
  critiques,
  onReference,
}: {
  story: Story;
  branches: BranchNode[];
  critiques: Critique[];
  onReference: (quote: string) => void;
}) {
  const [tab, setTab] = useState("story");
  const [bookmarked, setBookmarked] = useState(false);
  const [refBtn, setRefBtn] = useState<{ x: number; y: number } | null>(null);
  const [pendingQuote, setPendingQuote] = useState("");
  const [thoughtQuote, setThoughtQuote] = useState("");
  const [quoteVersion, setQuoteVersion] = useState(0);
  const proseRef = useRef<HTMLDivElement>(null);

  const handleSelect = () => {
    const sel = window.getSelection();
    if (
      !sel ||
      sel.isCollapsed ||
      sel.rangeCount === 0 ||
      !proseRef.current?.contains(sel.anchorNode)
    ) {
      setRefBtn(null);
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      setRefBtn(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const container = proseRef.current.getBoundingClientRect();
    setPendingQuote(text.slice(0, 220));
    setRefBtn({
      x: rect.left - container.left + rect.width / 2,
      y: Math.max(0, rect.top - container.top),
    });
  };

  useEffect(() => {
    const onPointerUp = () => handleSelect();
    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("touchend", onPointerUp);
    return () => {
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("touchend", onPointerUp);
    };
  }, []);

  const referenceIt = () => {
    onReference(pendingQuote);
    setRefBtn(null);
    window.getSelection()?.removeAllRanges();
  };

  const addThoughtHere = () => {
    setThoughtQuote(pendingQuote);
    setQuoteVersion((v) => v + 1);
    setRefBtn(null);
    setTab("thoughts");
    window.getSelection()?.removeAllRanges();
    window.setTimeout(() => {
      document
        .getElementById("thought-composer")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  const counts = {
    story: undefined,
    tree: branches.length,
    thoughts: undefined,
    critique: critiques.length,
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/explore"
            aria-label="Back to explore"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-secondary transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="font-display text-2xl tracking-[-0.02em] leading-none truncate">
            {story.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PublishSeedButton story={story} />
          <button
            type="button"
            onClick={() => setBookmarked((b) => !b)}
            aria-pressed={bookmarked}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-secondary transition hover:text-primary"
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current text-gold" : ""}`} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => void import("@/lib/pdf").then((m) => m.exportStoryPdf(story, branches))}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-secondary transition hover:text-primary"
            aria-label="Export story PDF"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div ref={proseRef} className="relative mx-auto max-w-3xl px-8 py-10 space-y-10">
          <header className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {story.genres.map((g) => (
                <span key={g} className="rounded-full border border-border bg-card px-3.5 py-1 text-[12px] font-medium text-secondary">
                  {g}
                </span>
              ))}
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[12px] font-medium text-gold">
                {story.status}
              </span>
            </div>

            <h1 className="font-display text-[3.4rem] leading-[0.95] tracking-[-0.04em] max-w-2xl">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {story.contributorIds.slice(0, 4).map((id) => (
                    <Avatar key={id} text={avatarFor(id)} size="sm" className="ring-2 ring-background" />
                  ))}
                </div>
                <p className="text-sm text-secondary max-w-[260px] leading-snug">
                  {story.contributorIds.slice(0, 3).map((id) => penNameFor(id)).filter((n) => n !== "a quiet author").join(", ")}
                  {story.contributorIds.length > 3 && ` +${story.contributorIds.length - 3} more`}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-secondary">
                <Users className="h-4 w-4" strokeWidth={1.75} />
                {story.words.toLocaleString()} words
              </span>
              <span className="text-sm text-secondary">{story.readingMinutes} min read</span>
            </div>

            {story.cover && (
              <div className="relative h-64 overflow-hidden rounded-[30px] border border-border">
                <img src={story.cover} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </header>

          <Tabs
            items={READING_TABS.map((t) => ({ ...t, count: counts[t.id as keyof typeof counts] }))}
            active={tab}
            onChange={setTab}
          />

          {tab === "story" && (
            <div className="space-y-8">
              <div className="prose-story">
                <Markdown text={story.body} />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {story.beautifulWords.map((bw) => {
                  const word = wordById(bw.wordId);
                  if (!word) return null;
                  return (
                    <span
                      key={bw.wordId}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-[13px]"
                    >
                      {word.term}
                      {bw.count > 1 && <span className="opacity-60"> ×{bw.count}</span>}
                    </span>
                  );
                })}
              </div>
              <p className="text-[13px] text-secondary/80 italic">
                Seeded by {penNameFor(story.seedAuthorId)} · {story.createdAt} · waiting for its next sentence.
              </p>
            </div>
          )}

          {tab === "tree" && (
            <div data-tree-tab>
              <BranchTree story={story} nodes={branches} />
            </div>
          )}

          {tab === "thoughts" && (
            <ThoughtsPanel
              storyId={story.id}
              initialQuote={thoughtQuote}
              quoteVersion={quoteVersion}
            />
          )}

          {tab === "critique" && (
            <CritiqueTab storyId={story.id} critiques={critiques} />
          )}

          <div className="flex items-center gap-3 rounded-3xl border border-gold/25 bg-gold/5 p-6">
            <Sparkles className="h-5 w-5 shrink-0 text-gold" />
            <p className="text-sm text-secondary leading-relaxed">
              Select any sentence, then press <strong className="text-primary">Reference this passage</strong> to
              carry it into your continuation as a citation.
            </p>
          </div>
        </div>
      </div>

      {refBtn && (
        <div
          className="absolute z-30 flex -translate-x-1/2 gap-2"
          style={{ left: refBtn.x, top: refBtn.y - 44 }}
        >
          <button
            type="button"
            onClick={addThoughtHere}
            className="rounded-full border border-gold/40 bg-background px-5 py-2.5 text-[13px] font-semibold text-gold shadow-hover transition hover:scale-[1.03]"
          >
            <span className="inline-flex items-center gap-2">
              <MessageSquareHeart className="h-3.5 w-3.5" /> Add a thought
            </span>
          </button>
          <button
            type="button"
            onClick={referenceIt}
            className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-background shadow-hover transition hover:scale-[1.03]"
          >
            <span className="inline-flex items-center gap-2">
              <Quote className="h-3.5 w-3.5" /> Reference this passage
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------- critique tab ------------------------- */

function CritiqueTab({ storyId, critiques }: { storyId: string; critiques: Critique[] }) {
  const { data: stats } = useQuery({
    queryKey: ["critiques", storyId, "stats"],
    queryFn: () => getCritiqueStats(storyId),
  });

  return (
    <div className="space-y-8">
      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 rounded-3xl border border-border bg-card p-7">
          {CRITIQUE_DIMENSIONS.map((d) => (
            <div key={d.key} className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">{d.label}</p>
              <Stars value={stats[d.key]} />
            </div>
          ))}
        </div>
      )}

      <CritiqueForm storyId={storyId} />

      <div className="space-y-6">
        {critiques.map((c, i) => (
          <CritiqueCard key={c.id} critique={c} index={i} />
        ))}
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            n <= Math.round(value) ? "fill-gold text-gold" : "text-border",
          )}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/* ------------------------- mobile view ------------------------- */

function MobileView({
  story,
  branches,
  critiques,
}: {
  story: Story;
  branches: BranchNode[];
  critiques: Critique[];
}) {
  const [tab, setTab] = useState("story");
  const navigate = useNavigate();

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {story.genres.map((g) => (
            <span key={g} className="rounded-full border border-border bg-card px-3.5 py-1 text-[12px] font-medium text-secondary">
              {g}
            </span>
          ))}
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[12px] font-medium text-gold">
            {story.status}
          </span>
        </div>
        <h1 className="font-display text-[3rem] leading-[0.95] tracking-[-0.04em]">
          {story.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex -space-x-3">
            {story.contributorIds.slice(0, 3).map((id) => (
              <Avatar key={id} text={avatarFor(id)} size="sm" className="ring-2 ring-background" />
            ))}
          </div>
          <p className="text-sm text-secondary">
            {story.contributorIds.slice(0, 2).map((id) => penNameFor(id)).filter((n) => n !== "a quiet author").join(", ")}
          </p>
          <span className="text-sm text-secondary">{story.words.toLocaleString()} words</span>
        </div>
        {story.cover && (
          <div className="relative h-56 overflow-hidden rounded-[28px] border border-border">
            <img src={story.cover} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => navigate(`/stories/${story.slug}/continue`)} className="flex-1">
          <Sparkles className="h-4 w-4" /> Continue
        </Button>
        <Button variant="outline" onClick={() => navigate(`/stories/${story.slug}/critique`)}>
          Critique
        </Button>
        <PublishSeedButton story={story} />
      </div>

      <Tabs
        items={[
          { id: "story", label: "Story" },
          { id: "tree", label: "Tree", count: branches.length },
          { id: "thoughts", label: "Thoughts" },
          { id: "critique", label: "Critique", count: critiques.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "story" && (
        <div className="space-y-6">
          <div className="prose-story">
            <Markdown text={story.body} />
          </div>
          <div className="flex flex-wrap gap-2">
            {story.beautifulWords.map((bw) => {
              const word = wordById(bw.wordId);
              if (!word) return null;
              return (
                <span key={bw.wordId} className="rounded-full border border-border bg-card px-4 py-2 text-[13px]">
                  {word.term}
                </span>
              );
            })}
          </div>
        </div>
      )}
      {tab === "tree" && <BranchTree story={story} nodes={branches} />}
      {tab === "thoughts" && <ThoughtsPanel storyId={story.id} />}
      {tab === "critique" && (
        <div className="space-y-6">
          <CritiqueForm storyId={story.id} />
          {critiques.map((c, i) => (
            <CritiqueCard key={c.id} critique={c} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------- skeleton ------------------------- */

function DetailSkeleton() {
  return (
    <div className="flex h-[calc(100vh-88px)] gap-0">
      <div className="hidden xl:block w-[320px] shrink-0 border-r border-border space-y-5 p-6">
        <Skeleton className="h-10 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[150px] rounded-3xl" />
        ))}
      </div>
      <div className="flex-1 min-w-0 p-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 rounded-[30px]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
      <div className="hidden xl:block w-[280px] shrink-0 border-l border-border space-y-5 p-6">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    </div>
  );
}
