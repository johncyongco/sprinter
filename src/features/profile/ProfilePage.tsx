import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Feather, MessageSquareHeart, GitFork, FileText, Award, Bookmark } from "lucide-react";
import { getProfile } from "@/services/users";
import { getStories, getSavedStories } from "@/services/stories";
import { getWrittenLibrary } from "@/services/mock";
import { getAnthologies } from "@/services/anthologies";
import { getCollections } from "@/services/communities";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDraftStore } from "@/stores/useDraftStore";
import { useUserStore } from "@/stores/useUserStore";
import { ProfileSettings } from "./ProfileSettings";
import type { Author, Draft } from "@/types";

const TABS = [
  { id: "drafts", label: "Drafts" },
  { id: "collections", label: "Collections" },
  { id: "achievements", label: "Achievements" },
  { id: "settings", label: "Settings" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState("drafts");
  const user = useUserStore((s) => s.user);
  const me = user?.id ?? "me";

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const { data: allStories } = useQuery({ queryKey: ["stories"], queryFn: getStories });
  const { data: collections } = useQuery({ queryKey: ["collections"], queryFn: getCollections });
  const { data: saved } = useQuery({ queryKey: ["saved-stories", me], queryFn: getSavedStories });
  const { data: written } = useQuery({ queryKey: ["written", me], queryFn: getWrittenLibrary });
  const draftList = useDraftStore((s) => s.drafts);
  const drafts = Object.values(draftList);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 rounded-[42px]" />
        <Skeleton className="h-10 w-96" />
      </div>
    );
  }

  if (!profile) return null;

  const stats = [
    { icon: FileText, label: "Stories started", value: saved?.length ?? profile.stats.storiesStarted },
    { icon: GitFork, label: "Continuations", value: written?.nodes.length ?? profile.stats.continuations },
    { icon: Feather, label: "Words added", value: profile.stats.wordsAdded.toLocaleString() },
    { icon: MessageSquareHeart, label: "Critiques", value: written?.critiques.length ?? profile.stats.critiques },
  ];

  return (
    <div className="space-y-12">
      <header>
        <div className="flex flex-col md:flex-row gap-8 md:gap-14">
          <Avatar text={profile.avatar} size="lg" className="ring-4 ring-background" />
          <div className="flex-1 space-y-5 min-w-0">
            <div className="space-y-3">
              <h1 className="font-display text-[3.5rem] leading-[0.95] tracking-[-0.05em] max-sm:text-[2.6rem]">
                {profile.penName}
              </h1>
              {profile.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map((g) => (
                    <span key={g} className="rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-secondary">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-secondary leading-relaxed max-w-xl">{profile.bio}</p>
            <p className="font-display italic text-gold text-lg">{profile.favoriteLine}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setTab("settings")}
                className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-secondary transition hover:text-primary"
              >
                Edit profile
              </button>
              <span className="text-sm text-secondary">
                Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => {
            const clickable =
              s.label === "Stories started" ||
              s.label === "Continuations" ||
              s.label === "Critiques";
            const inner = (
              <>
                <s.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                <p className="text-3xl font-semibold leading-none">{s.value}</p>
                <p className="text-[13px] text-secondary">{s.label}</p>
              </>
            );
            return clickable ? (
              <Link
                key={s.label}
                to="/profile/stories"
                className="rounded-3xl border border-border bg-card p-6 space-y-2 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card"
              >
                {inner}
              </Link>
            ) : (
              <div key={s.label} className="rounded-3xl border border-border bg-card p-6 space-y-2">
                {inner}
              </div>
            );
          })}
        </div>
      </header>

      <div className="space-y-10">
        <Tabs items={TABS} active={tab} onChange={setTab} equal />

        {tab === "drafts" && (
          <DraftsTab drafts={drafts} slugOf={(id) => allStories?.find((s) => s.id === id)?.slug ?? ""} />
        )}

        {tab === "collections" && (
          <div className="space-y-4">
            {collections?.length ? (
              collections.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to="/collections"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                >
                  <p className="font-display text-2xl tracking-[-0.02em] leading-tight">{c.title}</p>
                  <p className="text-[13px] text-secondary">{c.storyIds.length} stories</p>
                </Link>
              ))
            ) : (
              <EmptyState
                icon={<Bookmark className="h-8 w-8" strokeWidth={1.25} />}
                title="No collections yet"
                description="Shelves you have bookmarked or curated will appear here. Every story in a collection stays connected to its tree."
              />
            )}
          </div>
        )}

        {tab === "achievements" && (
          <AchievementsTab stats={profile.stats} />
        )}

        {tab === "settings" && (
          <ProfileSettings />
        )}
      </div>
    </div>
  );
}

function DraftsTab({ drafts, slugOf }: { drafts: Draft[]; slugOf: (storyId: string) => string }) {
  const visible = drafts.filter((d) => d.body.trim().length > 0 || d.title.trim().length > 0);
  return (
    <div className="space-y-4">
      {visible.length === 0 ? (
        <EmptyState
          icon={<Feather className="h-8 w-8" strokeWidth={1.25} />}
          title="No drafts waiting"
          description="Your drafts autosave here every five seconds — even offline. They'll be waiting when you return."
        />
      ) : (
        visible.map((d) => (
          <div key={d.storyId} className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-secondary">
                Autosaved {new Date(d.savedAt).toLocaleString()}
              </p>
              <span className="text-[13px] text-secondary">{d.type}</span>
            </div>
            <p className="font-display text-2xl tracking-[-0.02em]">{d.title || "Untitled branch"}</p>
            <p className="text-sm text-secondary leading-relaxed line-clamp-2">{d.body}</p>
            <Link
              to={`/stories/${slugOf(d.storyId)}/continue`}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-background px-5 py-2.5 text-sm font-semibold transition hover:scale-[1.02]"
            >
              <Feather className="h-4 w-4" /> Return to this draft
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

function AchievementsTab({ stats }: { stats: Author["stats"] }) {
  const me = useUserStore((s) => s.user?.id) ?? "me";
  const { data: written } = useQuery({ queryKey: ["written", me], queryFn: getWrittenLibrary });
  const { data: allStories } = useQuery({ queryKey: ["stories"], queryFn: getStories });
  const { data: anthologies } = useQuery({ queryKey: ["anthologies"], queryFn: getAnthologies });

  const nodes = written?.nodes ?? [];
  const critiqueCount = stats.critiques;
  const relayEarned = nodes.some((n) =>
    allStories?.some((s) => s.id === n.storyId && s.challengeId),
  );
  const wordCarrierEarned = nodes.some((n) => n.beautifulWordIds.length > 0);
  const anthologistEarned = anthologies?.some((a) =>
    a.featuredStoryIds.some((sid) => allStories?.some((s) => s.id === sid && s.seedAuthorId === me)),
  ) ?? false;

  const achievements = [
    {
      title: "First Light",
      description: "Wrote your first piece on Sprinter.",
      earned: stats.storiesStarted > 0 || (written?.stories.length ?? 0) > 0,
    },
    {
      title: "The Continuing",
      description: "Grew a branch from another writer's story.",
      earned: stats.continuations > 0 || nodes.length > 0,
    },
    {
      title: "Kind Critic",
      description: "Left a constructive critique.",
      earned: critiqueCount > 0,
    },
    {
      title: "Relay Runner",
      description: "Carried a relay story toward the goal.",
      earned: relayEarned,
    },
    {
      title: "Word Carrier",
      description: "Attached a beautiful word to a contribution.",
      earned: wordCarrierEarned,
    },
    {
      title: "Anthologist",
      description: "Featured in a monthly anthology.",
      earned: anthologistEarned,
    },
  ];

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        {earnedCount} of {achievements.length} earned
      </p>
      {achievements.map((a) => (
        <div
          key={a.title}
          className={`flex flex-wrap items-center gap-5 rounded-3xl border p-6 ${a.earned ? "border-gold/30 bg-gold/5" : "border-border bg-card opacity-70"}`}
        >
          <Award className={`h-5 w-5 shrink-0 ${a.earned ? "text-gold" : "text-secondary"}`} strokeWidth={1.5} />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-display text-2xl tracking-[-0.02em]">{a.title}</p>
            <p className="text-sm text-secondary leading-relaxed">{a.description}</p>
          </div>
          <span className={`text-[13px] font-semibold ${a.earned ? "text-gold" : "text-secondary"}`}>
            {a.earned ? "Earned" : "Locked"}
          </span>
        </div>
      ))}
    </div>
  );
}
