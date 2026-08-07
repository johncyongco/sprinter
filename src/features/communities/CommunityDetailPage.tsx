import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, MessageSquare, Trophy, BookOpen } from "lucide-react";
import { getCommunity, getCommunityMembers } from "@/services/communities";
import { getChallenges } from "@/services/challenges";
import { getStories } from "@/services/stories";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { StoryCard } from "@/components/story/StoryCard";
import { Avatar } from "@/components/ui/Avatar";
import { authorById } from "@/services/mock";

export default function CommunityDetailPage() {
  const { communityId = "" } = useParams();

  const communityQuery = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => getCommunity(communityId),
  });
  const community = communityQuery.data;

  const membersQuery = useQuery({
    queryKey: ["community", communityId, "members"],
    queryFn: () => getCommunityMembers(community?.memberIds ?? []),
    enabled: Boolean(community),
  });

  const challengesQuery = useQuery({
    queryKey: ["challenges"],
    queryFn: getChallenges,
  });

  const storiesQuery = useQuery({
    queryKey: ["stories"],
    queryFn: getStories,
  });

  if (communityQuery.isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!community) {
    return <div className="min-h-[50vh] text-secondary">This circle has gone quiet.</div>;
  }

  const members = membersQuery.data ?? [];
  const circleChallenges = (challengesQuery.data ?? []).filter((c) =>
    community.challengeIds.includes(c.id),
  );
  const featuredStories = (storiesQuery.data ?? []).filter((s) =>
    community.featuredStoryIds.includes(s.id),
  );

  return (
    <div className="space-y-14">
      <Link
        to="/communities"
        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All circles
      </Link>

      <header className="relative overflow-hidden rounded-[42px] border border-border bg-surface">
        <div className="h-44 sm:h-56">
          <img src={community.cover} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="p-8 sm:p-12 space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <h1 className="font-display text-[3.5rem] leading-[0.95] tracking-[-0.05em] max-sm:text-[2.6rem]">
              {community.name}
            </h1>
            <span className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-secondary">
              <Users className="h-4 w-4" /> {community.memberCount.toLocaleString()} members
            </span>
          </div>
          <p className="text-lg text-primary/85 leading-relaxed max-w-2xl">
            {community.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {community.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-secondary">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px] items-start">
        <div className="space-y-14">
          <section className="space-y-8">
            <SectionHeading eyebrow="In this circle" title="Featured stories" className="mb-0" />
            <div className="grid gap-8 sm:grid-cols-2">
              {featuredStories.map((s, i) => (
                <StoryCard key={s.id} story={s} index={i} />
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gold" /> Discussion
            </p>
            <div className="space-y-4">
              {community.discussion.map((post) => {
                const author = authorById(post.authorId);
                return (
                  <div key={post.id} className="rounded-3xl border border-border bg-card p-7 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar text={author?.avatar ?? "?"} size="sm" />
                      <div>
                        <p className="text-sm font-semibold">{author?.penName ?? "A quiet author"}</p>
                        <p className="text-xs text-secondary">{post.createdAt}</p>
                      </div>
                    </div>
                    <p className="text-[15px] leading-relaxed text-primary/90">{post.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {circleChallenges.length > 0 && (
            <section className="space-y-6">
              <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gold" /> Challenges in this circle
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {circleChallenges.map((c) => (
                  <Link
                    key={c.id}
                    to={`/challenges/${c.id}`}
                    className="rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <p className="font-display text-2xl tracking-[-0.02em] leading-tight">{c.title}</p>
                    <p className="text-[13px] text-secondary mt-2">{c.kind}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-32">
          <div className="rounded-[30px] border border-border bg-card p-8 space-y-6">
            <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gold" /> Members
            </p>
            <div className="space-y-4">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar text={m.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{m.penName}</p>
                    <p className="text-xs text-secondary truncate">
                      {m.genres.slice(0, 2).join(" · ") || "Writer"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full rounded-full bg-primary text-background px-5 py-3 text-sm font-semibold transition hover:scale-[1.02] active:scale-95"
            >
              Request to join
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
