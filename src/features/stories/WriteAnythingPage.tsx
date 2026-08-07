import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpenText, ArrowRight, X } from "lucide-react";
import { createFreeWrite } from "@/services/stories";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function WriteAnythingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const wordCount = useMemo(
    () => body.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length,
    [body],
  );

  const ready = title.trim().length >= 2 && wordCount >= 1;

  const save = useMutation({
    mutationFn: () => createFreeWrite({ title, body }),
    onSuccess: (story) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      navigate(`/stories/${story.slug}`);
    },
  });

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] bg-primary/45 backdrop-blur-md"
      />

      <div className="relative z-[70]">
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl rounded-[34px] border border-border bg-surface p-8 sm:p-10 shadow-hover space-y-8 relative"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 rounded-full bg-card border border-border p-2 text-secondary hover:text-primary transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="space-y-1">
            <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-[11px] text-gold">
                <BookOpenText className="h-3.5 w-3.5" />
              </span>
              Write Anything
            </p>
            <p className="text-[13px] text-secondary pl-10">A title, then free rein.</p>
          </div>

        <Input
          label="Title"
          placeholder="e.g. What I carried home"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="bg-card"
        />

          <Textarea
            label="Your writing"
            placeholder="Start wherever you are…\n\nMarkdown is welcome. Blank lines between paragraphs."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={24}
            className="min-h-[480px] bg-card"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-[13px] text-secondary">
              <span>{wordCount.toLocaleString()} words</span>
              {wordCount > 0 && (
                <span>~{Math.max(1, Math.round(wordCount / 220))} min read</span>
              )}
            </div>
            <Button
              size="lg"
              disabled={!ready || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving…" : "Save to stories"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
