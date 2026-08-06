import { useUIStore } from "@/stores/useUIStore";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const setTheme = useUIStore((s) => s.setTheme);
  const resolved = useUIStore((s) => s.resolvedTheme);
  const [isDark, setIsDark] = useState(resolved === "dark");

  useEffect(() => setIsDark(resolved === "dark"), [resolved]);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className="grid h-11 w-11 place-items-center rounded-full border border-border bg-white dark:bg-card text-secondary transition hover:text-primary hover:border-accent/30"
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
    </button>
  );
}
