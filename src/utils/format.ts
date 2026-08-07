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

/**
 * Export the writer's actual work — stories, continuations, critiques, words
 * and thoughts — as a readable Markdown document (not metadata).
 */
export function downloadWritingsMarkdown(input: {
  savedStories: Story[];
  publishedStories: Story[];
  nodes: BranchNode[];
  critiques: Critique[];
  words: BeautifulWord[];
  thoughts: { authorId: string; content: string; createdAt: string; quote?: string; storyId?: string }[];
  penName: string;
}): void {
  const lines: string[] = [];
  lines.push(`# ${input.penName || "Your writing"} — Sprinter export`);
  lines.push("");
  lines.push(`Exported ${new Date().toLocaleString()}`);
  lines.push("");

  const writeStory = (s: Story, published: boolean) => {
    lines.push(`## ${s.title}`);
    lines.push(`*${published ? "Published" : "Saved"} · ${s.createdAt}*`);
    if (s.genres?.length) lines.push(`**Genres:** ${s.genres.join(", ")}`);
    lines.push("");
    lines.push(s.body.trim() || "_No story body._");
    lines.push("");
  };

  const allStories = [
    ...input.publishedStories.map((s) => ({ ...s, published: true as const })),
    ...input.savedStories.map((s) => ({ ...s, published: false as const })),
  ];
  if (allStories.length === 0) {
    lines.push("## Stories\n\n_None yet._\n");
  } else {
    lines.push("## Stories\n");
    for (const s of allStories) writeStory(s, s.published);
    lines.push("");
  }

  if (input.nodes.length > 0) {
    lines.push("## Continuations\n");
    for (const n of input.nodes) {
      lines.push(`### ${n.title || "Untitled branch"} (${n.type})`);
      lines.push(`*${n.createdAt}*`);
      lines.push("");
      lines.push(n.body.trim());
      lines.push("");
    }
    lines.push("");
  }

  if (input.critiques.length > 0) {
    lines.push("## Critiques\n");
    for (const c of input.critiques) {
      lines.push(`### Critique (${c.createdAt})`);
      const avg = Object.values(c.scores).reduce((a: number, b: number) => a + b, 0);
      lines.push(`*Average: ${(avg / Object.values(c.scores).length).toFixed(1)}/10*`);
      lines.push("");
      lines.push(c.reflection.trim() || "_No reflection._");
      lines.push("");
    }
    lines.push("");
  }

  if (input.words.length > 0) {
    lines.push("## Words you carried\n");
    for (const w of input.words) {
      lines.push(`- **${w.term}** — ${w.meaning}`);
    }
    lines.push("");
  }

  if (input.thoughts.length > 0) {
    lines.push("## Thoughts\n");
    for (const t of input.thoughts) {
      if (t.quote) lines.push(`> “${t.quote}”`);
      lines.push(`${t.content} — ${t.createdAt}`);
      lines.push("");
    }
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sprinter-writing.md";
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
