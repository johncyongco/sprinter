import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Users, Tags } from "lucide-react";
import { getCommunities } from "@/services/communities";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { authorById } from "@/services/mock";

export default function CommunitiesPage() {
  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: getCommunities,
  });

  return (
    <div className="space-y-12">
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-[34px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {communities?.map((community) => (
            <div key={community.id}>
              <Link
                to={`/communities/${community.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-[34px] border border-border/70 bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={community.cover}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-7 space-y-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-[1.9rem] leading-none tracking-[-0.03em]">
                      {community.name}
                    </h3>
                    <span className="flex items-center gap-1.5 text-[13px] text-secondary shrink-0">
                      <Users className="h-3.5 w-3.5" /> {community.memberCount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed line-clamp-3">
                    {community.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-secondary">
                        <Tags className="h-3 w-3" /> {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex -space-x-3">
                      {community.memberIds.slice(0, 4).map((id) => (
                        <Avatar key={id} text={authorById(id)?.avatar ?? "?"} size="sm" className="ring-2 ring-card" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      Enter <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
