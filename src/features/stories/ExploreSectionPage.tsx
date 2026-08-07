import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-10"
    >
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
    </motion.div>
  );
}
