import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl bg-border/60 dark:bg-border/40",
        className,
      )}
    />
  );
}
