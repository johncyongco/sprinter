import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Feather, Sprout, ArrowRight, Plus } from "lucide-react";
import { createStory } from "@/services/stories";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CoverPicker } from "@/components/ui/CoverPicker";
import { cn } from "@/lib/cn";
import type {
  Emotion,
  Genre,
  Pacing,
  Perspective,
  Theme,
} from "@/types";

const GENRES: Genre[] = [
  "Literary Fiction", "Fantasy", "Sci-Fi", "Mystery", "Historical Fiction",
  "Poetry", "Romance", "Horror", "Memoir", "Speculative", "Catholic Fiction", "Minimalist",
];

const EMOTIONS: Emotion[] = [
  "Yearning", "Grief", "Wonder", "Stillness", "Longing", "Mercy", "Dread", "Hope", "Reverence", "Homesickness",
];

const THEMES: Theme[] = [
  "Home", "Memory", "Grace", "Pilgrimage", "Silence", "Becoming", "Thresholds", "Redemption", "The Sea", "Faith", "Letters", "Roots",
];

const PERSPECTIVES: Perspective[] = ["First", "Second", "Third", "Epistolary"];
const PACINGS: Pacing[] = ["Slow", "Measured", "Swift"];

function Chip<T extends string>({
  value,
  selected,
  onToggle,
}: {
  value: T;
  selected: boolean;
  onToggle: (value: T) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(value)}
      className={cn(
        "rounded-full border px-5 py-2.5 text-[14px] font-medium transition-all duration-300",
        selected
          ? "border-gold bg-gold/10 text-gold"
          : "border-border bg-card text-secondary hover:border-primary/30 hover:text-primary",
      )}
    >
      {value}
    </button>
  );
}

function AddableChips<T extends string>({
  preset,
  selected,
  onToggle,
  onAdd,
  placeholder,
}: {
  preset: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  onAdd: (value: T) => void;
  placeholder: string;
}) {
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    setCustom((c) => (c.includes(v) ? c : [...c, v]));
    onAdd(v as T);
    setDraft("");
  };

  const pool: T[] = [...preset, ...(custom as T[])];

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {pool.map((c) => (
          <Chip key={c} value={c} selected={selected.includes(c)} onToggle={onToggle} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 w-56 rounded-full border border-dashed border-border bg-background px-4 text-[14px] text-primary outline-none placeholder:text-secondary/60 transition focus:border-gold/50"
        />
        <button
          type="button"
          onClick={commit}
          disabled={!draft.trim()}
          aria-label="Add custom value"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-secondary transition hover:text-gold disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

export default function StartStoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [emotion, setEmotion] = useState<Emotion[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [perspective, setPerspective] = useState<Perspective>("Third");
  const [pacing, setPacing] = useState<Pacing>("Measured");
  const [body, setBody] = useState("");

  const wordCount = useMemo(
    () => body.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length,
    [body],
  );

  const toggle = <T extends string>(list: T[], value: T, set: (next: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const addOne = <T extends string>(list: T[], value: T, set: (next: T[]) => void) =>
    set(list.includes(value) ? list : [...list, value]);

  const ready =
    title.trim().length >= 2 &&
    wordCount >= 60 &&
    genres.length > 0 &&
    emotion.length > 0 &&
    themes.length > 0;

  const seed = useMutation({
    mutationFn: () =>
      createStory({ title, cover: cover ?? undefined, genres, emotion, themes, perspective, pacing, body }),
    onSuccess: (story) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      navigate(`/stories/${story.slug}`);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-10"
    >
      <header className="relative overflow-hidden rounded-[42px] border border-border bg-surface px-8 py-16 sm:px-16 max-sm:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(900px 400px at 90% -10%, rgba(184,155,103,0.16), transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl space-y-5">
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold flex items-center gap-2">
            <Sprout className="h-4 w-4" /> Begin a new branch
          </p>
          <h1 className="font-display text-[3.4rem] leading-[0.95] tracking-[-0.04em] max-sm:text-[2.5rem]">
            Start a story worth <em className="text-accent">continuing</em>.
          </h1>
          <p className="text-secondary text-lg leading-relaxed">
            What you write here becomes the seed — the first sentence someone else will pick up.
            Keep it small enough to leave room, alive enough to demand a next line.
          </p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section className="space-y-5 rounded-[34px] border border-border bg-card p-8 sm:p-10">
            <FieldLabel step="01" label="The title" />
            <Input
              label="Give the seed a name"
              placeholder="e.g. Letters Never Sent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
            <CoverPicker
              value={cover}
              onChange={setCover}
              note="No cover? One will be composed for the seed automatically."
            />
          </section>

          <section className="space-y-5 rounded-[34px] border border-border bg-card p-8 sm:p-10">
            <FieldLabel step="02" label="Where it lives" />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary">Genre</p>
              <AddableChips
                preset={GENRES}
                selected={genres}
                onToggle={(v) => toggle(genres, v, setGenres)}
                onAdd={(v) => addOne(genres, v, setGenres)}
                placeholder="Add a genre…"
              />
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold text-primary">Emotion</p>
              <AddableChips
                preset={EMOTIONS}
                selected={emotion}
                onToggle={(v) => toggle(emotion, v, setEmotion)}
                onAdd={(v) => addOne(emotion, v, setEmotion)}
                placeholder="Add an emotion…"
              />
            </div>

            <p className="text-sm font-semibold text-primary pt-2">Themes</p>
            <div className="flex flex-wrap gap-2.5">
              {THEMES.map((t) => (
                <Chip key={t} value={t} selected={themes.includes(t)} onToggle={(v) => toggle(themes, v, setThemes)} />
              ))}
            </div>
          </section>

          <section className="space-y-5 rounded-[34px] border border-border bg-card p-8 sm:p-10">
            <FieldLabel step="03" label="How it speaks" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary">Perspective</p>
                <div className="flex flex-wrap gap-2.5">
                  {PERSPECTIVES.map((p) => (
                    <Chip key={p} value={p} selected={perspective === p} onToggle={(v) => setPerspective(v as Perspective)} />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary">Pacing</p>
                <div className="flex flex-wrap gap-2.5">
                  {PACINGS.map((p) => (
                    <Chip key={p} value={p} selected={pacing === p} onToggle={(v) => setPacing(v as Pacing)} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-[34px] border border-border bg-card p-8 sm:p-10">
            <FieldLabel step="04" label="The seed" />
            <Textarea
              label="First passage"
              placeholder="Write the opening. Leave a door open — someone should want to walk through it…\n\nMarkdown is welcome. Blank lines between paragraphs."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
            />
            <div className="flex items-center justify-between text-[13px] text-secondary">
              <span>{wordCount.toLocaleString()} words</span>
              {wordCount < 60 && <span>{60 - wordCount} more to open the door</span>}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-6 rounded-[34px] border border-border bg-surface p-8 lg:sticky lg:top-[calc(88px+2rem)]">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Feather className="h-4 w-4 text-gold" />
            Before you seed
          </div>
          <ul className="space-y-3 text-[14px] leading-relaxed text-secondary">
            {[
              "Start in motion, not in explanation.",
              "End one line before the obvious next one.",
              "Keep the first draft a seed, not a novel — 60 to 400 words.",
              "Others will continue it. Leave them somewhere to go.",
            ].map((tip) => (
              <li key={tip} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {tip}
              </li>
            ))}
          </ul>
          <Button
            size="lg"
            className="w-full"
            disabled={!ready || seed.isPending}
            onClick={() => seed.mutate()}
          >
            {seed.isPending ? "Seeding…" : "Seed the story"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </aside>
      </div>
    </motion.div>
  );
}

function FieldLabel({ step, label }: { step: string; label: string }) {
  return (
    <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-[11px] text-gold">
        {step}
      </span>
      {label}
    </p>
  );
}
