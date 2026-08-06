import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-6 mb-10", className)}>
      <div className="space-y-4 max-w-2xl">
        {eyebrow && (
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[42px] leading-none tracking-[-0.04em] max-sm:text-[34px]">
          {title}
        </h2>
        {subtitle && <p className="text-secondary leading-relaxed max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
