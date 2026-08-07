import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center"
    >
      <PenLine className="h-10 w-10 text-gold" strokeWidth={1.25} />
      <p className="font-display text-[5rem] leading-[0.9] tracking-[-0.05em]">404</p>
      <p className="text-secondary max-w-md leading-relaxed">
        This page is an unfinished draft — much like the stories we love. It may
        still be waiting for its continuation.
      </p>
      <Link
        to="/"
        className="rounded-full bg-primary text-white px-6 py-3 text-sm font-semibold transition hover:scale-[1.03] active:scale-95"
      >
        Return to the library
      </Link>
    </div>
  );
}
