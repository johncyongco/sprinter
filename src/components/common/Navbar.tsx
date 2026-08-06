import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search, Feather } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/app/config/site";
import { NotificationsBell } from "./NotificationsBell";
import { ModeToggle } from "./ModeToggle";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      navigate(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
      e.currentTarget.value = "";
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-500 ease-[var(--ease-fluid)]",
        scrolled
          ? "border-border bg-background/85 shadow-soft"
          : "border-transparent bg-background/0",
      )}
    >
      <div className="h-24 max-w-[1680px] mx-auto px-10 max-sm:px-4 max-sm:h-16 flex items-center justify-between gap-6">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "relative text-[15px] font-medium transition-colors duration-300 pb-1",
                  isActive
                    ? "text-primary after:block after:h-px after:bg-primary after:mt-1 after:content-['']"
                    : "text-secondary hover:text-primary",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/70 pointer-events-none" />
            <input
              type="search"
              placeholder="Search the library…"
              onKeyDown={onSearchKey}
              aria-label="Search"
              className="h-11 w-52 lg:w-64 rounded-full bg-white dark:bg-card border border-border pl-11 pr-5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all duration-300"
            />
          </div>
          <ModeToggle />
          <NotificationsBell />
          <Link
            to="/write"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-background transition-all duration-300 hover:shadow-hover hover:-translate-y-px"
          >
            <Feather className="h-4 w-4" strokeWidth={1.75} />
            Write
          </Link>
          <Link
            to="/profile"
            aria-label="Profile"
            className="ml-1 transition hover:scale-105 duration-300"
          >
            <Avatar text={user?.avatar ?? "Y"} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}
