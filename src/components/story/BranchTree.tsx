import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Sparkles } from "lucide-react";
import type { BranchNode, ContributionType, Story } from "@/types";
import { authorById, wordById } from "@/services/mock";
import { Modal } from "@/components/ui/Modal";
import { WordTag } from "@/components/words/WordTag";
import { Markdown } from "@/lib/markdown";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

interface TreeNode {
  node: BranchNode;
  children: TreeNode[];
}

const TYPE_TONES: Record<ContributionType, string> = {
  Continue: "accent",
  Dialogue: "gold",
  Flashback: "danger",
  "Character Perspective": "success",
  "Opposing View": "warning",
  "World Building": "accent",
  Foreshadowing: "warning",
  Rewrite: "danger",
  "Different Ending": "danger",
  Poem: "gold",
  Letter: "gold",
  Monologue: "accent",
} as const;

const TYPE_LABEL: Record<ContributionType, string> = {
  Continue: "Continuation",
  Dialogue: "Dialogue",
  Flashback: "Flashback",
  "Character Perspective": "New Voice",
  "Opposing View": "Opposing View",
  "World Building": "World Building",
  Foreshadowing: "Foreshadowing",
  Rewrite: "Rewrite",
  "Different Ending": "Alternate Ending",
  Poem: "Poem",
  Letter: "Letter",
  Monologue: "Monologue",
};

export function BranchTree({
  story,
  nodes,
  onContinue,
}: {
  story: Story;
  nodes: BranchNode[];
  onContinue?: () => void;
}) {
  const [selected, setSelected] = useState<BranchNode | null>(null);

  const tree = useMemo<TreeNode>(() => {
    const byParent = new Map<string | null, BranchNode[]>();
    for (const n of nodes) {
      const key = n.parentId;
      byParent.set(key, [...(byParent.get(key) ?? []), n]);
    }
    const build = (parent: string | null, depth = 0): TreeNode[] =>
      (byParent.get(parent) ?? []).map((node) => ({
        node,
        children: build(node.id, depth + 1),
      }));
    return { node: null as unknown as BranchNode, children: build(null) };
  }, [nodes]);

  const seedAuthor = authorById(story.seedAuthorId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-gold" /> Branch Tree
        </p>
        <p className="text-sm text-secondary">
          {nodes.length} branch{nodes.length === 1 ? "" : "es"} · never overwritten
        </p>
      </div>

      <div className="space-y-0">
        <SeedNode story={story} author={seedAuthor.penName} />

        <BranchList
          tree={tree.children}
          depth={0}
          onSelect={setSelected}
        />
      </div>

      {onContinue && (
        <div className="pt-4">
          <Button onClick={onContinue} variant="outline" className="w-full">
            <Sparkles className="h-4 w-4 text-gold" />
            Add your branch
          </Button>
        </div>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} labelledBy="node-title">
        {selected && <NodeDetail node={selected} />}
      </Modal>
    </motion.div>
  );
}

function SeedNode({ story, author }: { story: Story; author: string }) {
  return (
    <div className="relative">
      <div className="rounded-3xl border border-gold/30 bg-gold/5 p-6 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <span className="rounded-full bg-gold/15 text-gold px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
            Seed
          </span>
          <span className="text-sm text-secondary">by {author}</span>
        </div>
        <p className="font-display text-2xl tracking-[-0.02em] leading-tight">{story.title}</p>
      </div>
      <div className="mx-auto h-8 w-px bg-border" />
    </div>
  );
}

function BranchList({
  tree,
  depth,
  onSelect,
}: {
  tree: TreeNode[];
  depth: number;
  onSelect: (n: BranchNode) => void;
}) {
  return (
    <div className="relative">
      {tree.map((tn, i) => (
        <motion.div
          key={tn.node.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(0.1 * (i + 1), 0.5), ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="absolute left-[15px] top-0 h-full w-px bg-border"
            aria-hidden="true"
          />
          <div className="relative flex gap-4 py-2">
            <div className="relative z-10 mt-7 h-4 w-4 shrink-0 rounded-full border-2 border-gold bg-background" />
            <button
              type="button"
              onClick={() => onSelect(tn.node)}
              className="group relative flex-1 rounded-3xl border border-border bg-card p-6 shadow-card text-left transition-all duration-300 ease-[var(--ease-fluid)] hover:shadow-hover hover:-translate-y-0.5 hover:border-gold/40"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={cn("rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]", toneClass(TYPE_TONES[tn.node.type]))}>
                  {TYPE_LABEL[tn.node.type]}
                </span>
                <span className="text-xs text-secondary">
                  {authorById(tn.node.authorId).penName} · {tn.node.createdAt}
                </span>
              </div>
              <p className="font-display text-[22px] tracking-[-0.02em] leading-tight mb-2">
                {tn.node.title}
              </p>
              <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                {tn.node.body.replace(/\s+/g, " ").slice(0, 140)}…
              </p>
              <span className="mt-3 inline-block text-[13px] font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Read branch →
              </span>
            </button>
          </div>

          {tn.children.length > 0 && (
            <div className="relative ml-9">
              <BranchList tree={tn.children} depth={depth + 1} onSelect={onSelect} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function toneClass(tone: string): string {
  const map: Record<string, string> = {
    accent: "bg-accent/10 text-accent border border-accent/20",
    gold: "bg-gold/10 text-gold border border-gold/30",
    danger: "bg-danger/10 text-danger border border-danger/20",
    success: "bg-success/10 text-success border border-success/30",
    warning: "bg-warning/10 text-warning border border-warning/30",
  };
  return map[tone] ?? map.accent;
}

function NodeDetail({ node }: { node: BranchNode }) {
  const author = authorById(node.authorId);
  return (
    <div className="p-9 sm:p-12 space-y-7" id="node-title">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]", toneClass(TYPE_TONES[node.type]))}>
          {TYPE_LABEL[node.type]}
        </span>
        <span className="text-sm text-secondary">{author.penName} · {node.createdAt}</span>
      </div>
      <h2 className="font-display text-4xl tracking-[-0.04em] leading-tight">{node.title}</h2>
      <div className="prose-story">
        <Markdown text={node.body} />
      </div>
      {node.beautifulWordIds.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {node.beautifulWordIds.map((id) => (
            <WordTag key={id} word={wordById(id)} />
          ))}
        </div>
      )}
      <AnimatePresence>
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-l-2 border-gold/50 pl-5 font-display italic text-secondary"
        >
          {author.favoriteLine}
        </motion.blockquote>
      </AnimatePresence>
    </div>
  );
}
