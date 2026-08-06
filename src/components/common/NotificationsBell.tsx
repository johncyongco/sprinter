import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/services/notifications";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";

export function NotificationsBell() {
  const { data: unread = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: getUnreadCount,
  });

  return (
    <NavLink
      to="/notifications"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      className={cn(
        "relative grid h-11 w-11 place-items-center rounded-full border border-border bg-white dark:bg-card text-secondary transition hover:text-primary hover:border-accent/30",
      )}
    >
      <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
          {unread}
        </span>
      )}
    </NavLink>
  );
}
