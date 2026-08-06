import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Download, BookOpen } from "lucide-react";
import { getAnthologies } from "@/services/anthologies";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { exportAnthologyPdf } from "@/lib/pdf";
import { getStories } from "@/services/stories";

export default function AnthologiesPage() {
  const { data: anthologies, isLoading } = useQuery({
    queryKey: ["anthologies"],
    queryFn: getAnthologies,
  });

  const { data: stories } = useQuery({ queryKey: ["stories"], queryFn: getStories });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <SectionHeading
        eyebrow="Anthologies"
        title="The seasons, bound"
        subtitle="Each month the editors gather the best stories, featured continuations, and top critiques into a single collection — ready to read, export, or hold."
      />

      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[520px] rounded-[34px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {anthologies?.map((anthology, i) => {
            const anthologyStories = (stories ?? []).filter((s) =>
              anthology.storyIds.includes(s.id),
            );
            return (
              <motion.article
                key={anthology.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group overflow-hidden rounded-[34px] border border-border/70 bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={anthology.cover}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-6 top-6 rounded-full bg-background/90 backdrop-blur px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                    {anthology.season}
                  </span>
                </div>
                <div className="p-8 space-y-6">
                  <h3 className="font-display text-[2.2rem] leading-none tracking-[-0.03em]">
                    {anthology.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-secondary">
                    {anthology.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {anthologyStories.slice(0, 4).map((s) => (
                      <span key={s.id} className="rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium text-secondary">
                        {s.title}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      to={`/anthologies/${anthology.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:scale-[1.03] active:scale-95"
                    >
                      <BookOpen className="h-4 w-4" /> Read
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        const branchesService = await import("@/services/continuations");
                        const all = await Promise.all(
                          anthologyStories.map((s) => branchesService.getBranches(s.id)),
                        );
                        exportAnthologyPdf(
                          anthology.title,
                          anthology.season,
                          anthologyStories,
                          all.flat(),
                        );
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-secondary transition hover:text-primary"
                    >
                      <Download className="h-4 w-4" /> Export PDF
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
