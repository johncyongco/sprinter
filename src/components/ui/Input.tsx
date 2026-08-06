import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-14 rounded-2xl border border-border bg-card px-5 text-[15px] text-primary outline-none placeholder:text-secondary/60 transition focus:ring-2 focus:ring-accent/20 focus:border-accent/40 w-full",
            className,
          )}
          {...props}
        />
        {hint && <p className="text-[13px] text-secondary leading-relaxed">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "rounded-2xl border border-border bg-card px-5 py-4 text-[15px] text-primary outline-none placeholder:text-secondary/60 transition focus:ring-2 focus:ring-accent/20 focus:border-accent/40 w-full leading-relaxed resize-y",
            className,
          )}
          {...props}
        />
        {hint && <p className="text-[13px] text-secondary leading-relaxed">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
