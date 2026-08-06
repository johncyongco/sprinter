import { useCallback, useRef, useState, type ReactNode } from "react";
import { GripVertical, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";

export function WorkspaceSplit({
  left,
  right,
  initialRatio = 0.52,
  min = 0.28,
  max = 0.75,
  rightLabel,
}: {
  left: ReactNode;
  right: ReactNode;
  initialRatio?: number;
  min?: number;
  max?: number;
  rightLabel: string;
}) {
  const [ratio, setRatio] = useState(initialRatio);
  const [collapsed, setCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (collapsed) return;
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = (ev: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = (ev.clientX - rect.left) / rect.width;
      setRatio(Math.min(max, Math.max(min, next)));
    };
    const up = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (collapsed) return;
    if (e.key === "ArrowLeft") setRatio((r) => Math.max(min, r - 0.05));
    if (e.key === "ArrowRight") setRatio((r) => Math.min(max, r + 0.05));
  };

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-0 overflow-hidden"
    >
      <div
        className="min-w-0 overflow-hidden"
        style={{ width: collapsed ? "100%" : `${ratio * 100}%` }}
      >
        {left}
      </div>

      {!collapsed && (
        <div
          role="separator"
          aria-label={`Resize ${rightLabel} panel`}
          aria-orientation="vertical"
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuemin={Math.round(min * 100)}
          aria-valuemax={Math.round(max * 100)}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          className="group relative z-10 flex w-3 shrink-0 cursor-col-resize items-center justify-center bg-transparent outline-none focus-visible:bg-accent/10"
        >
          <span
            className={cn(
              "h-12 w-1 rounded-full transition-colors",
              dragging.current ? "bg-gold" : "bg-border group-hover:bg-gold/60",
            )}
          />
          <span className="pointer-events-none absolute h-8 w-6 rounded-full bg-card border border-border shadow-card opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <GripVertical className="h-full w-full p-1 text-secondary" strokeWidth={1.5} />
          </span>
        </div>
      )}

      <div className={cn("min-w-0 overflow-hidden", collapsed && "hidden")} style={{ flex: 1 }}>
        {right}
      </div>

      <button
        type="button"
        onClick={toggleCollapse}
        aria-label={collapsed ? `Show ${rightLabel}` : `Hide ${rightLabel}`}
        className={cn(
          "absolute z-20 rounded-full border border-border bg-card p-2 text-secondary shadow-card transition hover:text-primary",
          collapsed ? "right-4 top-4" : "left-1/2 -translate-x-1/2 top-3",
        )}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>
    </div>
  );
}
