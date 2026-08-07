import { Link } from "react-router-dom";
import { ArrowRight, GitFork, Clock } from "lucide-react";
import type { Story } from "@/types";
import { authorById } from "@/services/mock";
import { cn } from "@/lib/cn";

export function StoryCard({
  story,
  className,
}: {
  story: Story;
  className?: string;
  index?: number;
}) {
  const seedAuthor = authorById(story.seedAuthorId);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-card transition-all duration-500 ease-[var(--ease-fluid)] hover:-translate-y-1 hover:shadow-hover cursor-pointer",
        className,
      )}
    >
      <Link to={`/stories/${story.slug}`} className="flex h-full flex-col focus:outline-none">
        <div className="relative h-60 w-full overflow-hidden">
          <img
            src={story.cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-[var(--ease-fluid)] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {story.isEditorialPick && (
            <span className="absolute left-5 top-5 rounded-full bg-background/90 backdrop-blur px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold shadow-sm">
              Editor's Pick
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-7 space-y-5">
          <div className="flex flex-wrap gap-2">
            {story.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium text-secondary"
              >
                {genre}
              </span>
            ))}
            {story.status !== "Complete" && (
              <span className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-xs font-medium text-accent">
                Waiting
              </span>
            )}
          </div>

          <h3 className="font-display text-[2rem] leading-none tracking-[-0.03em] font-normal text-primary">
            {story.title}
          </h3>

          <p className="text-[15px] leading-relaxed text-secondary line-clamp-2">
            {story.excerpt}
          </p>

          <div className="flex items-center gap-3 text-secondary text-sm font-medium">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {seedAuthor?.avatar ?? "?"}
            </span>
            <span className="truncate">{seedAuthor?.penName ?? "A quiet author"}</span>
          </div>

          <div className="mt-auto flex items-center justify-between pt-1">
            <div className="flex items-center gap-4 text-[13px] text-secondary">
              <span className="flex items-center gap-1.5">
                <GitFork className="h-4 w-4" strokeWidth={1.75} />
                {story.continuationCount} continuation{story.continuationCount === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
                {story.readingMinutes} min
              </span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition-all duration-300 ease-[var(--ease-fluid)] group-hover:scale-[1.03] group-hover:shadow-card">
              Continue
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
