import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  className,
  tone = "accent",
}: {
  value: number;
  className?: string;
  tone?: "accent" | "gold" | "success";
}) {
  const tones = {
    accent: "bg-accent",
    gold: "bg-gold",
    success: "bg-success",
  };
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-border/60", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-[var(--ease-fluid)]", tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
