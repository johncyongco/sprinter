import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({ children, className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-[28px] border border-border/70 shadow-card transition-all duration-500 ease-[var(--ease-fluid)]",
        interactive &&
          "hover:-translate-y-1 hover:shadow-hover cursor-pointer hover:border-border",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div className={cn("p-7 space-y-5", className)} {...props}>
      {children}
    </div>
  );
}
