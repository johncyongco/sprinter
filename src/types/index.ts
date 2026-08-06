export type Genre =
  | "Literary Fiction"
  | "Fantasy"
  | "Sci-Fi"
  | "Mystery"
  | "Historical Fiction"
  | "Poetry"
  | "Romance"
  | "Horror"
  | "Memoir"
  | "Speculative"
  | "Catholic Fiction"
  | "Minimalist"
  | (string & {});

export type Perspective = "First" | "Second" | "Third" | "Epistolary";

export type Emotion =
  | "Yearning"
  | "Grief"
  | "Wonder"
  | "Stillness"
  | "Longing"
  | "Mercy"
  | "Dread"
  | "Hope"
  | "Reverence"
  | "Homesickness"
  | (string & {});

export type Theme =
  | "Home"
  | "Memory"
  | "Grace"
  | "Pilgrimage"
  | "Silence"
  | "Becoming"
  | "Thresholds"
  | "Redemption"
  | "The Sea"
  | "Faith"
  | "Letters"
  | "Roots"
  | (string & {});

export type Pacing = "Slow" | "Measured" | "Swift";

export type CompletionStatus = "Seed" | "Unfolding" | "Nearly Whole" | "Complete";

export type ContributionType =
  | "Continue"
  | "Dialogue"
  | "Flashback"
  | "Character Perspective"
  | "Opposing View"
  | "World Building"
  | "Foreshadowing"
  | "Rewrite"
  | "Different Ending"
  | "Poem"
  | "Letter"
  | "Monologue";

export interface Author {
  id: string;
  penName: string;
  avatar: string;
  bio: string;
  favoriteLine: string;
  genres: Genre[];
  joinedAt: string;
  stats: {
    storiesStarted: number;
    continuations: number;
    wordsAdded: number;
    critiques: number;
  };
}

export type WordCategory =
  | "Emotion"
  | "Nature"
  | "The Sacred"
  | "Body"
  | "Sound"
  | "Light"
  | "Time"
  | "Home"
  | "The Sea"
  | "Feeling";

export interface BeautifulWord {
  id: string;
  term: string;
  meaning: string;
  etymology?: string;
  category?: WordCategory;
  usageCount: number;
  contributors: number;
  popularity: number;
  related: string[];
}

export interface StoryWord {
  wordId: string;
  count: number;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  cover: string;
  seedAuthorId: string;
  genres: Genre[];
  emotion: Emotion[];
  themes: Theme[];
  perspective: Perspective;
  pacing: Pacing;
  status: CompletionStatus;
  createdAt: string;
  updatedAt: string;
  body: string;
  words: number;
  readingMinutes: number;
  beautifulWords: StoryWord[];
  completion: number;
  contributorIds: string[];
  branchCount: number;
  continuationCount: number;
  critiqueCount: number;
  isEditorialPick: boolean;
  isWeeklyPrompt: boolean;
  excerpt: string;
}

export interface BranchNode {
  id: string;
  storyId: string;
  parentId: string | null;
  type: ContributionType;
  authorId: string;
  title: string;
  body: string;
  words: number;
  beautifulWordIds: string[];
  createdAt: string;
  isSeed: boolean;
}

export type CritiqueScoreKey =
  | "emotion"
  | "logic"
  | "pacing"
  | "imagery"
  | "dialogue"
  | "originality"
  | "theme"
  | "ending";

export interface Critique {
  id: string;
  storyId: string;
  authorId: string;
  createdAt: string;
  scores: Record<CritiqueScoreKey, number>;
  reflection: string;
  isEditorial: boolean;
}

export type ChallengeKind =
  | "Daily Sprint"
  | "Weekly Prompt"
  | "Relay"
  | "Timed"
  | "Community";

export interface Challenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  prompt: string;
  wordLimit?: number;
  startsAt: string;
  endsAt: string;
  participants: number;
  featuredStoryId?: string;
  qualityNote?: string;
}

export interface Anthology {
  id: string;
  title: string;
  season: string;
  description: string;
  cover: string;
  storyIds: string[];
  featuredStoryIds: string[];
  topCritiqueIds: string[];
  publishedAt: string;
  theme: Theme;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  cover: string;
  curatorId: string | null;
  storyIds: string[];
  isCommunity: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  cover: string;
  memberCount: number;
  memberIds: string[];
  tags: string[];
  featuredStoryIds: string[];
  challengeIds: string[];
  discussion: DiscussionPost[];
}

export interface DiscussionPost {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export type NotificationKind =
  | "continuation"
  | "critique"
  | "relay"
  | "challenge"
  | "anthology"
  | "welcome";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  actorId?: string;
  storyId?: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface DraftReference {
  id: string;
  quote: string;
  source: string;
  nodeId: string | null;
}

export interface Draft {
  storyId: string;
  parentId: string | null;
  type: ContributionType;
  title: string;
  body: string;
  wordIds: string[];
  references?: DraftReference[];
  savedAt: string;
}

export interface Thought {
  id: string;
  storyId: string;
  authorId: string;
  content: string;
  quote?: string;
  createdAt: string;
}

export interface SearchResult {
  stories: Story[];
  authors: Author[];
  words: BeautifulWord[];
  collections: Collection[];
  anthologies: Anthology[];
  challenges: Challenge[];
  communities: Community[];
}

export interface WritingGoal {
  id: string;
  label: string;
  wordsPerSession: number;
}
