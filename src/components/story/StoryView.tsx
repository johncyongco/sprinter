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
    <article className="space-y-8">
      <Markdown text={story.body} className="prose-story" />
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {story.beautifulWords.map((bw) => {
          const word = wordById(bw.wordId);
          if (!word) return null;
          return (
            <WordTag
              key={bw.wordId}
              word={word}
              count={bw.count}
              interactive={Boolean(onWordSelect)}
              className={onWordSelect ? "cursor-pointer" : ""}
            />
          );
        })}
      </div>
      <p className="text-[13px] text-secondary/80 italic">
        Seeded by {authorById(story.seedAuthorId)?.penName ?? "a quiet author"} ·{" "}
        {story.createdAt} · waiting for its next sentence.
      </p>
    </article>
  );
}
