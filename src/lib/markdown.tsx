import { Fragment, type ReactNode } from "react";
import { cn } from "./cn";

function inline(text: string, key: number): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key + i}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={key + i} className="rounded bg-border/40 px-1.5 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(<em key={key + i}>{token.slice(1, -1)}</em>);
    }
    last = m.index + token.length;
    i += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Fragment key={key}>{parts}</Fragment>;
}

export function Markdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className={cn("space-y-6", className)}>
      {blocks.map((block, bi) => {
        if (block.startsWith("### ")) {
          return (
            <h4 key={bi} className="font-display text-2xl tracking-[-0.02em]">
              {inline(block.slice(4), bi)}
            </h4>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h3 key={bi} className="font-display text-[32px] leading-tight tracking-[-0.03em]">
              {inline(block.slice(3), bi)}
            </h3>
          );
        }
        if (block.startsWith("# ")) {
          return (
            <h2 key={bi} className="font-display text-4xl leading-tight tracking-[-0.04em]">
              {inline(block.slice(2), bi)}
            </h2>
          );
        }
        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={bi}
              className="border-l-2 border-gold/60 pl-6 font-display text-xl italic leading-relaxed text-secondary"
            >
              {block
                .split("\n")
                .map((l) => l.replace(/^>\s?/, ""))
                .map((l, li) => <p key={li}>{inline(l, bi * 10 + li)}</p>)}
            </blockquote>
          );
        }
        if (block.startsWith("- ")) {
          return (
            <ul key={bi} className="list-disc space-y-2 pl-6 marker:text-gold">
              {block.split("\n").map((l, li) => (
                <li key={li}>{inline(l.replace(/^- /, ""), bi * 20 + li)}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\. /.test(block)) {
          return (
            <ol key={bi} className="list-decimal space-y-2 pl-6 marker:text-secondary">
              {block.split("\n").map((l, li) => (
                <li key={li}>{inline(l.replace(/^\d+\. /, ""), bi * 30 + li)}</li>
              ))}
            </ol>
          );
        }
        if (/^(-{3,}|_{3,}|\*{3,})$/.test(block)) {
          return <hr key={bi} className="border-border/60" />;
        }
        return (
          <p key={bi} className="first-letter:font-display">
            {block.split("\n").map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, bi * 40 + li)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
