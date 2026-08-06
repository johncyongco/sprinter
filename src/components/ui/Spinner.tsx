import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-label="Loading"
      role="status"
      className={cn(
        "inline-block h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin",
        className,
      )}
    />
  );
}
