import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareHeart, Send, X } from "lucide-react";
import { getThoughts, addThought } from "@/services/thoughts";
import { penNameFor, avatarFor } from "@/lib/authors";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export function ThoughtsPanel({
  storyId,
  initialQuote,
  quoteVersion = 0,
}: {
  storyId: string;
  initialQuote?: string;
  quoteVersion?: number;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [quote, setQuote] = useState(initialQuote ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialQuote) {
      setQuote(initialQuote);
      textareaRef.current?.focus();
    }
  }, [initialQuote, quoteVersion]);

  const { data: thoughts, isLoading } = useQuery({
    queryKey: ["thoughts", storyId],
    queryFn: () => getThoughts(storyId),
  });

  const add = useMutation({
    mutationFn: () => addThought(storyId, draft, quote),
    onSuccess: () => {
      setDraft("");
      setQuote("");
      queryClient.invalidateQueries({ queryKey: ["thoughts", storyId] });
    },
  });

  const canPost = draft.trim().length > 2;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-secondary">
        <MessageSquareHeart className="h-4 w-4 text-gold" />
        Margin notes from readers — quieter than comments, closer to the text.
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-3xl" />
            ))}
          </div>
        ) : thoughts?.length ? (
          thoughts.map((t) => {
            return (
              <div
                key={t.id}
                className="flex gap-4 rounded-3xl border-l-2 border-gold/50 bg-card p-6"
              >
                <Avatar text={avatarFor(t.authorId)} size="sm" className="mt-1" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{penNameFor(t.authorId)}</p>
                    <span className="text-[12px] text-secondary">{t.createdAt}</span>
                  </div>
                  {t.quote && (
                    <p className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-[13px] italic leading-relaxed text-secondary">
                      “{t.quote}”
                    </p>
                  )}
                  <p className="text-[15px] leading-relaxed text-primary/90">{t.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={<MessageSquareHeart className="h-8 w-8" strokeWidth={1.25} />}
            title="No thoughts yet"
            description="Leave the first margin note — a line, a question, a small observation."
          />
        )}
      </div>

      <div id="thought-composer" className="rounded-3xl border border-border bg-card p-4">
        {quote && (
          <div className="mb-3 flex items-start justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
            <p className="text-[13px] italic leading-relaxed text-primary/80">
              “{quote}”
            </p>
            <button
              type="button"
              onClick={() => setQuote("")}
              aria-label="Remove quoted passage"
              className="mt-0.5 shrink-0 rounded-full p-1 text-secondary transition hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="A thought on the page…"
            aria-label="Leave a thought"
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed outline-none placeholder:text-secondary/50"
            rows={2}
          />
          <button
            type="button"
            disabled={!canPost || add.isPending}
            onClick={() => add.mutate()}
            className="self-end rounded-full bg-primary p-3 text-background transition hover:scale-105 disabled:opacity-40"
            aria-label="Post thought"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
