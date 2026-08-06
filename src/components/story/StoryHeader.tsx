import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, Download, Users } from "lucide-react";
import type { Story } from "@/types";
import { authorById } from "@/services/mock";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { exportStoryPdf } from "@/lib/pdf";

export function StoryHeader({
  story,
  onContinue,
}: {
  story: Story;
  onContinue?: () => void;
}) {
  const [bookmarked, setBookmarked] = useState(false);

  const authorNames = story.contributorIds
    .map((id) => authorById(id)?.penName)
    .filter(Boolean)
    .slice(0, 3) as string[];

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {story.genres.map((g) => (
            <span
              key={g}
              className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-secondary"
            >
              {g}
            </span>
          ))}
          <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[13px] font-medium text-gold">
            {story.status}
          </span>
        </div>

        <h1 className="font-display text-[5rem] leading-[0.9] tracking-[-0.05em] text-primary max-w-4xl max-lg:text-[3.5rem] max-sm:text-[2.8rem]">
          {story.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {story.contributorIds.slice(0, 4).map((id) => (
                <Avatar key={id} text={authorById(id)?.avatar ?? "?"} size="sm" className="ring-2 ring-background" />
              ))}
            </div>
            <p className="text-sm text-secondary max-w-[240px] leading-snug">
              {authorNames.join(", ")}
              {story.contributorIds.length > 3 && ` +${story.contributorIds.length - 3} more`}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-secondary">
            <Users className="h-4 w-4" strokeWidth={1.75} />
            {story.words.toLocaleString()} words
          </span>
          <span className="text-sm text-secondary">{story.readingMinutes} min read</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onContinue && (
          <Button onClick={onContinue} size="lg">
            Continue the story
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setBookmarked((b) => !b)}
          aria-pressed={bookmarked}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} strokeWidth={1.75} />
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
        <Button variant="ghost" onClick={() => exportStoryPdf(story, [])}>
          <Download className="h-4 w-4" strokeWidth={1.75} />
          Export PDF
        </Button>
      </div>

      <div className="h-px bg-border/70" />
    </motion.header>
  );
}
