import { NOTIFICATIONS, delay, authorById, storyById } from "./mock";
import type { AppNotification } from "@/types";

export async function getNotifications(): Promise<AppNotification[]> {
  await delay(220);
  return NOTIFICATIONS.map((n) => ({ ...n })).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export async function getUnreadCount(): Promise<number> {
  await delay(60);
  return NOTIFICATIONS.filter((n) => !n.read).length;
}

export async function markAllRead(): Promise<void> {
  await delay(120);
  for (const n of NOTIFICATIONS) n.read = true;
}

export async function markRead(id: string): Promise<void> {
  await delay(80);
  const n = NOTIFICATIONS.find((x) => x.id === id);
  if (n) n.read = true;
}

export function notificationMeta(n: AppNotification) {
  const actor = n.actorId ? authorById(n.actorId) : null;
  const story = n.storyId ? storyById(n.storyId) : null;
  return { actor, story };
}
