import { PenLine } from "lucide-react";

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <PenLine className="h-9 w-9 text-gold" strokeWidth={1.25} />
      <p className="text-secondary text-sm">Tuning the lamp…</p>
    </div>
  );
}
