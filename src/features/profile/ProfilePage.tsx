import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Feather, MessageSquareHeart, GitFork, FileText, Award, ScrollText, Camera, X } from "lucide-react";
import { getProfile } from "@/services/users";
import { getContributionsByAuthor, getStoriesByAuthor } from "@/services/continuations";
import { getCritiques } from "@/services/critiques";
import { getStories } from "@/services/stories";
import { getCollections } from "@/services/communities";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { CoverPicker } from "@/components/ui/CoverPicker";
import { StoryCard } from "@/components/story/StoryCard";
import { CritiqueCard } from "@/components/critique/CritiqueCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDraftStore } from "@/stores/useDraftStore";
import { useUserStore } from "@/stores/useUserStore";
import type { BranchNode, Draft, Story } from "@/types";

const TABS = [
  { id: "stories", label: "Stories" },
  { id: "contributions", label: "Contributions" },
  { id: "critiques", label: "Critiques" },
  { id: "drafts", label: "Drafts" },
  { id: "collections", label: "Collections" },
  { id: "achievements", label: "Achievements" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState("stories");
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const user = useUserStore((s) => s.user);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const me = user?.id ?? "me";

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile", me], queryFn: getProfile });
  const { data: stories } = useQuery({ queryKey: ["profile", me, "stories"], queryFn: () => getStoriesByAuthor(me) });
  const { data: contributions } = useQuery({ queryKey: ["profile", me, "contributions"], queryFn: () => getContributionsByAuthor(me) });
  const { data: allStories } = useQuery({ queryKey: ["stories"], queryFn: getStories });
  const { data: myCritiques } = useQuery({
    queryKey: ["profile", me, "critiques"],
    queryFn: async () => {
      const results = await Promise.all(
        (allStories ?? []).map((s) => getCritiques(s.id)),
      );
      return results.flat().filter((c) => c.authorId === me);
    },
    enabled: Boolean(allStories),
  });
  const { data: collections } = useQuery({ queryKey: ["collections"], queryFn: getCollections });
  const drafts = useDraftStore((s) => Object.values(s.drafts));

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
    { icon: FileText, label: "Stories started", value: profile.stats.storiesStarted },
    { icon: GitFork, label: "Continuations", value: profile.stats.continuations },
    { icon: Feather, label: "Words added", value: profile.stats.wordsAdded.toLocaleString() },
    { icon: MessageSquareHeart, label: "Critiques", value: profile.stats.critiques },
  ];

  const continuedStories = stories?.contributed ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <header className="relative overflow-hidden rounded-[42px] border border-border bg-surface">
        <div className="relative flex flex-col md:flex-row gap-10 p-8 sm:p-14">
          <div className="relative mx-auto w-full max-w-[300px] shrink-0 md:mx-0">
            <div className="aspect-[3/4] overflow-hidden rounded-[30px] border border-border shadow-card">
              {user?.cover ? (
                <img src={user.cover} alt="Portfolio cover" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gold/20 via-surface to-accent/15 text-secondary">
                  <Camera className="h-8 w-8" strokeWidth={1.5} />
                  <p className="mt-2 text-sm font-medium">Portrait cover</p>
                </div>
              )}
            </div>
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCoverPicker((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-[13px] font-semibold text-primary shadow-card backdrop-blur transition hover:scale-[1.02]"
              >
                <Camera className="h-4 w-4" /> {user?.cover ? "Change" : "Add"}
              </button>
              {user?.cover && (
                <button
                  type="button"
                  onClick={() => updateProfile({ cover: undefined })}
                  aria-label="Remove cover"
                  className="grid h-9 w-9 place-items-center rounded-full bg-background/90 text-secondary shadow-card backdrop-blur transition hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {showCoverPicker && (
              <div className="mt-3">
                <CoverPicker
                  value={user?.cover ?? null}
                  onChange={(v) => updateProfile({ cover: v ?? undefined })}
                  frameClassName="aspect-[3/4]"
                  label="Upload a portrait cover"
                  note="Portrait frame — upload any aspect, it will be framed to fit."
                />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6 min-w-0">
            <Avatar text={profile.avatar} size="lg" className="ring-4 ring-background" />
            <div className="space-y-2">
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
              <Link
                to="/settings"
                className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-secondary transition hover:text-primary"
              >
                Edit profile
              </Link>
              <span className="text-sm text-secondary">
                Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 px-8 pb-8 sm:px-14 sm:pb-14">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl border border-border bg-card p-6 space-y-2">
              <s.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <p className="text-3xl font-semibold leading-none">{s.value}</p>
              <p className="text-[13px] text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="space-y-10">
        <Tabs items={TABS} active={tab} onChange={setTab} />

        {tab === "stories" && (
          <div className="space-y-12">
            <section className="space-y-6">
              <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">Seeded by you</p>
              {stories?.seeded.length ? (
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {stories.seeded.map((s, i) => (
                    <StoryCard key={s.id} story={s} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<ScrollText className="h-8 w-8" strokeWidth={1.25} />}
                  title="No seeds yet"
                  description="Seed a story and it will grow here — and, with a little luck, in other people's hands."
                  action={<Link to="/explore" className="rounded-full bg-primary text-background px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]">Find a story to grow</Link>}
                />
              )}
            </section>
            <section className="space-y-6">
              <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">You've continued</p>
              {continuedStories.length ? (
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {continuedStories.map((s, i) => (
                    <StoryCard key={s.id} story={s} index={i} />
                  ))}
                </div>
              ) : (
                <p className="text-secondary italic">Continue a story and it will appear here.</p>
              )}
            </section>
          </div>
        )}

        {tab === "contributions" && (
          <ContributionsTab items={contributions ?? []} />
        )}

        {tab === "critiques" && (
          <div className="space-y-6">
            {myCritiques?.length ? (
              myCritiques.map((c, i) => (
                <div key={c.id}>
                  <CritiqueCard critique={c} index={i} />
                  <Link
                    to={`/stories/${allStories?.find((s) => s.id === c.storyId)?.slug ?? ""}`}
                    className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-accent hover:text-primary transition-colors"
                  >
                    View the story →
                  </Link>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<MessageSquareHeart className="h-8 w-8" strokeWidth={1.25} />}
                title="No critiques yet"
                description="Kind, constructive critiques help stories become. Your words will matter here."
              />
            )}
          </div>
        )}

        {tab === "drafts" && (
          <DraftsTab drafts={drafts} slugOf={(id) => allStories?.find((s) => s.id === id)?.slug ?? ""} />
        )}

        {tab === "collections" && (
          <div className="space-y-6">
            <p className="text-secondary text-sm leading-relaxed max-w-xl">
              Shelves you have bookmarked or curated. Every story in a collection stays connected to its tree.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections?.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to="/collections"
                  className="rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                >
                  <p className="font-display text-2xl tracking-[-0.02em] leading-tight">{c.title}</p>
                  <p className="text-[13px] text-secondary mt-2">{c.storyIds.length} stories</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === "achievements" && (
          <AchievementsTab />
        )}
      </div>
    </motion.div>
  );
}

function ContributionsTab({ items }: { items: { node: BranchNode; story: Story | null }[] }) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState
          icon={<GitFork className="h-8 w-8" strokeWidth={1.25} />}
          title="No branches yet"
          description="Every contribution matters. Your first branch is a sentence away."
        />
      ) : (
        items.map(({ node, story }, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
            className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                {node.type}
              </span>
              <span className="text-[13px] text-secondary">{node.createdAt}</span>
              {story && (
                <span className="text-[13px] text-secondary">in {story.title}</span>
              )}
            </div>
            <p className="font-display text-2xl tracking-[-0.02em]">{node.title}</p>
            <p className="text-sm text-secondary leading-relaxed line-clamp-2">{node.body}</p>
            {story && (
              <Link
                to={`/stories/${story.slug}`}
                className="inline-block text-sm font-semibold text-accent hover:text-primary transition-colors"
              >
                See it on the tree →
              </Link>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}

function DraftsTab({ drafts, slugOf }: { drafts: Draft[]; slugOf: (storyId: string) => string }) {
  return (
    <div className="space-y-4">
      {drafts.length === 0 ? (
        <EmptyState
          icon={<Feather className="h-8 w-8" strokeWidth={1.25} />}
          title="No drafts waiting"
          description="Your drafts autosave here every five seconds — even offline. They'll be waiting when you return."
        />
      ) : (
        drafts.map((d) => (
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

function AchievementsTab() {
  const achievements = [
    { title: "First Light", description: "Wrote your first sentence on Sprinter.", earned: true },
    { title: "The Continuing", description: "Grew a branch from another writer's story.", earned: true },
    { title: "Kind Critic", description: "Left a constructive critique.", earned: true },
    { title: "Relay Runner", description: "Carried a relay story for a full hand.", earned: false },
    { title: "Word Carrier", description: "Attached a beautiful word to a contribution.", earned: false },
    { title: "Anthologist", description: "Featured in a monthly anthology.", earned: false },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((a, i) => (
        <motion.div
          key={a.title}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className={`rounded-3xl border p-6 space-y-3 ${a.earned ? "border-gold/30 bg-gold/5" : "border-border bg-card opacity-70"}`}
        >
          <Award className={`h-5 w-5 ${a.earned ? "text-gold" : "text-secondary"}`} strokeWidth={1.5} />
          <p className="font-display text-2xl tracking-[-0.02em]">{a.title}</p>
          <p className="text-sm text-secondary leading-relaxed">{a.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
