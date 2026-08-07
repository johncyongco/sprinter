import { useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { Home, Compass, Feather, Trophy, User, CloudUpload } from "lucide-react";
import { WriteChoiceModal } from "@/components/write/WriteChoiceModal";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/cn";

export function MobileNav() {
  const [writeOpen, setWriteOpen] = useState(false);
  const isWriteActive = useLocation().pathname.startsWith("/write");
  const user = useUserStore((s) => s.user);
  const isGuest = !user?.provider;

  return (
    <nav
      aria-label="Mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      {isGuest && (
        <Link
          to="/login"
          className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/10 via-surface to-gold/10 px-5 py-3.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-background">
            <CloudUpload className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight">Sign in to save your works</p>
            <p className="text-[12px] text-secondary leading-snug">
              Keep your stories and branches across devices.
            </p>
          </span>
          <span className="shrink-0 text-primary font-semibold text-[13px]">Sign in →</span>
        </Link>
      )}
      <div className="grid grid-cols-5">
        <NavLink
          to="/"
          aria-label="Home"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : "text-secondary hover:text-primary",
            )
          }
        >
          <Home className="h-5 w-5" strokeWidth={1.75} />
          Home
        </NavLink>
        <NavLink
          to="/explore"
          aria-label="Explore"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : "text-secondary hover:text-primary",
            )
          }
        >
          <Compass className="h-5 w-5" strokeWidth={1.75} />
          Explore
        </NavLink>
        <button
          type="button"
          onClick={() => setWriteOpen(true)}
          aria-label="Write"
          className={cn(
            "relative flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors cursor-pointer",
            isWriteActive ? "text-primary" : "text-gold",
          )}
        >
          <span
            className={cn(
              "absolute -top-3 grid h-9 w-9 place-items-center rounded-full text-background shadow-card transition-colors",
              isWriteActive ? "bg-gold" : "bg-primary",
            )}
          >
            <Feather className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="mt-5">Write</span>
        </button>
        <NavLink
          to="/challenges"
          aria-label="Challenges"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : "text-secondary hover:text-primary",
            )
          }
        >
          <Trophy className="h-5 w-5" strokeWidth={1.75} />
          Challenges
        </NavLink>
        <NavLink
          to="/profile"
          aria-label="Profile"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : "text-secondary hover:text-primary",
            )
          }
        >
          <User className="h-5 w-5" strokeWidth={1.75} />
          Profile
        </NavLink>
      </div>
      <WriteChoiceModal open={writeOpen} onClose={() => setWriteOpen(false)} />
    </nav>
  );
}
