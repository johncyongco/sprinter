import type { Story, BranchNode, Critique, BeautifulWord, Author } from "@/types";
import { wordById } from "@/services/mock";
import { countWords, readingTime, estimatePace } from "@/lib/reading";

export function isPwaInstallable(): boolean {
  return (
    typeof window !== "undefined" &&
    !window.matchMedia("(display-mode: standalone)").matches
  );
}

export { countWords, readingTime, estimatePace };

export function exportProfileJson(data: Record<string, unknown>): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sprinter-export.json";
  a.click();
  URL.revokeObjectURL(url);
}

export interface ExportBundle {
  story: Story;
  nodes: BranchNode[];
  critiques: Critique[];
  words: BeautifulWord[];
  contributors: Author[];
}

export function buildExportBundle(
  story: Story,
  nodes: BranchNode[],
  critiques: Critique[],
  contributors: Author[],
): ExportBundle {
  const wordIds = nodes
    .flatMap((n) => n.beautifulWordIds)
    .filter((id, i, arr) => arr.indexOf(id) === i);
  return {
    story,
    nodes,
    critiques,
    words: wordIds
      .map((id) => wordById(id))
      .filter((w): w is BeautifulWord => Boolean(w)),
    contributors,
  };
}
