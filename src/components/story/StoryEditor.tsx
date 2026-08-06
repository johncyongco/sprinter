import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Save, Check } from "lucide-react";
import { countWords, readingTime } from "@/lib/reading";
import { Markdown } from "@/lib/markdown";
import { cn } from "@/lib/cn";
import { useAutosave } from "@/hooks/useAutosave";

export function StoryEditor({
  body,
  onChange,
  onSave,
  lastSaved,
  placeholder,
}: {
  body: string;
  onChange: (value: string) => void;
  onSave: () => void;
  lastSaved: number | null;
  placeholder?: string;
}) {
  const [preview, setPreview] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const timerRef = useRef<number | null>(null);

  useAutosave(body, onSave, 5000);

  const words = countWords(body);
  const chars = body.length;

  const handleSave = () => {
    onSave();
    setJustSaved(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setJustSaved(false), 1600);
  };

  const isDirty = body.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
          <button
            type="button"
            onClick={() => setPreview(false)}
            aria-pressed={!preview}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              !preview ? "bg-primary text-background" : "text-secondary hover:text-primary",
            )}
          >
            <EyeOff className="h-3.5 w-3.5" /> Write
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            aria-pressed={preview}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              preview ? "bg-primary text-background" : "text-secondary hover:text-primary",
            )}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold text-secondary transition hover:text-primary"
        >
          {justSaved ? <Check className="h-3.5 w-3.5 text-success" /> : <Save className="h-3.5 w-3.5" />}
          {justSaved ? "Saved" : "Save draft"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-[500px] rounded-[28px] bg-card border border-border p-8 sm:p-12 overflow-y-auto"
          >
            {body.trim() ? (
              <div className="prose-story">
                <Markdown text={body} />
              </div>
            ) : (
              <p className="text-secondary italic">Nothing to preview yet. Write a sentence first.</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="write"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <textarea
              value={body}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                placeholder ??
                "Begin with a sentence someone else can carry…\n\nMarkdown is welcome. **bold**, *italic*, > quotes, and blank lines between paragraphs."
              }
              aria-label="Story continuation"
              className="min-h-[500px] w-full rounded-[28px] border border-border bg-card p-8 text-lg leading-9 outline-none resize-y transition focus:ring-2 focus:ring-accent/20 focus:border-accent/40 text-primary placeholder:text-secondary/50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-2 text-[13px] text-secondary">
        <span>
          <strong className="text-primary font-semibold">{words.toLocaleString()}</strong> words
        </span>
        <span>
          <strong className="text-primary font-semibold">{chars.toLocaleString()}</strong> characters
        </span>
        <span>{readingTime(words)} read</span>
        <span className="ml-auto flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", isDirty ? "bg-gold" : "bg-border")} />
          {lastSaved ? `Draft autosaved ${new Date(lastSaved).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Autosaves every 5 seconds"}
        </span>
      </div>
    </div>
  );
}
