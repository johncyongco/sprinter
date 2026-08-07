import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  StoriesView,
  WordsView,
  AnthologiesView,
  CommunitiesView,
  ThoughtsView,
  MotifsThemesView,
} from "@/features/stories/ExplorePage";

const SECTIONS = ["stories", "words", "anthologies", "communities", "thoughts", "motifs"];

export default function ExploreSectionPage() {
  const { section } = useParams<{ section: string }>();
  const valid = section && SECTIONS.includes(section);

  if (!valid) return <Navigate to="/explore" replace />;

  return (
    <div className="space-y-10">
      <div className="space-y-8">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> The library
        </Link>
      </div>

      {section === "stories" && <StoriesView />}
      {section === "words" && <WordsView />}
      {section === "anthologies" && <AnthologiesView />}
      {section === "communities" && <CommunitiesView />}
      {section === "thoughts" && <ThoughtsView />}
      {section === "motifs" && <MotifsThemesView />}
    </div>
  );
}
