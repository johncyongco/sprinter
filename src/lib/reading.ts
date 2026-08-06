export const READING_WORDS_PER_MINUTE = 220;

export function countWords(text: string): number {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return 0;
  return cleaned.split(" ").filter(Boolean).length;
}

export function readingTime(words: number): string {
  const minutes = Math.max(1, Math.round(words / READING_WORDS_PER_MINUTE));
  return `${minutes} min`;
}

export function estimatePace(text: string): "Slow" | "Measured" | "Swift" {
  const sentences = text
    .split(/[.!?…]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return "Measured";
  const avgWordsPerSentence = countWords(text) / sentences.length;
  if (avgWordsPerSentence >= 22) return "Slow";
  if (avgWordsPerSentence >= 14) return "Measured";
  return "Swift";
}
