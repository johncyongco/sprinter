import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Feather, Users } from "lucide-react";
import { getWord, getWordRelations, getWordStories } from "@/services/words";
import { RelationshipGraph } from "@/components/words/RelationshipGraph";
import { WordTag } from "@/components/words/WordTag";
import { StoryCard } from "@/components/story/StoryCard";
import { Skeleton } from "@/components/ui/Skeleton";

export default function WordDetailPage() {
  const { wordId = "" } = useParams();

  const wordQuery = useQuery({
    queryKey: ["word", wordId],
    queryFn: () => getWord(wordId),
  });
  const word = wordQuery.data;

  const relationsQuery = useQuery({
    queryKey: ["word", wordId, "relations"],
    queryFn: () => getWordRelations(wordId),
    enabled: Boolean(word),
  });

  const storiesQuery = useQuery({
    queryKey: ["word", wordId, "stories"],
    queryFn: () => getWordStories(wordId),
    enabled: Boolean(word),
  });

  if (wordQuery.isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!word) {
    return <div className="min-h-[50vh] text-secondary">This word has wandered off.</div>;
  }

  const relations = relationsQuery.data ?? [];
  const stories = storiesQuery.data ?? [];

  return (
    <div className="space-y-14">
      <Link
        to="/words"
        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to the Vault
      </Link>

      <header className="grid gap-10 lg:grid-cols-[1fr_1fr] items-center">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Feather className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">
              A beautiful word
            </p>
          </div>
          <h1 className="font-display text-[5rem] leading-[0.9] tracking-[-0.05em] max-sm:text-[3.5rem]">
            {word.term}
          </h1>
          <p className="text-lg text-primary/85 leading-relaxed max-w-lg">{word.meaning}</p>
          {word.etymology && (
            <p className="text-sm text-secondary leading-relaxed max-w-lg italic border-l-2 border-gold/50 pl-5">
              {word.etymology}
            </p>
          )}
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <Stat icon={BookOpen} label="Stories" value={word.usageCount} />
            <Stat icon={Users} label="Hands" value={word.contributors} />
            <Stat icon={Feather} label="Popularity" value={`${word.popularity}%`} />
          </div>
        </div>

        <div className="rounded-[34px] border border-border bg-surface p-8">
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-4 text-center">
            Relationship graph
          </p>
          <RelationshipGraph word={word} relations={relations} />
        </div>
      </header>

      <section className="space-y-6">
        <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
          Stories carrying this word
        </p>
        {stories.length === 0 ? (
          <p className="text-secondary italic">
            No stories carry this word yet. Your next sentence could be the first.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {stories.map(({ story, count }, i) => (
              <div key={story.id} className="relative">
                <StoryCard story={story} index={i} />
                <WordTag
                  word={word}
                  count={count}
                  className="absolute left-6 top-4 shadow-card"
                  interactive={false}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
      <Icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
      <p className="text-xl font-semibold leading-none">{value}</p>
      <p className="text-[11px] text-secondary">{label}</p>
    </div>
  );
}
