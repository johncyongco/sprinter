import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/app/config/site";
import { SITE } from "@/app/config/site";

const RESOURCES = [
  { to: "/collections", label: "Collections" },
  { to: "/challenges", label: "Challenges" },
  { to: "/anthologies", label: "Anthologies" },
  { to: "/communities", label: "Communities" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface/60 mt-24 max-lg:mb-24">
      <div className="max-w-[1680px] mx-auto px-10 py-16 max-sm:px-4">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo />
            <p className="text-secondary leading-relaxed max-w-sm">
              {SITE.tagline} A quiet library, art gallery, and writer's desk —
              where unfinished ideas are welcomed.
            </p>
          </div>

          <nav aria-label="Explore">
            <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-5">Library</p>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-secondary hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="More">
            <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold mb-5">More</p>
            <ul className="space-y-3">
              {RESOURCES.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-secondary hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/settings" className="text-secondary hover:text-primary transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/70 pt-8 text-[13px] text-secondary">
          <p>© 2026 Sprinter. Every contribution matters.</p>
          <p className="font-display italic">Someone is always waiting for your next sentence.</p>
        </div>
      </div>
    </footer>
  );
}
