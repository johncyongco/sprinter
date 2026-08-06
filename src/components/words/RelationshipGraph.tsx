import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { BeautifulWord } from "@/types";
import type { WordRelation } from "@/services/words";
import { cn } from "@/lib/cn";

export function RelationshipGraph({
  word,
  relations,
}: {
  word: BeautifulWord;
  relations: WordRelation[];
}) {
  const center = 220;
  const radius = 130;

  return (
    <svg
      viewBox="0 0 440 440"
      className="w-full h-auto"
      role="img"
      aria-label={`Words related to ${word.term}`}
    >
      <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" className="text-border" strokeDasharray="3 6" />

      {relations.map((rel, i) => {
        const angle = (i / relations.length) * Math.PI * 2 - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        return (
          <g key={rel.word.id}>
            <motion.line
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: "easeInOut" }}
              className="stroke-border"
              strokeWidth={1 + rel.degree * 0.4}
            />
            <motion.circle
              cx={x}
              cy={y}
              r={20 + Math.min(rel.sharedStories * 4, 12)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05, type: "spring", stiffness: 120, damping: 14 }}
              className="fill-card stroke-accent/50"
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      <motion.circle
        cx={center}
        cy={center}
        r={56}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 12 }}
        className="fill-primary"
      />

      <motion.text
        x={center}
        y={center + 4}
        textAnchor="middle"
        className="fill-background font-display"
        style={{ fontSize: 17 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {word.term}
      </motion.text>

      {relations.map((rel, i) => {
        const angle = (i / relations.length) * Math.PI * 2 - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        return (
          <motion.g
            key={rel.word.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
          >
            <foreignObject
              x={x - 44}
              y={y - 30}
              width={88}
              height={60}
              style={{ pointerEvents: "none" }}
            >
              <div className={cn("flex h-full w-full items-center justify-center text-center")}>
                <Link
                  to={`/words/${rel.word.id}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="font-display text-[13px] leading-tight px-2 py-1 rounded-full border border-border bg-card shadow-card"
                >
                  {rel.word.term}
                </Link>
              </div>
            </foreignObject>
          </motion.g>
        );
      })}
    </svg>
  );
}
