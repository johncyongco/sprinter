import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Feather,
  Link2,
  Plus,
  Quote,
  Save,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { publishContinuation } from "@/services/continuations";
import { getVault } from "@/services/words";
import { useDraftStore } from "@/stores/useDraftStore";
import { useAutosave } from "@/hooks/useAutosave";
import { Markdown } from "@/lib/markdown";
import { WordTag } from "@/components/words/WordTag";
import { AddWordModal } from "@/components/story/AddWordModal";
import { countWords } from "@/lib/reading";
import { cn } from "@/lib/cn";
import type { BeautifulWord, BranchNode, ContributionType, DraftReference, Story } from "@/types";

const TYPES: ContributionType[] = [
  "Continue",
  "Dialogue",
  "Flashback",
  "Character Perspective",
  "Opposing View",
  "World Building",
  "Foreshadowing",
  "Rewrite",
  "Different Ending",
  "Poem",
  "Letter",
  "Monologue",
];

export interface ContributionPanelHandle {
  addReference: (quote: string, source: string, nodeId: string | null) => void;
}

export const ContributionPanel = forwardRef<ContributionPanelHandle, {
  story: Story;
  branches: BranchNode[];
  onPublished: (node: BranchNode) => void;
}>(
  function ContributionPanel({ story, branches, onPublished }, ref) {
    const queryClient = useQueryClient();
    const draftStore = useDraftStore();

    const [type, setType] = useState<ContributionType>("Continue");
    const [parentId, setParentId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [wordIds, setWordIds] = useState<string[]>([]);
    const [references, setReferences] = useState<DraftReference[]>([]);
    const [preview, setPreview] = useState(false);
    const [wordModal, setWordModal] = useState(false);
    const [wordMap, setWordMap] = useState<Record<string, BeautifulWord>>({});

    const vaultQuery = useQuery({ queryKey: ["vault"], queryFn: getVault });

    const resolvedWords = wordIds
      .map((id) => wordMap[id] ?? vaultQuery.data?.find((w) => w.id === id))
      .filter((w): w is BeautifulWord => Boolean(w));

    useEffect(() => {
      const draft = draftStore.getDraft(story.id);
      if (!draft) return;
      setType(draft.type);
      setParentId(draft.parentId);
      setTitle(draft.title);
      setBody(draft.body);
      setWordIds(draft.wordIds);
      setReferences(draft.references ?? []);
    }, [story.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const persist = () => {
      if (!body.trim() && !title.trim() && wordIds.length === 0 && references.length === 0) return;
      draftStore.saveDraft({
        storyId: story.id,
        parentId,
        type,
        title,
        body,
        wordIds,
        references,
        savedAt: new Date().toISOString(),
      });
    };

    useAutosave(body, persist, 5000);

    const persistDebounced = useDebouncedFn(persist, 1200);

    useEffect(() => {
      persistDebounced();
    }, [type, parentId, title, wordIds, references]); // eslint-disable-line react-hooks/exhaustive-deps

    useImperativeHandle(ref, () => ({
      addReference: (quote, source, nodeId) => {
        setReferences((prev) => [
          { id: `ref-${Date.now()}`, quote: quote.trim().slice(0, 220), source, nodeId },
          ...prev.slice(0, 4),
        ]);
        setPreview(false);
      },
    }));

    const publish = useMutation({
      mutationFn: () =>
        publishContinuation({
          storyId: story.id,
          parentId,
          type,
          title,
          body,
          beautifulWordIds: wordIds,
        }),
      onSuccess: (node) => {
        draftStore.clearDraft(story.id);
        queryClient.invalidateQueries({ queryKey: ["branches"] });
        queryClient.invalidateQueries({ queryKey: ["stories"] });
        onPublished(node);
      },
    });

    const words = countWords(body);
    const canPublish = words >= 20 && title.trim().length > 0 && body.trim().length > 0;

    const addWord = (word: BeautifulWord) => {
      setWordIds((prev) => (prev.includes(word.id) ? prev : [...prev]));
      setWordMap((m) => ({ ...m, [word.id]: word }));
    };

    const removeWord = (id: string) => setWordIds((prev) => prev.filter((w) => w !== id));

    const parentOptions = [
      { id: null as string | null, label: `The seed — ${story.title}` },
      ...branches.map((b) => ({ id: b.id, label: b.title })),
    ];

    return (
      <div className="flex h-full min-h-0 flex-col bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/10 text-gold">
              <Feather className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-2xl tracking-[-0.02em] leading-none">Continue Writing</p>
              <p className="text-[12px] text-secondary mt-1">Your branch grows from this story — never overwritten.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-border bg-card px-3.5 py-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreview(false)}
                aria-pressed={!preview}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold transition-colors", !preview ? "bg-primary text-background" : "text-secondary hover:text-primary")}
              >
                <EyeOff className="h-3.5 w-3.5" /> Write
              </button>
              <button
                type="button"
                onClick={() => setPreview(true)}
                aria-pressed={preview}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold transition-colors", preview ? "bg-primary text-background" : "text-secondary hover:text-primary")}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            </div>
            <button
              type="button"
              onClick={persist}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-secondary transition hover:text-primary"
              aria-label="Save draft"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="contribution-type" className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                Contribution type
              </label>
              <select
                id="contribution-type"
                value={type}
                onChange={(e) => setType(e.target.value as ContributionType)}
                className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="contribution-parent" className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                Continues from
              </label>
              <select
                id="contribution-parent"
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value === "" ? null : e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
              >
                {parentOptions.map((o) => (
                  <option key={o.id ?? "seed"} value={o.id ?? ""}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contribution-title" className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              Title of your branch
            </label>
            <input
              id="contribution-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this moment a name…"
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-[17px] font-display outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
            />
          </div>

          <AnimatePresence>
            {references.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary flex items-center gap-2">
                  <Quote className="h-3.5 w-3.5 text-gold" /> Referenced passages
                </p>
                {references.map((r) => (
                  <div
                    key={r.id}
                    className="group flex items-start gap-3 rounded-2xl border-l-2 border-gold/60 bg-card p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] italic leading-relaxed text-primary line-clamp-2">“{r.quote}”</p>
                      <p className="text-[11px] text-secondary mt-1.5 flex items-center gap-1.5">
                        <Link2 className="h-3 w-3" /> {r.source}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReferences((prev) => prev.filter((x) => x.id !== r.id))}
                      className="shrink-0 rounded-full p-1 text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
                      aria-label="Remove reference"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label htmlFor="contribution-body" className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              Your thoughts
            </label>
            {preview ? (
              <div className="min-h-[240px] rounded-2xl border border-border bg-card p-6 prose-story">
                {body.trim() ? (
                  <Markdown text={body} />
                ) : (
                  <p className="text-secondary italic">Nothing to preview yet. Write a sentence first.</p>
                )}
              </div>
            ) : (
              <textarea
                id="contribution-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={"Write your continuation…\n\nMarkdown is welcome. **bold**, *italic*, > quotes. Blank lines between paragraphs."}
                aria-label="Your continuation"
                className="min-h-[240px] w-full resize-y rounded-2xl border border-border bg-card p-6 text-[16px] leading-8 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 placeholder:text-secondary/50"
              />
            )}
            <p className="flex flex-wrap items-center gap-x-5 gap-y-1 px-1 text-[12px] text-secondary">
              <span><strong className="text-primary">{words.toLocaleString()}</strong> words</span>
              <span>autosaves every 5 seconds</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">Beautiful words</p>
            <div className="flex flex-wrap items-center gap-2">
              {resolvedWords.map((w) => (
                <span key={w.id} className="inline-flex items-center gap-1">
                  <WordTag word={w} interactive={false} />
                  <button
                    type="button"
                    onClick={() => removeWord(w.id)}
                    className="rounded-full p-0.5 text-secondary transition hover:text-danger"
                    aria-label={`Remove ${w.term}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setWordModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-[13px] font-medium text-secondary transition hover:border-gold/50 hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Add Word
              </button>
            </div>
            {wordIds.length > 0 && (
              <p className="text-[12px] text-secondary">Words attached to your branch join the Word Vault.</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-[12px] text-secondary max-w-[240px]">
              Publishing never overwrites — your branch becomes a new leaf on the tree.
            </p>
            <button
              type="button"
              disabled={!canPublish || publish.isPending}
              onClick={() => publish.mutate()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.02] disabled:opacity-40"
            >
              {publish.isPending ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish Continuation
            </button>
          </div>
        </div>

        <AddWordModal open={wordModal} onClose={() => setWordModal(false)} onAdd={addWord} />
      </div>
    );
  },
);
ContributionPanel.displayName = "ContributionPanel";

function useDebouncedFn<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  const timer = useRef<number | null>(null);
  return (...args: A) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => fn(...args), ms);
  };
}
