import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageSquareHeart } from "lucide-react";
import { getStoryBySlug } from "@/services/stories";
import { getCritiques } from "@/services/critiques";
import { CritiqueForm } from "@/components/critique/CritiqueForm";
import { CritiqueCard } from "@/components/critique/CritiqueCard";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CritiquePage() {
  const { slug = "" } = useParams();

  const storyQuery = useQuery({
    queryKey: ["story", "slug", slug],
    queryFn: () => getStoryBySlug(slug),
  });
  const story = storyQuery.data;

  const critiquesQuery = useQuery({
    queryKey: ["critiques", story?.id],
    queryFn: () => getCritiques(story!.id),
    enabled: Boolean(story),
  });

  if (storyQuery.isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!story) {
    return <div className="min-h-[50vh] text-secondary">This story has wandered off.</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          to={`/stories/${story.slug}`}
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-secondary transition hover:text-primary"
          aria-label="Back to story"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold flex items-center gap-2">
            <MessageSquareHeart className="h-4 w-4" /> Critique
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] leading-tight">{story.title}</h1>
        </div>
      </div>

      <CritiqueForm storyId={story.id} />

      {critiquesQuery.data && critiquesQuery.data.length > 0 && (
        <section className="space-y-6">
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
            Kind words from the community
          </p>
          {critiquesQuery.data.map((c, i) => (
            <CritiqueCard key={c.id} critique={c} index={i} />
          ))}
        </section>
      )}
    </div>
  );
}
