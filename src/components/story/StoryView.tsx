import { motion } from "framer-motion";
import type { Story } from "@/types";
import { authorById, wordById } from "@/services/mock";
import { WordTag } from "@/components/words/WordTag";
import { Markdown } from "@/lib/markdown";

export function StoryView({
  story,
  onWordSelect,
}: {
  story: Story;
  onWordSelect?: (wordId: string) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <Markdown text={story.body} className="prose-story" />
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {story.beautifulWords.map((bw) => (
          <WordTag
            key={bw.wordId}
            word={wordById(bw.wordId)}
            count={bw.count}
            interactive={Boolean(onWordSelect)}
            className={onWordSelect ? "cursor-pointer" : ""}
          />
        ))}
      </div>
      <p className="text-[13px] text-secondary/80 italic">
        Seeded by {authorById(story.seedAuthorId).penName} ·{" "}
        {story.createdAt} · waiting for its next sentence.
      </p>
    </motion.article>
  );
}
