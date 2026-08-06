import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GitFork, MessageSquareHeart, Sparkles, Timer, BookOpen, Hand, CheckCheck } from "lucide-react";
import { getNotifications, markAllRead, markRead, notificationMeta } from "@/services/notifications";
import type { NotificationKind } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

const KIND_META: Record<NotificationKind, { icon: typeof Hand; label: string }> = {
  continuation: { icon: GitFork, label: "Continuation" },
  critique: { icon: MessageSquareHeart, label: "Critique" },
  relay: { icon: Hand, label: "Relay" },
  challenge: { icon: Timer, label: "Challenge" },
  anthology: { icon: BookOpen, label: "Anthology" },
  welcome: { icon: Sparkles, label: "Welcome" },
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
  const queryClient = useQueryClient();

  const markAll = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const markOne = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-3xl mx-auto space-y-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-4">
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">Notifications</p>
          <h1 className="font-display text-[3.5rem] leading-[0.95] tracking-[-0.05em] max-sm:text-[2.6rem]">
            The news from the library
          </h1>
        </div>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={unread === 0}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-secondary transition hover:text-primary disabled:opacity-40"
        >
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {notifications?.map((n, i) => {
            const { actor, story } = notificationMeta(n);
            const meta = KIND_META[n.kind];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                className={cn(
                  "flex items-center gap-5 rounded-3xl border p-6 transition-colors",
                  n.read ? "border-border bg-card" : "border-accent/30 bg-accent/5",
                )}
              >
                {actor ? (
                  <Avatar text={actor.avatar} size="md" />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gold/10 text-gold">
                    <meta.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[15px] leading-relaxed text-primary/90">{n.body}</p>
                  <p className="text-[13px] text-secondary flex items-center gap-2">
                    <span className="font-semibold uppercase tracking-[0.1em] text-[11px] text-accent">
                      {meta.label}
                    </span>
                    · {n.createdAt}
                  </p>
                </div>
                {story && (
                  <Link
                    to={`/stories/${story.slug}`}
                    onClick={() => markOne.mutate(n.id)}
                    className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-accent transition hover:text-primary"
                  >
                    Open
                  </Link>
                )}
                {!n.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold" aria-label="Unread" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
