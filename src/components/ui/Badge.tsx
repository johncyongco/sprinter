import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "accent" | "gold" | "success" | "warning" | "danger" | "soft";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: Tone;
  interactive?: boolean;
}

const tones: Record<Tone, string> = {
  default: "border-border bg-card text-secondary",
  accent: "border-accent/20 bg-accent/10 text-accent",
  gold: "border-gold/30 bg-gold/10 text-gold",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  soft: "border-border bg-surface text-primary",
};

export function Badge({ children, className, tone = "default", interactive, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-300",
        tones[tone],
        interactive && "hover:bg-primary hover:text-background hover:border-primary cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
