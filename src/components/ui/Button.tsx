import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "gold" | "danger" | "accent";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-background hover:shadow-hover hover:-translate-y-px",
  outline:
    "border border-border bg-card text-primary hover:border-primary/30 hover:-translate-y-px",
  ghost:
    "text-primary hover:bg-primary/5",
  gold:
    "bg-gold text-white hover:shadow-hover hover:-translate-y-px",
  accent:
    "bg-accent text-white hover:shadow-hover hover:-translate-y-px",
  danger:
    "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/15",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-[13px] rounded-full",
  md: "px-5 py-3 text-sm rounded-full",
  lg: "px-7 py-4 text-[15px] rounded-full",
  icon: "p-2.5 rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", to, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-[var(--ease-fluid)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
      variantClasses[variant],
      sizeClasses[size],
      className,
    );

    if (to) {
      return (
        <Link to={to} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
