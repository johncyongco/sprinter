import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import type { BeautifulWord } from "@/types";

export function WordTag({
  word,
  count,
  className,
  interactive = true,
}: {
  word: BeautifulWord;
  count?: number;
  className?: string;
  interactive?: boolean;
}) {
  const inner = (
    <>
      {word.term}
      {typeof count === "number" && count > 1 && (
        <span className="opacity-60"> ×{count}</span>
      )}
    </>
  );

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-white px-4 py-2 text-[13px] font-medium text-primary transition-all duration-300",
        interactive && "hover:bg-primary hover:text-background hover:border-primary cursor-pointer",
        className,
      )}
    >
      {interactive ? <Link to={`/words/${word.id}`}>{inner}</Link> : inner}
    </span>
  );
}
