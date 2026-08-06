import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function CoverPicker({
  value,
  onChange,
  className,
  frameClassName,
  label = "Upload a cover",
  subtext = "or drag & drop an image here",
  note,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  frameClassName?: string;
  label?: string;
  subtext?: string;
  note?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            readFile(e.dataTransfer.files?.[0]);
          }}
          aria-label={value ? "Change cover image" : label}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300",
            !frameClassName && (value ? "h-44 border-transparent" : "h-40 border-border bg-background/40"),
            frameClassName ?? (value ? "border-transparent" : "border-border bg-background/40"),
            dragging && "border-gold bg-gold/5",
          )}
        >
          {value ? (
            <img src={value} alt="Cover preview" className="h-full w-full object-cover" />
          ) : (
            <>
              <ImagePlus className="h-7 w-7 text-gold" strokeWidth={1.5} />
              <p className="mt-2 text-sm font-medium text-primary">{label}</p>
              <p className="mt-0.5 text-[12px] text-secondary/70">{subtext}</p>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-label="Upload cover image"
          onChange={(e) => {
            readFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove cover"
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-secondary shadow-card transition hover:text-danger"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {note && <p className="text-[13px] text-secondary/70">{note}</p>}
    </div>
  );
}
