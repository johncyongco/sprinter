export type GuideObservationType = "question" | "note" | "suggestion";

export interface GuideObservation {
  type: GuideObservationType;
  point: string;
}

export interface GuideMetrics {
  words: number;
  sentences: number;
  avgSentence: number;
  longestSentence: number;
  passiveCount: number;
  dialogueLines: number;
  repeated: { word: string; count: number }[];
}

export interface GuideReview {
  provider: "local" | "ai";
  metrics: GuideMetrics;
  observations: GuideObservation[];
  generatedAt: string;
}

export interface GuideInput {
  text: string;
  title?: string;
  kind?: string;
  wordLimit?: number;
}

const AI_ENDPOINT = import.meta.env.VITE_AI_API_URL as string | undefined;

const STOP_WORDS = new Set(
  "a an the and or but if then so for of to in on at by with from into over under above below near as is was were are be been being it its this that these those i you he she we they them me him her my your his their our there here what when where who which how why do does did not no just like about have has had can could will would should may might than so too very really quite still".split(
    " ",
  ),
);

const PASSIVE_RE = /\b(was|were|is|are|been|being|get|got|gets)\s+\w+ed\b/i;

const TELL_RE =
  /\b(felt|seemed|looked|sounded|realized|knew that|noticed|appeared)\b/i;

const WEAK_OPENERS = ["there was", "there were", "it was", "it is", "this is", "he could see", "she could see"];

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function wordsOf(text: string): string[] {
  return text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
}

function longestSentence(sentences: string[]): number {
  return sentences.reduce((max, s) => Math.max(max, wordsOf(s).length), 0);
}

function repeatedWords(text: string): { word: string; count: number }[] {
  const freq = new Map<string, number>();
  for (const raw of text.toLowerCase().split(/\W+/)) {
    const word = raw.trim();
    if (word.length > 3 && !STOP_WORDS.has(word)) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .map(([word, count]) => ({ word, count }))
    .filter((r) => r.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

export function reviewWriting(input: GuideInput): Promise<GuideReview> {
  return AI_ENDPOINT ? reviewWithAi(input) : Promise.resolve(reviewLocally(input));
}

async function reviewWithAi(input: GuideInput): Promise<GuideReview> {
  try {
    const res = await fetch(AI_ENDPOINT!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input.text,
        title: input.title,
        kind: input.kind,
        wordLimit: input.wordLimit,
      }),
    });
    if (!res.ok) throw new Error(`Guide endpoint ${res.status}`);
    const data = (await res.json()) as {
      observations?: { type?: GuideObservationType; point?: string }[];
    };
    const observations = (data.observations ?? [])
      .filter((o) => typeof o.point === "string" && o.point.trim().length > 0)
      .map((o) => ({
        type: (o.type ?? "question") as GuideObservationType,
        point: o.point?.trim() ?? "",
      }))
      .slice(0, 6);
    if (observations.length > 0) {
      return { ...reviewLocally(input), provider: "ai", observations };
    }
  } catch {
    // fall through to the local coach
  }
  return reviewLocally(input);
}

export function reviewLocally(input: GuideInput): GuideReview {
  const text = input.text.trim();
  const words = wordsOf(text);
  const sentences = sentencesOf(text);
  const metrics: GuideMetrics = {
    words: words.length,
    sentences: sentences.length,
    avgSentence:
      sentences.length > 0
        ? Math.round(words.length / sentences.length)
        : 0,
    longestSentence: longestSentence(sentences),
    passiveCount: (text.match(PASSIVE_RE) ?? []).length,
    dialogueLines: (text.match(/[“"'].+?[”"']/g) ?? []).length,
    repeated: repeatedWords(text),
  };

  const observations: GuideObservation[] = [];

  if (metrics.words === 0) {
    return {
      provider: "local",
      metrics,
      observations: [
        {
          type: "question",
          point:
            "No words yet. If you had to write one sentence and no more — the sentence you would want a stranger to continue — what would it be?",
        },
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  const first = sentences[0]?.toLowerCase() ?? "";
  for (const opener of WEAK_OPENERS) {
    if (first.startsWith(opener)) {
      observations.push({
        type: "question",
        point: `You open with "${opener}". What is already moving at this exact moment — and could we begin there, in the action, instead of in the frame?`,
      });
      break;
    }
  }

  if (metrics.passiveCount > 0) {
    observations.push({
      type: "question",
      point: `A line does the verb to someone here (${metrics.passiveCount} passive construction${metrics.passiveCount > 1 ? "s" : ""}). Who is the one doing the thing — and what changes if they step to the front and take it directly?`,
    });
  }

  if (metrics.repeated.length > 0) {
    const top = metrics.repeated[0];
    observations.push({
      type: "question",
      point: `"${top.word}" returns ${top.count} times. Is that a deliberate echo you want the reader to hear — or is a more exact, more surprising image hiding in its place?`,
    });
  }

  if (metrics.sentences >= 4 && metrics.avgSentence >= 10 && metrics.avgSentence <= 22) {
    const lens = sentences.map((s) => wordsOf(s).length);
    const spread = Math.max(...lens) - Math.min(...lens);
    if (spread <= 8) {
      observations.push({
        type: "note",
        point: `Your sentences move at nearly one rhythm (averaging ${metrics.avgSentence} words each). Where might a short, blunt sentence break the tide — and what would it make the reader feel?`,
      });
    }
  }

  if (metrics.longestSentence > 40) {
    observations.push({
      type: "suggestion",
      point: `One sentence runs ${metrics.longestSentence} words long. It may be carrying two moments — where does it break, and what breathes there?`,
    });
  }

  if (metrics.dialogueLines >= 2) {
    observations.push({
      type: "note",
      point: `You have voices in the room. Between the lines, what do the hands, the light, the silence do? Let the scene speak around the talk.`,
    });
  }

  if (TELL_RE.test(text)) {
    observations.push({
      type: "question",
      point: `Somewhere you tell us what a character feels or understands. If you showed only what the reader could watch from across the room, how would the feeling arrive instead?`,
    });
  }

  if (typeof input.wordLimit === "number" && metrics.words > input.wordLimit) {
    observations.push({
      type: "note",
      point: `You are ${metrics.words - input.wordLimit} words over the ${input.wordLimit}-word ceiling. What is the one image that could carry all the others?`,
    });
  }

  if (metrics.words >= 60 && observations.length < 4) {
    observations.push({
      type: "question",
      point: `By the last line, what has changed? Leave the next writer a door that is open but not yet walked through.`,
    });
  }

  if (observations.length === 0) {
    observations.push({
      type: "question",
      point: `What does this opening want most — a question answered, a risk taken, or a silence honored?`,
    });
  }

  return {
    provider: "local",
    metrics,
    observations: observations.slice(0, 6),
    generatedAt: new Date().toISOString(),
  };
}
