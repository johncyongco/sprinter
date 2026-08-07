import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  /** Make the tabs stretch full-width with equal-sized buttons. */
  equal?: boolean;
}

export function Tabs({ items, active, onChange, className, equal }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1.5",
        equal && "grid w-full",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ease-[var(--ease-fluid)]",
              equal && "flex-1 justify-center text-center",
              isActive ? "text-primary" : "text-secondary hover:text-primary",
            )}
          >
            {isActive && (
              <motion.span className="absolute inset-0 rounded-full bg-card border border-border shadow-soft" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {item.label}
              {typeof item.count === "number" && (
                <span
                  className={cn(
                    "text-[11px] font-semibold rounded-full px-2 py-0.5",
                    isActive ? "bg-primary/10 text-primary" : "bg-primary/5 text-secondary",
                  )}
                >
                  {item.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
