import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Feather, Check, Loader2 } from "lucide-react";
import { getStoryBySlug } from "@/services/stories";
import { getBranches, publishContinuation } from "@/services/continuations";
import { authorById } from "@/services/mock";
import type { ContributionType } from "@/types";
import { StoryEditor } from "@/components/story/StoryEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDraftStore } from "@/stores/useDraftStore";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/cn";

const CONTRIBUTION_TYPES: { type: ContributionType; hint: string }[] = [
  { type: "Continue", hint: "Carry the sentence forward" },
  { type: "Dialogue", hint: "Two voices, one table" },
  { type: "Flashback", hint: "What came before" },
  { type: "Character Perspective", hint: "A voice you haven't heard" },
  { type: "Opposing View", hint: "The other side of the room" },
  { type: "World Building", hint: "Widen the map" },
  { type: "Foreshadowing", hint: "A hint of what comes" },
  { type: "Rewrite", hint: "A second draft of a moment" },
  { type: "Different Ending", hint: "What might have been" },
  { type: "Poem", hint: "Say it slant" },
  { type: "Letter", hint: "Write to someone inside the story" },
  { type: "Monologue", hint: "A voice alone in the room" },
];

export default function ContinuePage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const user = useUserStore((s) => s.user);
  const saveDraft = useDraftStore((s) => s.saveDraft);
  const clearDraft = useDraftStore((s) => s.clearDraft);
  const lastSaved = useDraftStore((s) => s.lastSaved);

  const draftKey = story?.id;
  const existingDraft = useDraftStore((s) => (draftKey ? s.drafts[draftKey] : undefined));

  const [type, setType] = useState<ContributionType>("Continue");
  const [parentId, setParentId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [wordIds, setWordIds] = useState<string[]>([]);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (existingDraft) {
      setType(existingDraft.type);
      setParentId(existingDraft.parentId);
      setTitle(existingDraft.title);
      setBody(existingDraft.body);
      setWordIds(existingDraft.wordIds);
    }
  }, [existingDraft]);

  const publish = useMutation({
    mutationFn: () =>
      publishContinuation({
        storyId: story!.id,
        parentId,
        type,
        title,
        body,
        beautifulWordIds: wordIds,
      }),
    onSuccess: (node) => {
      clearDraft(story!.id);
      setPublished(true);
      queryClient.invalidateQueries({ queryKey: ["story", story?.id] });
      queryClient.invalidateQueries({ queryKey: ["branches", story?.id] });
      queryClient.invalidateQueries({ queryKey: ["home", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["stories", "explore"] });
      setTimeout(() => navigate(`/stories/${story!.slug}?branch=${node.id}`), 1200);
    },
  });

  const branches = branchesQuery.data ?? [];
  const parentOptions = useMemo(
    () => [
      { id: null, label: `The seed — ${story?.title ?? ""}`, authorId: story?.seedAuthorId ?? "" },
      ...branches.map((b) => ({ id: b.id, label: b.title, authorId: b.authorId })),
    ],
    [branches, story],
  );

  const handleSave = () => {
    if (!story) return;
    saveDraft({
      storyId: story.id,
      parentId,
      type,
      title,
      body,
      wordIds,
      savedAt: new Date().toISOString(),
    });
  };

  const canPublish =
    body.trim().split(/\s+/).filter(Boolean).length >= 20 && title.trim().length > 0;

  if (storyQuery.isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[700px]" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 text-center">
        <Feather className="h-8 w-8 text-gold" />
        <p className="text-secondary">This story has wandered off.</p>
        <Button to="/explore" variant="outline">Back to the library</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Link
          to={`/stories/${story.slug}`}
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-secondary transition hover:text-primary"
          aria-label="Back to story"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">
            Continue the story
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] leading-tight">
            {story.title}
          </h1>
        </div>
      </div>

      <AnimatePresence>
        {published && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-3xl border border-success/30 bg-success/10 px-6 py-4 text-success"
          >
            <Check className="h-5 w-5" />
            <p className="font-semibold">
              Your branch has grown from this story. Taking you back to the tree…
            </p>
            <Loader2 className="h-4 w-4 animate-spin ml-auto" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
        <aside className="space-y-6 lg:sticky lg:top-32">
          <div className="rounded-[28px] border border-border bg-surface p-7 space-y-4">
            <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
              The story so far
            </p>
            <p className="text-[15px] leading-relaxed text-primary/85 line-clamp-6">
              {story.body}
            </p>
            <Link
              to={`/stories/${story.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-primary transition-colors"
            >
              Read the full story →
            </Link>
          </div>

          <div className="rounded-[28px] border border-border bg-surface p-7 space-y-5">
            <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
              Continue from
            </p>
            <div className="space-y-2">
              {parentOptions.slice(0, 6).map((opt) => {
                const active = parentId === opt.id;
                const author = authorById(opt.authorId);
                return (
                  <button
                    key={opt.id ?? "seed"}
                    type="button"
                    onClick={() => setParentId(opt.id)}
                    className={cn(
                      "w-full text-left rounded-2xl border px-4 py-3 transition-all duration-300",
                      active
                        ? "border-primary bg-primary text-background"
                        : "border-border bg-card text-primary hover:border-primary/40",
                    )}
                  >
                    <p className="text-sm font-semibold truncate">{opt.label}</p>
                    <p className={cn("text-xs", active ? "text-background/70" : "text-secondary")}>
                      by {author?.penName ?? "A quiet author"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="space-y-8 min-w-0">
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
                How will you continue?
              </p>
              <span className="text-xs text-secondary">{type}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {CONTRIBUTION_TYPES.map(({ type: t, hint }) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={cn(
                    "text-left rounded-2xl border p-4 transition-all duration-300 ease-[var(--ease-fluid)]",
                    type === t
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/40 hover:-translate-y-0.5",
                  )}
                >
                  <p className={cn("text-sm font-semibold", type === t ? "text-accent" : "text-primary")}>
                    {t}
                  </p>
                  <p className="text-xs text-secondary mt-1 leading-snug">{hint}</p>
                </button>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <Input
              label="Title of your branch"
              placeholder="A name for this continuation…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <StoryEditor
              body={body}
              onChange={setBody}
              onSave={handleSave}
              lastSaved={lastSaved}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-secondary max-w-md">
              Every continuation matters. Your words will become a branch on the tree —
              never overwritten, always someone's next starting point.
            </p>
            <Button
              size="lg"
              disabled={!canPublish || publish.isPending}
              onClick={() => publish.mutate()}
            >
              {publish.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Growing your branch…
                </>
              ) : (
                <>
                  <Feather className="h-4 w-4" />
                  {user ? `Publish as ${user.penName}` : "Publish"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
