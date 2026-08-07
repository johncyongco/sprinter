import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { getCollections, getCollectionStories, getCurator } from "@/services/communities";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { StoryCard } from "@/components/story/StoryCard";
import type { Collection } from "@/types";

export default function CollectionsPage() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });
  const [open, setOpen] = useState<Collection | null>(null);

  const { data: openStories } = useQuery({
    queryKey: ["collection", open?.id, "stories"],
    queryFn: () => getCollectionStories(open?.storyIds ?? []),
    enabled: Boolean(open),
  });

  const { data: curator } = useQuery({
    queryKey: ["collection", open?.id, "curator"],
    queryFn: () => getCurator(open?.curatorId ?? null),
    enabled: Boolean(open),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-[34px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections?.map((collection, i) => (
            <motion.button
              key={collection.id}
              type="button"
              onClick={() => setOpen(collection)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-[34px] border border-border/70 bg-card text-left shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={collection.cover}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                {collection.isCommunity && (
                  <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur px-3.5 py-1.5 text-[11px] font-bold text-secondary">
                    <Users className="h-3 w-3" /> Community
                  </span>
                )}
              </div>
              <div className="p-7 space-y-4">
                <h3 className="font-display text-[1.9rem] leading-none tracking-[-0.03em]">
                  {collection.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                  {collection.description}
                </p>
                <p className="text-[13px] text-secondary">
                  {collection.storyIds.length} stories · curated with care
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} labelledBy="collection-title" className="max-w-3xl">
        {open && (
          <div className="p-9 sm:p-12 space-y-8">
            <div className="space-y-3">
              <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">
                Collection{open.isCommunity ? " · community shelf" : ""}
              </p>
              <h2 id="collection-title" className="font-display text-4xl tracking-[-0.04em]">
                {open.title}
              </h2>
              <p className="text-secondary leading-relaxed">{open.description}</p>
              {curator && <p className="text-sm text-secondary">Curated by {curator.penName}</p>}
            </div>
            <div className="space-y-6">
              {openStories?.map((s, i) => (
                <StoryCard key={s.id} story={s} index={i} />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
