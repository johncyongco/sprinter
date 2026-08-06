import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn("inline-flex items-center gap-3 group", className)}
      aria-label="Sprinter — home"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-background transition-transform duration-500 ease-[var(--ease-fluid)] group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 12c2.4-1.6 6-2 9-1 2.7 1 5.2 1.1 7-.2" />
          <path d="M4 12c-.2 4 .7 8 2 11M12 10c-.4 4.3-1 8.3-1.6 12" />
        </svg>
      </span>
      <span className="font-display text-[26px] tracking-[-0.02em] leading-none">Sprinter</span>
    </Link>
  );
}
