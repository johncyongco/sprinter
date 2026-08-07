import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, ArrowLeft, ArrowRight, Plus, Trophy, X, Check } from "lucide-react";import { createStory } from "@/services/stories";
import { getChallenge } from "@/services/challenges";
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

const STEPS = [
  { label: "The title", eyebrow: "1", hint: "Give the seed a name" },
  { label: "Where it lives", eyebrow: "2", hint: "Genre, emotion, theme" },
  { label: "How it speaks", eyebrow: "3", hint: "Perspective and pacing" },
  { label: "The seed", eyebrow: "4", hint: "Write the opening" },
];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const challengeId = searchParams.get("challenge");
  const { data: challenge } = useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: () => getChallenge(challengeId!),
    enabled: Boolean(challengeId),
  });

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [emotion, setEmotion] = useState<Emotion[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [perspective, setPerspective] = useState<Perspective | null>(null);
  const [pacing, setPacing] = useState<Pacing | null>(null);
  const [body, setBody] = useState("");

  useEffect(() => {
    if (challenge && !title) setTitle(challenge.title);
  }, [challenge, title]);

  const clearChallenge = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("challenge");
    setSearchParams(next);
  };

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

  const stepComplete = [
    title.trim().length >= 2,
    genres.length > 0 && emotion.length > 0 && themes.length > 0,
    Boolean(perspective) && Boolean(pacing),
    ready,
  ];

  const canNext = step < 3 && (step === 0 ? stepComplete[0] : step === 1 ? stepComplete[1] : step === 2 ? stepComplete[2] : true);

  const goNext = () => {
    if (canNext) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const seed = useMutation({
    mutationFn: () =>
      createStory({
        title,
        cover: cover ?? undefined,
        genres,
        emotion,
        themes,
        perspective: perspective ?? "Third",
        pacing: pacing ?? "Measured",
        body,
        challengeId: challenge?.id,
      }),
    onSuccess: (story) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      navigate(`/stories/${story.slug}`);
    },
  });

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] bg-primary/45 backdrop-blur-md"
      />
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Close"
        className="fixed right-5 top-5 z-[80] rounded-full bg-background/10 border border-background/30 p-2.5 text-background hover:bg-background/20 transition cursor-pointer"
      >
        <X className="h-5 w-5" />
      </button>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[70] space-y-10"
      >
      <p className="flex items-center gap-2 text-sm text-background">
        <Sprout className="h-4 w-4 text-gold" />
        Begin a new branch — your opening becomes the seed someone else will pick up.
      </p>
      {challenge && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-gold/25 bg-gold/[0.07] p-7 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Writing for {challenge.kind}
              </p>
              <h2 className="font-display text-3xl tracking-[-0.03em] leading-tight text-background">
                {challenge.title}
              </h2>
              <p className="text-background/90 leading-relaxed">{challenge.prompt}</p>
              <p className="text-[13px] text-background/70">
                {typeof challenge.wordLimit === "number" && (
                  <span>{challenge.wordLimit.toLocaleString()} words max · </span>
                )}
                Closes {challenge.endsAt}
              </p>
            </div>
            <button
              type="button"
              onClick={clearChallenge}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold text-secondary transition hover:text-primary"
            >
              <X className="h-3.5 w-3.5" /> Clear prompt
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Writing steps">
        {STEPS.map((s, i) => {
          const isActive = i === step;
          const isDone = stepComplete[i] && i !== step;
          const clickable = i <= step || stepComplete[i];
          return (
            <button
              key={s.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={!clickable}
              onClick={() => clickable && setStep(i)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300",
                isActive
                  ? "border-primary bg-primary text-background"
                  : isDone
                    ? "border-accent/40 bg-accent/5 text-accent hover:border-accent"
                    : "border-border bg-card text-secondary/60",
              )}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border text-[10px] font-bold",
                    isActive ? "border-background/40" : "border-current",
                  )}
                >
                  {i + 1}
                </span>
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className={cn("mx-auto", step === 3 ? "max-w-6xl" : "max-w-3xl")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <section className="rounded-[34px] border border-border bg-surface p-8 sm:p-10 space-y-8">
              {step === 0 && (
                <div className="space-y-6">
                  <FieldLabel eyebrow={STEPS[0].eyebrow} label={STEPS[0].label} hint={STEPS[0].hint} />
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
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <FieldLabel eyebrow={STEPS[1].eyebrow} label={STEPS[1].label} hint={STEPS[1].hint} />
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

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-primary">Emotion</p>
                    <AddableChips
                      preset={EMOTIONS}
                      selected={emotion}
                      onToggle={(v) => toggle(emotion, v, setEmotion)}
                      onAdd={(v) => addOne(emotion, v, setEmotion)}
                      placeholder="Add an emotion…"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-primary">Themes</p>
                    <div className="flex flex-wrap gap-2.5">
                      {THEMES.map((t) => (
                        <Chip key={t} value={t} selected={themes.includes(t)} onToggle={(v) => toggle(themes, v, setThemes)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <FieldLabel eyebrow={STEPS[2].eyebrow} label={STEPS[2].label} hint={STEPS[2].hint} />
                  <div className="grid gap-8 sm:grid-cols-2">
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
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <FieldLabel eyebrow={STEPS[3].eyebrow} label={STEPS[3].label} hint={STEPS[3].hint} />
                  <Textarea
                    label="First passage"
                    placeholder="Write the opening. Leave a door open — someone should want to walk through it…\n\nMarkdown is welcome. Blank lines between paragraphs."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={20}
                    className="min-h-[360px]"
                  />
                  <div className="flex items-center justify-between text-[13px] text-secondary">
                    <span>{wordCount.toLocaleString()} words</span>
                    {wordCount < 60 && <span>{60 - wordCount} more to open the door</span>}
                  </div>
                </div>
              )}
            </section>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Button variant="outline" onClick={goBack} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <span className="text-sm text-secondary">
          Step {step + 1} of {STEPS.length}
        </span>
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext} disabled={!canNext}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={!ready || seed.isPending}
            onClick={() => seed.mutate()}
          >
            {seed.isPending ? "Seeding…" : "Seed the story"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      </motion.div>
    </div>
  );
}

function FieldLabel({ eyebrow, label, hint }: { eyebrow: string; label: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-[11px] text-gold">
          {eyebrow}
        </span>
        {label}
      </p>
      {hint && <p className="text-[13px] text-secondary pl-10">{hint}</p>}
    </div>
  );
}
