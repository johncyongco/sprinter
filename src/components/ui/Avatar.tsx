import { cn } from "@/lib/cn";

const PALETTE = [
  "bg-accent/15 text-accent",
  "bg-gold/15 text-gold",
  "bg-success/15 text-success",
  "bg-danger/15 text-danger",
  "bg-warning/15 text-warning",
];

export function Avatar({
  text,
  className,
  size = "md",
}: {
  text: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const hash = text.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const color = PALETTE[hash % PALETTE.length];
  const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-full font-display font-medium select-none shrink-0",
        sizes[size],
        color,
        className,
      )}
    >
      {text}
    </span>
  );
}
