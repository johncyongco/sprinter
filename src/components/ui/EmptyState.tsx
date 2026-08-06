import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center px-8 py-16 rounded-[28px] border border-dashed border-border bg-surface/50",
        className,
      )}
    >
      {icon && <div className="text-gold">{icon}</div>}
      <p className="font-display text-3xl tracking-[-0.02em]">{title}</p>
      {description && <p className="text-secondary max-w-md leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}
