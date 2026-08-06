import type {
  Author,
  BeautifulWord,
  BranchNode,
  Collection,
  Community,
  Challenge,
  Critique,
  Anthology,
  AppNotification,
  Story,
  Genre,
  Thought,
} from "@/types";

export { delay } from "./client";

/* ============================================================
   Sprinter — in-memory seed library
   A quiet place. Someone is always waiting for your sentence.
   ============================================================ */

export const AUTHORS: Author[] = [
  {
    id: "a1",
    penName: "Eleanor Voss",
    avatar: "EV",
    bio: "I write to leave doors ajar.",
    favoriteLine: "Every unsent letter is a kind of prayer.",
    genres: ["Literary Fiction", "Historical Fiction"],
    joinedAt: "2024-03-11",
    stats: { storiesStarted: 4, continuations: 12, wordsAdded: 9800, critiques: 9 },
  },
  {
    id: "a2",
    penName: "Marek Aldous",
    avatar: "MA",
    bio: "Every mirror is a threshold. Walk through it.",
    favoriteLine: "The road appeared the moment he admitted he was lost.",
    genres: ["Fantasy", "Speculative"],
    joinedAt: "2024-06-02",
    stats: { storiesStarted: 6, continuations: 21, wordsAdded: 14200, critiques: 5 },
  },
  {
    id: "a3",
    penName: "Ivy Calloway",
    avatar: "IC",
    bio: "Grief is a slow river. I row it in paragraphs.",
    favoriteLine: "We do not recover from winter; we learn its grammar.",
    genres: ["Poetry", "Memoir"],
    joinedAt: "2024-08-19",
    stats: { storiesStarted: 3, continuations: 9, wordsAdded: 6100, critiques: 14 },
  },
  {
    id: "a4",
    penName: "Soren Whit",
    avatar: "SW",
    bio: "Say less. Mean more.",
    favoriteLine: "The river did not answer, but it kept everything.",
    genres: ["Mystery", "Minimalist"],
    joinedAt: "2024-10-04",
    stats: { storiesStarted: 5, continuations: 17, wordsAdded: 7300, critiques: 11 },
  },
  {
    id: "a5",
    penName: "Amara Cole",
    avatar: "AC",
    bio: "Writing toward the light that waits behind the marble.",
    favoriteLine: "Mercy is a door with no handle, opening inward.",
    genres: ["Catholic Fiction", "Historical Fiction"],
    joinedAt: "2025-01-15",
    stats: { storiesStarted: 3, continuations: 8, wordsAdded: 5200, critiques: 6 },
  },
  {
    id: "a6",
    penName: "Theo March",
    avatar: "TM",
    bio: "A romantic who builds starships.",
    favoriteLine: "She kept a fragment of her shattered hour in a locket.",
    genres: ["Sci-Fi", "Romance"],
    joinedAt: "2025-02-27",
    stats: { storiesStarted: 4, continuations: 13, wordsAdded: 8800, critiques: 4 },
  },
  {
    id: "a7",
    penName: "Naomi Reyes",
    avatar: "NR",
    bio: "I write about the places people leave.",
    favoriteLine: "Home was never a house; it was a person's voice.",
    genres: ["Literary Fiction"],
    joinedAt: "2025-04-09",
    stats: { storiesStarted: 3, continuations: 11, wordsAdded: 6900, critiques: 7 },
  },
  {
    id: "a8",
    penName: "Bram Holloway",
    avatar: "BH",
    bio: "I keep the lights on while I write about the dark.",
    favoriteLine: "The house remembered them long after they forgot it.",
    genres: ["Horror", "Speculative"],
    joinedAt: "2025-05-21",
    stats: { storiesStarted: 4, continuations: 15, wordsAdded: 10400, critiques: 3 },
  },
  {
    id: "me",
    penName: "Your Pen Name",
    avatar: "Y",
    bio: "A writer finding the way back to sentences.",
    favoriteLine: "Someone is always waiting for your next sentence.",
    genres: [],
    joinedAt: "2026-01-01",
    stats: { storiesStarted: 0, continuations: 1, wordsAdded: 96, critiques: 1 },
  },
];

export const VAULT: BeautifulWord[] = [
  {
    id: "w-yr",
    term: "Yearning",
    meaning: "A quiet ache toward something you cannot quite name.",
    etymology: "Old English giernan — to long for, to desire with the whole body.",
    usageCount: 214,
    contributors: 88,
    popularity: 96,
    related: ["Sehnsucht", "Longing", "Threshold", "Homesickness"],
  },
  {
    id: "w-sehn",
    term: "Sehnsucht",
    meaning: "The ache for a place you have never been, a life you have not lived.",
    etymology: "German — das Sehnen (longing) + die Sucht (addiction).",
    usageCount: 97,
    contributors: 41,
    popularity: 84,
    related: ["Yearning", "Pilgrim", "Threshold"],
  },
  {
    id: "w-thr",
    term: "Threshold",
    meaning: "The edge of one world and the beginning of another.",
    etymology: "Old English therscold — the sill where the threshing happened, the line between inside and out.",
    usageCount: 172,
    contributors: 73,
    popularity: 91,
    related: ["Liminal", "Door", "Home"],
  },
  {
    id: "w-lim",
    term: "Liminal",
    meaning: "Occupying the doorway; neither here nor gone.",
    etymology: "Latin limen — threshold.",
    usageCount: 121,
    contributors: 52,
    popularity: 87,
    related: ["Threshold", "Silence", "Pilgrim"],
  },
  {
    id: "w-mrc",
    term: "Mercy",
    meaning: "Kindness that arrives unearned, and stays.",
    etymology: "Latin merces — payment; the one debt that pardons the debtor.",
    usageCount: 143,
    contributors: 60,
    popularity: 89,
    related: ["Grace", "Redemption", "Dust"],
  },
  {
    id: "w-dst",
    term: "Dust",
    meaning: "What we are told we are; what the light makes visible.",
    etymology: "Old English dust — fine particles, ashes, the earth returning.",
    usageCount: 158,
    contributors: 66,
    popularity: 86,
    related: ["Mercy", "Memory", "Home"],
  },
  {
    id: "w-hom",
    term: "Home",
    meaning: "A place that exists mostly in leaving and returning.",
    etymology: "Old English hām — dwelling, village, the hearth-lit center.",
    usageCount: 231,
    contributors: 97,
    popularity: 98,
    related: ["Threshold", "Memory", "Roots"],
  },
  {
    id: "w-mem",
    term: "Memory",
    meaning: "The only country we carry.",
    etymology: "Latin memoria — the faculty of keeping the present past.",
    usageCount: 205,
    contributors: 84,
    popularity: 95,
    related: ["Home", "Dust", "Silence"],
  },
  {
    id: "w-pil",
    term: "Pilgrim",
    meaning: "One who travels toward something sacred and unfinished.",
    etymology: "Latin peregrinus — foreigner; one who walks through foreign fields.",
    usageCount: 134,
    contributors: 57,
    popularity: 88,
    related: ["Sehnsucht", "Threshold", "Road"],
  },
  {
    id: "w-sil",
    term: "Silence",
    meaning: "The grammar the heart speaks in when words run out.",
    etymology: "Latin silentium — the hush after the last word.",
    usageCount: 189,
    contributors: 79,
    popularity: 93,
    related: ["Stillness", "Memory", "Threshold"],
  },
  {
    id: "w-gra",
    term: "Grace",
    meaning: "Beauty that costs nothing and saves anyway.",
    etymology: "Latin gratia — favor, thanks, the unearned.",
    usageCount: 126,
    contributors: 51,
    popularity: 85,
    related: ["Mercy", "Light", "Reverence"],
  },
  {
    id: "w-emb",
    term: "Ember",
    meaning: "A small fire pretending to be dying.",
    etymology: "Old English ǣmerge — the last red of the hearth.",
    usageCount: 88,
    contributors: 36,
    popularity: 78,
    related: ["Dust", "Home", "Light"],
  },
  {
    id: "w-tet",
    term: "Tether",
    meaning: "The long invisible line between two people.",
    etymology: "Middle English teder — a rope for what must not drift.",
    usageCount: 74,
    contributors: 30,
    popularity: 72,
    related: ["Home", "Memory", "Longing"],
  },
  {
    id: "w-ves",
    term: "Vessel",
    meaning: "A hollow thing made to be filled.",
    etymology: "Latin vasculum — small dish; the body as a cup.",
    usageCount: 95,
    contributors: 42,
    popularity: 80,
    related: ["Grace", "Dust", "Voyage"],
  },
  {
    id: "w-rev",
    term: "Reverie",
    meaning: "Daydreaming with your eyes on the horizon.",
    etymology: "French rêverie — the wanderings of the mind.",
    usageCount: 69,
    contributors: 27,
    popularity: 70,
    related: ["Memory", "Yearning", "Stillness"],
  },
  {
    id: "w-san",
    term: "Sanctuary",
    meaning: "A quiet kept by others so you can rest.",
    etymology: "Latin sanctuarium — a holy place, a place of refuge.",
    usageCount: 82,
    contributors: 34,
    popularity: 77,
    related: ["Mercy", "Home", "Silence"],
  },
  {
    id: "w-sti",
    term: "Stillness",
    meaning: "Motion that has remembered its purpose.",
    etymology: "Old English stille — unmoving, at rest, yet full.",
    usageCount: 101,
    contributors: 44,
    popularity: 82,
    related: ["Silence", "Mercy", "Threshold"],
  },
  {
    id: "w-lum",
    term: "Luminous",
    meaning: "Carrying its own small light in a dark room.",
    etymology: "Latin lumen — light; the window at dusk.",
    usageCount: 110,
    contributors: 47,
    popularity: 83,
    related: ["Grace", "Ember", "Light"],
  },
];

/* ---------- cover art (deterministic, generated) ---------- */

const PALETTES: [string, string, string][] = [
  ["#B89B67", "#F6F4EF", "#5F7384"],
  ["#5F7384", "#F6F4EF", "#B89B67"],
  ["#AF6A6A", "#F6F4EF", "#8B9C7B"],
  ["#8B9C7B", "#F6F4EF", "#B89B67"],
  ["#69655F", "#F6F4EF", "#C69C5A"],
  ["#C69C5A", "#F6F4EF", "#5F7384"],
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function makeCover(seed: string): string {
  const h = hash(seed);
  const [a, b, c] = PALETTES[h % PALETTES.length];
  const cx = 140 + (h % 420);
  const cy = 90 + (h % 300);
  const r = 220 + (h % 180);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='640' viewBox='0 0 900 640'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${b}'/><stop offset='1' stop-color='${a}'/></linearGradient><radialGradient id='h' cx='0.55' cy='0.35' r='0.9'><stop offset='0' stop-color='${b}' stop-opacity='0.9'/><stop offset='1' stop-color='${a}' stop-opacity='0'/></radialGradient></defs><rect width='900' height='640' fill='url(#g)'/><circle cx='${cx}' cy='${cy}' r='${r}' fill='url(#h)'/><path d='M0 520 Q 300 460 900 540 L900 640 L0 640 Z' fill='${c}' opacity='0.16'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ---------- seed stories ---------- */

interface Seed {
  title: string;
  authorId: string;
  genres: Genre[];
  emotion: Story["emotion"];
  themes: Story["themes"];
  perspective: Story["perspective"];
  pacing: Story["pacing"];
  status: Story["status"];
  createdAt: string;
  updatedAt: string;
  body: string;
  beautifulWords: Story["beautifulWords"];
  completion: number;
  isEditorialPick: boolean;
  isWeeklyPrompt: boolean;
}

const SEEDS: Seed[] = [
  {
    title: "Letters Never Sent",
    authorId: "a1",
    genres: ["Literary Fiction", "Historical Fiction"],
    emotion: ["Longing", "Yearning"],
    themes: ["Letters", "Memory", "Home"],
    perspective: "Epistolary",
    pacing: "Slow",
    status: "Unfolding",
    createdAt: "2026-05-02",
    updatedAt: "2026-07-28",
    completion: 34,
    isEditorialPick: true,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-yr", count: 4 },
      { wordId: "w-mem", count: 3 },
      { wordId: "w-hom", count: 2 },
      { wordId: "w-sil", count: 2 },
    ],
    body: `The letters were in a hatbox on the top shelf of the wardrobe, beneath a blanket that smelled of cedar and the particular dust of things kept too long. My grandmother never threw anything away, and so the world came to her in layers — I had learned to read her life the way one reads sediment.

    There were forty-three of them, tied with kitchen twine, addressed to a man whose name I did not recognize. Dear Thomas, each one began, and then the body of the letter would wander the way she wandered, through the weather, through the garden, through the small mercies of a Tuesday. She wrote about bread rising. She wrote about the heron that came to the pond every evening at the same hour. She wrote about me, years before I was born, as someone she hoped would exist.

    None of them were ever posted. The stamps were still on the upper corners, and the addresses had been written in ink that had gone the color of old blood. I sat on the floor of her bedroom with the box in my lap and I read every one of them, and I began to understand that there are letters you write and letters you keep, and both are forms of praying.

    The last one was dated three weeks before she died. Dear Thomas, it said. I have kept your letters too.`,
  },
  {
    title: "The Pilgrim's Suitcase",
    authorId: "a2",
    genres: ["Fantasy", "Speculative"],
    emotion: ["Yearning", "Wonder"],
    themes: ["Pilgrimage", "Thresholds", "Becoming"],
    perspective: "Third",
    pacing: "Measured",
    status: "Unfolding",
    createdAt: "2026-05-14",
    updatedAt: "2026-07-20",
    completion: 41,
    isEditorialPick: true,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-pil", count: 5 },
      { wordId: "w-thr", count: 3 },
      { wordId: "w-lim", count: 2 },
    ],
    body: `The road to Saint Auriel's appeared only to those who carried something unfinished, and it ran, everyone knew, in the direction of the heart.

    He learned this the way pilgrims learned everything — by setting out wrong. Elias packed a suitcase the way you pack for certainty: socks rolled into columns, a razor, money sewn into the lining. And the suitcase grew heavier with every honest step, until he understood what he was carrying was not clothing but every sentence he had not yet said to his father, and that the weight was not a punishment but a clue.

    At the second village a woman with a face like a closed book handed him a stone. Carry this as far as the gate, she said. It will remember you. He asked which gate. She smiled the way people smile when the answer is obvious. The one you have been circling, she said. The one inside the suitcase.`,
  },
  {
    title: "What the River Kept",
    authorId: "a4",
    genres: ["Mystery", "Minimalist"],
    emotion: ["Stillness", "Grief"],
    themes: ["Memory", "Silence", "The Sea"],
    perspective: "Third",
    pacing: "Slow",
    status: "Seed",
    createdAt: "2026-06-01",
    updatedAt: "2026-07-31",
    completion: 12,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-sil", count: 4 },
      { wordId: "w-mem", count: 2 },
      { wordId: "w-dst", count: 2 },
    ],
    body: `The river kept everything. That was what the old men said, and the old men had been saying it for so long that the river had learned to keep that too.

    Mira came home because of the photograph — a Polaroid, water-swollen, that had surfaced in a fisherman's net three towns downstream. Her brother Tomas had been in the river fourteen years, and in the photograph he was nine, standing on the bank where she had seen him last, holding up a fish that was already too heavy for him, grinning like the light was on him.

    She stood on that bank now and the water did not look like water. It looked like time pretending to be water. She had brought his coat. It was what you did. You brought the coat and you waited, because the river kept everything, and everything meant him.`,
  },
  {
    title: "The Bookshop at the End of the Street",
    authorId: "a7",
    genres: ["Literary Fiction"],
    emotion: ["Wonder", "Longing"],
    themes: ["Thresholds", "Home", "Becoming"],
    perspective: "First",
    pacing: "Slow",
    status: "Unfolding",
    createdAt: "2026-06-12",
    updatedAt: "2026-07-22",
    completion: 38,
    isEditorialPick: true,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-thr", count: 3 },
      { wordId: "w-hom", count: 3 },
      { wordId: "w-rev", count: 2 },
    ],
    body: `I had walked past the bookshop a hundred times without seeing it, which is how you know a bookshop is real.

    The bell above the door did not ring so much as remember a sound it had heard long ago. Inside, the light was the color of afternoon tea, and every book was turned spine-in, so you could not tell what you were reaching for. "That's the point," said the man at the counter. He was reading something upside down, or pretending to. "People come in here asking for the book they want. They leave with the one they need."

    I had come in out of the rain, needing nothing, wanting everything — the way you do the year you turn thirty and the apartment begins to feel like a waiting room. He set a book on the counter without looking up. It was not wrapped. It had my name in the margin, in my handwriting, which I had not written yet.

    "You're late," he said, "but the book doesn't mind."`,
  },
  {
    title: "A Door in the Cathedral",
    authorId: "a5",
    genres: ["Catholic Fiction", "Historical Fiction"],
    emotion: ["Reverence", "Mercy"],
    themes: ["Faith", "Grace", "Thresholds"],
    perspective: "Third",
    pacing: "Slow",
    status: "Unfolding",
    createdAt: "2026-06-18",
    updatedAt: "2026-07-25",
    completion: 29,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-mrc", count: 4 },
      { wordId: "w-gra", count: 3 },
      { wordId: "w-san", count: 2 },
    ],
    body: `The door had no handle. That was the first thing the mason's apprentice noticed, and the last thing he could forget.

    It stood in a recess of the north aisle where the light arrived late and left early, set into a wall that the plans — he had checked them twice — said should be solid stone. No frame, no hinges, no keyhole. Just a door, worn smooth at the height of a hand, the grain of the wood rising like water in a river you could not see.

    "Don't touch it," said Master Erhart, who had seen forty years of stone. "There are doors in cathedrals that are not for opening. They are for remembering that something waits." The boy pressed his palm flat against the wood anyway, and the wood was warm, and beneath the warmth it gave, like something breathing in its sleep.

    The door did not open. But that night, in the dark of his cot, the boy felt the shape of a handle pressed into his hand, exactly where the door had been.`,
  },
  {
    title: "The Winter Orchard",
    authorId: "a3",
    genres: ["Poetry", "Memoir"],
    emotion: ["Grief", "Homesickness"],
    themes: ["Home", "Roots", "Memory"],
    perspective: "First",
    pacing: "Measured",
    status: "Seed",
    createdAt: "2026-06-24",
    updatedAt: "2026-08-01",
    completion: 9,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-dst", count: 3 },
      { wordId: "w-hom", count: 4 },
      { wordId: "w-sti", count: 2 },
    ],
    body: `I came home in January because my father had died, and the orchard was the only thing he had left me that could not be sold.

    The trees stood in the snow like the unheeded advice of an older woman. My father had planted them in a row — apples, mostly, with one pear that never bore fruit and that he never stopped apologizing for. I had hated this place for the smallness of it. I had left for a city where no one knew my name and the light did not arrive early, and I had learned, the way you learn in rooms with too many windows, that you can leave a place without leaving it.

    The ground was frozen to the depth of his stubbornness. The shovel rang against it like a struck bell. I was going to bury him where the pear tree would never bloom, because that was the last joke we had between us, and someone had to be there to tell it.`,
  },
  {
    title: "Salt & Silk",
    authorId: "a6",
    genres: ["Romance", "Historical Fiction"],
    emotion: ["Longing", "Hope"],
    themes: ["Letters", "The Sea", "Becoming"],
    perspective: "Third",
    pacing: "Measured",
    status: "Unfolding",
    createdAt: "2026-07-03",
    updatedAt: "2026-07-30",
    completion: 45,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-sehn", count: 3 },
      { wordId: "w-tet", count: 2 },
      { wordId: "w-ves", count: 2 },
    ],
    body: `The letter arrived wrapped in oilskin and tied with a thread of silk the color of the sea at evening, and it was addressed to no one.

    Isabeau found it wedged between two rocks on the north shore, where the tides came in with their hands full of the world. The ink had run but the hand was patient. It told of a town across the bay where the ships had stopped coming, and of a woman who rang the bell at the harbor every dusk for a husband who had promised to return with the swallows.

    The letter ended mid-sentence, in the middle of a word — the way you write when the light fails. Isabeau read it four times. Then she went home and wrote an answer, tied it in the same silk, and gave it to the sea on the morning tide. She did not know his name. She knew the color of his sentence, and it had come looking for her.

    The sea is not a reliable postman, but it is patient, and patience is a kind of reply.`,
  },
  {
    title: "The Glass Hour",
    authorId: "a6",
    genres: ["Sci-Fi", "Speculative"],
    emotion: ["Wonder", "Dread"],
    themes: ["Becoming", "Thresholds", "Memory"],
    perspective: "Third",
    pacing: "Swift",
    status: "Unfolding",
    createdAt: "2026-07-08",
    updatedAt: "2026-07-29",
    completion: 27,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-thr", count: 3 },
      { wordId: "w-mem", count: 2 },
      { wordId: "w-lim", count: 2 },
    ],
    body: `In the town of Vell, time was a material. You could hold your own hour, the way you held a glass of water, and when you died the glass shattered — which is why, on the day the clockmaker's daughter heard a hairline crack inside her chest, the whole town fell quiet.

    Ena had been trained since childhood to listen to the clockwork of others. She could hear a lie in the uneven tick of a man's hour, a birth in the sudden chime. Her own hour had kept perfect time for twenty years, steady as a metronome, and then — last Tuesday, at the moment the swallows turned — it had cracked.

    The doctor said nothing was wrong. The doctor's hour, she noted, ticked a little faster when he said it. She went to the workshop where her father had kept the tools of the trade: the calipers for measuring stolen time, the files for reshaping the hours of the unworthy. And she understood, with the clarity of someone hearing her own glass, that the crack was not a break.

    It was a door.`,
  },
  {
    title: "Beneath the Sea of Dust",
    authorId: "a2",
    genres: ["Fantasy", "Speculative"],
    emotion: ["Mercy", "Stillness"],
    themes: ["Redemption", "Silence", "Becoming"],
    perspective: "Third",
    pacing: "Slow",
    status: "Seed",
    createdAt: "2026-07-11",
    updatedAt: "2026-08-02",
    completion: 16,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-dst", count: 5 },
      { wordId: "w-mrc", count: 3 },
      { wordId: "w-sil", count: 2 },
    ],
    body: `The keeper walked the desert with a listening iron, and when it rang he knelt and began to dig, because the bells were down there, and the bells were questions.

    They had buried them — the whole city had buried them — in the last season of the old war, when the only way to keep a thing safe was to hide it from everyone, including yourself. Now the dunes had a memory of their own, and the wind moved them, and every time the wind moved a city's worth of sound shifted one layer closer to the surface.

    He was the seventh keeper, and he had been at it eleven years, and in eleven years he had raised nineteen bells. Each one he cleaned with his own hands, oiled, and set in the long row behind the hut. The row stood in the silence like a question that had decided to wait. He did not know what the bells would say when they were all above ground. He only knew his iron had not stopped ringing.`,
  },
  {
    title: "The House That Remembers",
    authorId: "a8",
    genres: ["Horror", "Speculative"],
    emotion: ["Dread", "Grief"],
    themes: ["Memory", "Silence", "Home"],
    perspective: "First",
    pacing: "Slow",
    status: "Unfolding",
    createdAt: "2026-07-15",
    updatedAt: "2026-08-03",
    completion: 22,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-mem", count: 4 },
      { wordId: "w-sil", count: 3 },
      { wordId: "w-hom", count: 2 },
    ],
    body: `The house remembered the family before us. That was the thing the realtor did not say and the neighbors hinted at with their eyes.

    At first it was ordinary — the creak of a floorboard rehearsing someone's step, the cold spot at the top of the stairs where a child had stood. My wife laughed at me for checking the locks twice. My daughter said the wallpaper in her room changed color when she looked away, which we decided was the light, which we decided was tiredness.

    Then I found the drawer. It was behind the paneling in the study, and it had been built to be found eventually — that was the terrible part, the intent of it. Inside: a child's mitten, a photograph of people I did not recognize standing on a porch that was this porch, and a diary whose first page read We are leaving tomorrow. We are leaving tomorrow is written eleven times, in a hand that got steadier as it got darker, and then it stopped.

    The house remembers. I have begun to understand that it wants us to remember with it.`,
  },
  {
    title: "The First Snow",
    authorId: "a3",
    genres: ["Literary Fiction"],
    emotion: ["Stillness", "Wonder"],
    themes: ["Home", "Memory", "Silence"],
    perspective: "First",
    pacing: "Measured",
    status: "Unfolding",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-04",
    completion: 20,
    isEditorialPick: false,
    isWeeklyPrompt: true,
    beautifulWords: [
      { wordId: "w-sti", count: 3 },
      { wordId: "w-sil", count: 2 },
      { wordId: "w-hom", count: 2 },
    ],
    body: `The first snow is a rumor that keeps its word. It had been predicted for three days, and the town had spent those days the way towns do before weather — carrying on, glancing up, pretending not to wait.

    It arrived after supper, without announcement, the way the best visitors do. My mother was at the window with her tea and she said it without turning: "It's here." And the whole house leaned toward the glass, and the street went soft, and the light that had been fading all day came back, reflected, doubled, forgiving.

    I went out into it because that is what you do with a first snow — you go out to be met by it. It was not cold the way it would be by March. It was cold the way a held hand is cold, the way a pause is cold. It settled on the porch rail and the mailbox and the crown of the old pear tree, and it made the whole street look like a sentence someone had finally finished.

    I stood there until my hands went white. When I came in, my mother had made cocoa without being asked, and she did not ask where I had been. She knew. The first snow had come for both of us, and it had said what it came to say.

    It said: rest.`,
  },
  {
    title: "The Exchange",
    authorId: "a2",
    genres: ["Speculative", "Literary Fiction"],
    emotion: ["Yearning", "Hope"],
    themes: ["Becoming", "Thresholds", "Redemption"],
    perspective: "Second",
    pacing: "Measured",
    status: "Unfolding",
    createdAt: "2026-07-27",
    updatedAt: "2026-08-05",
    completion: 55,
    isEditorialPick: false,
    isWeeklyPrompt: false,
    beautifulWords: [
      { wordId: "w-thr", count: 3 },
      { wordId: "w-sehn", count: 2 },
      { wordId: "w-lim", count: 2 },
    ],
    body: `The Exchange was not a building. It was a house rule, a law of the town you came to when you had traded away everything you could afford to lose.

    You arrive at the counter — everyone arrives at the counter eventually — and the clerk (there is only ever one, and they are always the same person, and they are always you) slides a ledger across. In the ledger, your life is written in two columns: what you gave, what you kept. You are not allowed to read the second column.

    The rule is simple. You may trade one memory for one hour. You may trade one hour for one memory. Nobody ever trades the same thing twice. The clerk watches you do the math — the terrible arithmetic of a person who has lost count of what matters.

    Tonight, the clerk is holding a ledger with your name on it, and the ledger is open, and the pen is warm, and the counter is lit by a lamp that burns the color of held breath. Someone is waiting to see what you'll give. It might be the only thing they've ever needed.`,
  },
];

export const STORIES: Story[] = SEEDS.map((s, i) => {
  const words = s.body.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  return {
    id: `st-${100 + i}`,
    title: s.title,
    slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    cover: makeCover(s.title),
    seedAuthorId: s.authorId,
    genres: s.genres,
    emotion: s.emotion,
    themes: s.themes,
    perspective: s.perspective,
    pacing: s.pacing,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    body: s.body,
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    beautifulWords: s.beautifulWords,
    completion: s.completion,
    contributorIds: [],
    branchCount: 0,
    continuationCount: 0,
    critiqueCount: 0,
    isEditorialPick: s.isEditorialPick,
    isWeeklyPrompt: s.isWeeklyPrompt,
    excerpt: s.body.split(/\s+/).slice(0, 42).join(" ") + "…",
  };
});

/* ---------- branch tree (continuations) ---------- */

interface SeedNode {
  story: number;
  id: string;
  parent: string | null;
  type: BranchNode["type"];
  author: string;
  title: string;
  body: string;
  wordIds?: string[];
  createdAt: string;
}

const NODE_BODIES: SeedNode[] = [
  {
    story: 0,
    id: "n-001",
    parent: null,
    type: "Letter",
    author: "a3",
    title: "A Letter of My Own",
    body: `I have read them all now, and I have written my own. Dear Thomas — though I think I understand, at last, that you were never the one she was writing to. You were the address she kept so the letters would have somewhere to go. I am putting the hatbox in the attic where the light is good. Some letters should be kept where they can be read slowly.`,
    wordIds: ["w-yr", "w-mem"],
    createdAt: "2026-05-06",
  },
  {
    story: 0,
    id: "n-002",
    parent: null,
    type: "Flashback",
    author: "a1",
    title: "1934: The Ferry",
    body: `He had been at the rail when she saw him, and she had decided in that one moment — the way the young decide — that this was the whole story. He was leaving. She stayed. That was the entire arithmetic of it, and she never revised it, only added to it, for fifty years.`,
    wordIds: ["w-yr", "w-sehn"],
    createdAt: "2026-06-14",
  },
  {
    story: 1,
    id: "n-010",
    parent: null,
    type: "Continue",
    author: "a2",
    title: "The Gate at the Second Village",
    body: `The gate, when he finally found it, was a gate the way a held breath is a gate — it did not swing, it gave. He stepped through still holding the stone, and the stone was lighter, and he understood that she had not given it to him to weigh him down but to remember him, which is the only way anyone is carried across a threshold.`,
    wordIds: ["w-thr", "w-lim", "w-pil"],
    createdAt: "2026-05-18",
  },
  {
    story: 1,
    id: "n-011",
    parent: null,
    type: "Foreshadowing",
    author: "a8",
    title: "What the Suitcase Said Back",
    body: `That night the suitcase spoke. Not in words — in the particular silence of a thing that has been carrying you and is now deciding whether to keep going. Elias lay in the dark and listened to the leather creak like a ship settling, and he knew the road had not chosen him. It had only been waiting, which is the more patient form of choosing.`,
    wordIds: ["w-lim", "w-sil"],
    createdAt: "2026-06-02",
  },
  {
    story: 2,
    id: "n-020",
    parent: null,
    type: "Continue",
    author: "a4",
    title: "The Coat",
    body: `She threw the coat in where the current ran deepest. It did not sink the way things sink when they are heavy; it sank the way things sink when they are loved, slowly, arguing. The river took it and held it, and for a moment the whole water went still, the way a person goes still when they are finally handed the thing they have been carrying.`,
    wordIds: ["w-sil", "w-mem"],
    createdAt: "2026-06-03",
  },
  {
    story: 2,
    id: "n-021",
    parent: null,
    type: "Character Perspective",
    author: "a7",
    title: "The Fisherman",
    body: `He had caught the photograph in his net three towns downstream, and he had almost thrown it back — it was ruined, water-swollen, no good to anyone. But there was a boy in it, holding up a fish too heavy for him, grinning like the light was on him. You do not throw that back. You take it to the river, and you wait for whoever it belongs to.`,
    wordIds: ["w-mem", "w-mrc"],
    createdAt: "2026-07-01",
  },
  {
    story: 3,
    id: "n-030",
    parent: null,
    type: "Continue",
    author: "a7",
    title: "The Margin",
    body: `The handwriting in the margin was mine, but the ink was old, and the book was a book I had never read, and the sentence said — in the margin, beside a passage about a woman learning to stay — you will come back to this. I closed it. I opened it again. The light in the shop had gone the color of held tea. The man at the counter had not moved. "You're late," he said again, softly. "But the book doesn't mind."`,
    wordIds: ["w-thr", "w-hom"],
    createdAt: "2026-06-15",
  },
  {
    story: 3,
    id: "n-031",
    parent: null,
    type: "Poem",
    author: "a3",
    title: "The Bookshop (a poem)",
    body: `A bell that remembers a sound. / Books that sleep spine-in like the shy. / And my own hand, writing to me / from a margin I have not reached yet, / saying: come home, slowly, / the book will wait, / the rain will wait, / the door is not lost — / it has only been waiting / to be needed.`,
    wordIds: ["w-rev", "w-hom"],
    createdAt: "2026-07-05",
  },
  {
    story: 4,
    id: "n-040",
    parent: null,
    type: "Continue",
    author: "a5",
    title: "The Warmth in the Stone",
    body: `He told Master Erhart the next morning. He did not say it like a boy telling a tale; he said it like a man reporting what he had found in a wall. The master was quiet a long time. Then he set down his chisel and walked the north aisle with the boy, and he put his own hand against the door, and the door gave under his palm the same way it had given for the boy, and the master wept. "I have been building this door," he said, "for forty years. I never knew it was the other way around."`,
    wordIds: ["w-mrc", "w-san"],
    createdAt: "2026-06-20",
  },
  {
    story: 4,
    id: "n-041",
    parent: null,
    type: "Different Ending",
    author: "a8",
    title: "What Was Behind the Door",
    body: `It was a room, and in the room was nothing, and the nothing was warm, and the door stood open behind them because the door was done. Master Erhart walked in first. He knelt, because that was what you did in that room. When the boy looked back, the door had gone smooth again where their hands had been, and both their names were in the wood, raised like scars, the way names are raised on the inside of a ring.`,
    wordIds: ["w-san", "w-gra"],
    createdAt: "2026-07-18",
  },
  {
    story: 6,
    id: "n-060",
    parent: null,
    type: "Continue",
    author: "a6",
    title: "The Answer, Sent",
    body: `The sea is not a reliable postman, but it is patient. His answer came back on a Tuesday, tied in the same silk, the color now of the sea at morning. Isabeau, it said — for he had learned her name from the tide — I am the bell that rings at dusk. I did not know anyone was listening. Tell me what the swallows do in your town. I have a husband's absence to trade for it, and I have kept it well.`,
    wordIds: ["w-sehn", "w-tet"],
    createdAt: "2026-07-04",
  },
  {
    story: 6,
    id: "n-061",
    parent: null,
    type: "Monologue",
    author: "a1",
    title: "The Widow at the Bell",
    body: `She rang the bell at the harbor every dusk, and she had done it so long that the town had stopped asking and started listening. People said she was waiting for a ship. She was not. She was holding the sound open, the way you hold a door for someone who is a long way off and walking slowly, so that when he finally came the whole town would ring, and he would know he was home.`,
    wordIds: ["w-sehn", "w-hom"],
    createdAt: "2026-07-21",
  },
  {
    story: 7,
    id: "n-070",
    parent: null,
    type: "Continue",
    author: "a6",
    title: "The First Hour on the Anvil",
    body: `She took the crack to the forge, because her father had believed that an hour could be mended — not hidden, mended, which was the harder work. The fire did not melt the glass; the fire taught it. She worked the crack the way you work a bell, and when it was done she held up her hour and it was not the same hour it had been. It was louder. It was truer. It rang, and the whole town of Vell turned, because the clockmaker's daughter was ringing like a clock that had finally learned what it was for.`,
    wordIds: ["w-thr", "w-mem"],
    createdAt: "2026-07-09",
  },
  {
    story: 7,
    id: "n-071",
    parent: null,
    type: "Opposing View",
    author: "a4",
    title: "The Doctor's Hour",
    body: `The doctor went home that night and locked his own hour in a cabinet, because a town that hears its own glass is a town that stops trusting the clock. "Nothing is wrong with you," he had told Ena, and his own hour had ticked faster, and he had hated himself for it. He sat in the dark with his hands folded and he thought about the crack in her chest, and about the crack that had been in his own, for years now, growing, he thought, with the patience of something that has already heard the answer to its question.`,
    wordIds: ["w-sil", "w-lim"],
    createdAt: "2026-07-24",
  },
  {
    story: 8,
    id: "n-080",
    parent: null,
    type: "Continue",
    author: "a2",
    title: "The Twentieth Bell",
    body: `The iron sang on the twentieth morning, and the keeper knelt, and the sand gave up its oldest question. He had been eleven years raising bells, and he had told himself each one was the last, and each one the wind had answered with another. But this one was different. It had been buried with the ropes still tied — the city had bound it, the way you bind a door before you abandon a house. He cut the ropes with his own hands, and the bell, freed, did not ring. It was too tired. It had been holding its question so long it had become the answer. It had been buried, he understood at last, because the city had been ashamed of what it could not bear to hear: that mercy, too, must sometimes be dug up by hand.`,
    wordIds: ["w-dst", "w-mrc"],
    createdAt: "2026-07-13",
  },
  {
    story: 9,
    id: "n-090",
    parent: null,
    type: "Continue",
    author: "a8",
    title: "The Wallpaper",
    body: `My daughter's wallpaper changed color again last night — from the gray of a winter afternoon to the green of a porch light at the end of a long day — and I went up with the flashlight and stood at her door, and I heard the house breathing the way it breathes when it is about to say something it has been holding for years. I did not open the drawer again. I sat on the top step with my back against the wall the family before us had leaned against, and I said, out loud, to the house: we are not leaving. The house, for the first time in the weeks we had lived there, went completely quiet. I think it was listening. I think it was deciding whether to believe me.`,
    wordIds: ["w-mem", "w-sil"],
    createdAt: "2026-07-17",
  },
  {
    story: 10,
    id: "n-100",
    parent: null,
    type: "Continue",
    author: "a7",
    title: "The Snow, Later",
    body: `The snow kept its word, and then kept a second one. It was still on the ground at midnight, and my mother had gone to bed, and I stood at the kitchen window with my cold hands around the cocoa and I watched the street learn to be a road again. Somewhere a shovel started, and stopped, and started. The snow did not mind being moved. It had done what it came to do. It had come to rest, and rest had spread, and the whole town had leaned toward the glass and gone soft, the way you go soft when you finally understand that you are allowed.`,
    wordIds: ["w-sti", "w-hom"],
    createdAt: "2026-08-02",
  },
  {
    story: 10,
    id: "n-101",
    parent: null,
    type: "Poem",
    author: "a3",
    title: "First Snow (a poem)",
    body: `The first snow is a rumor / that keeps its word. / It comes after supper / without announcement, / the way the best visitors do. / The whole street / leans toward the glass / and goes soft, / the way you go soft / when you understand / you are allowed to rest.`,
    wordIds: ["w-sil", "w-sti"],
    createdAt: "2026-08-04",
  },
  {
    story: 11,
    id: "n-110",
    parent: null,
    type: "Continue",
    author: "a4",
    title: "The Ledger, Open",
    body: `The clerk turned the ledger around. The second column was not empty, though you are not supposed to be able to read it. It was written in a hand that was yours and not yours, and it listed, in order: the hour you learned to listen; the hour you forgave your father; the hour you kept for someone else when your own was cracking. The clerk smiled the way people smile when the obvious is finally arrived at. "You have been trading wrong your whole life," they said. "You have been giving away the hours. We are only asking you to keep one."`,
    wordIds: ["w-thr", "w-mem"],
    createdAt: "2026-07-28",
  },
  {
    story: 10,
    id: "n-me-1",
    parent: null,
    type: "Continue",
    author: "me",
    title: "The Morning After",
    body: `By morning the street had become a road again, but the snow had left its evidence — a lace of footprints, the strange quiet in the engine sounds, the way the light came in lower and kinder. My mother stood at the window with her tea gone cold and said, without turning, "It will not be the last one." And I understood she did not mean the snow. She meant the being met. The being held. I have kept that first snow the way you keep a letter you never need to read again, because you already know it by heart.`,
    wordIds: ["w-sti", "w-mem"],
    createdAt: "2026-08-05",
  },
];

export const NODES: BranchNode[] = NODE_BODIES.map((n) => {
  const story = STORIES[n.story];
  const words = n.body.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  return {
    id: n.id,
    storyId: story.id,
    parentId: n.parent,
    type: n.type,
    authorId: n.author,
    title: n.title,
    body: n.body,
    words,
    beautifulWordIds: n.wordIds ?? [],
    createdAt: n.createdAt,
    isSeed: false,
  };
});

/* keep stories in sync with nodes */
for (const story of STORIES) {
  const nodes = NODES.filter((n) => n.storyId === story.id);
  const contributors = new Set([story.seedAuthorId, ...nodes.map((n) => n.authorId)]);
  story.branchCount = nodes.length;
  story.continuationCount = nodes.length;
  story.contributorIds = Array.from(contributors);
}

/* ---------- critiques ---------- */

interface SeedCritique {
  story: number;
  author: string;
  scores: Critique["scores"];
  reflection: string;
  isEditorial?: boolean;
}

const CRITIQUE_SEEDS: SeedCritique[] = [
  {
    story: 0,
    author: "a3",
    isEditorial: true,
    scores: {
      emotion: 9, logic: 8, pacing: 8, imagery: 10,
      dialogue: 7, originality: 9, theme: 9, ending: 8,
    },
    reflection: `The restraint here is a form of courage. The granddaughter's voice is quiet enough that the grandmother's silences stay audible — nothing is explained that should remain felt. The final line does what final lines should: it opens a door instead of closing one. I would happily read forty-three more.`,
  },
  {
    story: 0,
    author: "a4",
    scores: {
      emotion: 8, logic: 7, pacing: 8, imagery: 9,
      dialogue: 6, originality: 8, theme: 8, ending: 8,
    },
    reflection: `The hatbox framing is strong and earned. One small craft note: the heron returns once early and once late — consider letting it appear exactly once, so the second appearance means more when it never comes.`,
  },
  {
    story: 1,
    author: "a7",
    isEditorial: true,
    scores: {
      emotion: 9, logic: 8, pacing: 9, imagery: 9,
      dialogue: 8, originality: 9, theme: 9, ending: 9,
    },
    reflection: `A fable that keeps its logic like a held breath. The physical weight of the suitcase doing the work of interiority is exactly the sort of concrete metaphor the genre does best. The woman at the second village earns her mystery by not over-explaining it.`,
  },
  {
    story: 2,
    author: "a1",
    scores: {
      emotion: 9, logic: 8, pacing: 8, imagery: 9,
      dialogue: 6, originality: 9, theme: 9, ending: 9,
    },
    reflection: `"The river looked like time pretending to be water" is the line of the month for me. The grief is carried entirely by objects — a coat, a Polaroid — and the story trusts the reader to carry it too. The seed ends exactly where it should.`,
  },
  {
    story: 3,
    author: "a3",
    scores: {
      emotion: 8, logic: 7, pacing: 8, imagery: 9,
      dialogue: 9, originality: 9, theme: 8, ending: 9,
    },
    reflection: `The bookshop's logic is perfect because it is never explained. The proprietor is doing a lot of quiet lifting with very few lines — that's the mark of a character who knows the room. The margin line earns its strangeness because the narrator doesn't belabor it.`,
  },
  {
    story: 4,
    author: "a1",
    isEditorial: true,
    scores: {
      emotion: 9, logic: 8, pacing: 9, imagery: 9,
      dialogue: 8, originality: 9, theme: 10, ending: 9,
    },
    reflection: `This is the whole tradition in one door — the wall that is not a wall, the handprint that stays warm. The apprentice's discovery is allowed to be slow, and the master's tears arrive as a surprise precisely because the craft note was kept so steady. Mercy, as rendered here, is structural, not sentimental.`,
  },
  {
    story: 6,
    author: "a6",
    scores: {
      emotion: 9, logic: 8, pacing: 8, imagery: 8,
      dialogue: 7, originality: 8, theme: 8, ending: 9,
    },
    reflection: `The sea-as-postman conceit is handled with real tenderness, and the silk thread returning in a new color is the kind of small continuity that rewards careful readers. The mid-sentence ending of the first letter was the hook that made me want to answer it myself.`,
  },
  {
    story: 7,
    author: "a2",
    scores: {
      emotion: 9, logic: 9, pacing: 9, imagery: 9,
      dialogue: 8, originality: 10, theme: 9, ending: 9,
    },
    reflection: `The worldbuilding is economical and utterly legible — time as a material you hold is legible in a single line, and the story never trips over its own machinery. The crack-as-door is the kind of twist that re-frames everything before it without erasing it.`,
  },
  {
    story: 8,
    author: "a4",
    isEditorial: true,
    scores: {
      emotion: 9, logic: 8, pacing: 8, imagery: 9,
      dialogue: 7, originality: 10, theme: 9, ending: 9,
    },
    reflection: `The keeper's patience is the subject and the form both. "The bells were questions" is a seed sentence I want to live inside. The twentieth bell finding its answer in the weight of its own waiting is a mercy the story earns without stating it.`,
  },
  {
    story: 9,
    author: "a3",
    scores: {
      emotion: 8, logic: 7, pacing: 9, imagery: 9,
      dialogue: 7, originality: 8, theme: 8, ending: 8,
    },
    reflection: `The drawer is built with intent, and the diary's eleven lines do the horror's work without a single shadow. Speaking to the house aloud was the right beat — it converts dread into a relationship, which is scarier and stranger than dread alone.`,
  },
  {
    story: 1,
    author: "me",
    scores: {
      emotion: 9, logic: 8, pacing: 9, imagery: 9,
      dialogue: 8, originality: 9, theme: 9, ending: 8,
    },
    reflection: `The suitcase as a metaphor for the unspoken is handled with complete economy — nothing is explained, everything is felt. "It will remember you" is the kind of line that reopens the story each time you read it. I want to carry this stone.`,
  },
];

export const CRITIQUES: Critique[] = CRITIQUE_SEEDS.map((c, i) => {
  const story = STORIES[c.story];
  const id = `cr-${100 + i}`;
  const author = AUTHORS.find((a) => a.id === c.author);
  story.critiqueCount += 1;
  void author;
  return {
    id,
    storyId: story.id,
    authorId: c.author,
    createdAt: "2026-07-" + (10 + (i % 18)).toString().padStart(2, "0"),
    scores: c.scores,
    reflection: c.reflection,
    isEditorial: c.isEditorial ?? false,
  };
});

/* ---------- challenges ---------- */

export const CHALLENGES: Challenge[] = [
  {
    id: "ch-1",
    kind: "Daily Sprint",
    title: "One Hundred Quiet Words",
    prompt: "Write 100 words about a small mercy someone almost didn't notice.",
    wordLimit: 100,
    startsAt: "2026-08-05",
    endsAt: "2026-08-06",
    participants: 342,
    featuredStoryId: "st-110",
  },
  {
    id: "ch-2",
    kind: "Weekly Prompt",
    title: "Thresholds",
    prompt: "Continue this story in under 300 words. Begin at the exact moment a character steps across a line they said they never would.",
    wordLimit: 300,
    startsAt: "2026-08-01",
    endsAt: "2026-08-08",
    participants: 587,
    featuredStoryId: "st-100",
  },
  {
    id: "ch-3",
    kind: "Relay",
    title: "The Exchange",
    prompt: "A living relay. One writer opens, the next continues. Twenty hours, twenty hands, one story.",
    startsAt: "2026-07-27",
    endsAt: "2026-08-09",
    participants: 19,
    featuredStoryId: "st-111",
  },
  {
    id: "ch-4",
    kind: "Timed",
    title: "Twenty-Minute Dusk",
    prompt: "You have twenty minutes. The light is leaving. Write the thing you'd write if the light were leaving.",
    wordLimit: 400,
    startsAt: "2026-08-03",
    endsAt: "2026-08-07",
    participants: 208,
    qualityNote: "Judged on the last line.",
  },
  {
    id: "ch-5",
    kind: "Community",
    title: "Catholic Writers — The Mercy Thread",
    prompt: "Open a story with the line 'Mercy is a door with no handle.' Carry it somewhere the door opens.",
    startsAt: "2026-07-30",
    endsAt: "2026-08-12",
    participants: 96,
    featuredStoryId: "st-104",
  },
  {
    id: "ch-6",
    kind: "Daily Sprint",
    title: "Six Words, Exactly",
    prompt: "A whole story in six words. No more. No less. (Hint: the counting is part of the craft.)",
    wordLimit: 6,
    startsAt: "2026-08-06",
    endsAt: "2026-08-07",
    participants: 415,
  },
];

/* ---------- anthologies ---------- */

export const ANTHOLOGIES: Anthology[] = [
  {
    id: "an-1",
    title: "Letters & Longing",
    season: "August 2026",
    description: "Unsent letters, patient seas, and the arithmetic of almost. Eleven stories and nineteen continuations about the things we address to the world and never quite send.",
    cover: makeCover("Letters & Longing"),
    storyIds: ["st-100", "st-103", "st-106", "st-108"],
    featuredStoryIds: ["st-100", "st-106"],
    topCritiqueIds: ["cr-100", "cr-106"],
    publishedAt: "2026-08-01",
    theme: "Letters",
  },
  {
    id: "an-2",
    title: "Thresholds",
    season: "July 2026",
    description: "Doors without handles, cracks in glass that open, roads that appear when you admit you're lost. A month of writing about the lines we step across.",
    cover: makeCover("Thresholds"),
    storyIds: ["st-101", "st-104", "st-107", "st-111"],
    featuredStoryIds: ["st-101", "st-107"],
    topCritiqueIds: ["cr-107"],
    publishedAt: "2026-07-01",
    theme: "Thresholds",
  },
  {
    id: "an-3",
    title: "The Sea Keeps",
    season: "June 2026",
    description: "Rivers that remember, bays that return what you give, and one Polaroid that came home after fourteen years. Water writing, from the shore inward.",
    cover: makeCover("The Sea Keeps"),
    storyIds: ["st-102", "st-106"],
    featuredStoryIds: ["st-102"],
    topCritiqueIds: ["cr-104"],
    publishedAt: "2026-06-01",
    theme: "The Sea",
  },
];

/* ---------- collections ---------- */

export const COLLECTIONS: Collection[] = [
  {
    id: "cl-1",
    title: "Cathedrals",
    description: "Stone, light, and the doors we build to remember what waits.",
    cover: makeCover("Cathedrals"),
    curatorId: "a5",
    storyIds: ["st-104", "st-105"],
    isCommunity: false,
  },
  {
    id: "cl-2",
    title: "Letters Never Sent",
    description: "Everything we meant to say, kept in better shape than we are.",
    cover: makeCover("Letters Never Sent"),
    curatorId: "a1",
    storyIds: ["st-100", "st-106"],
    isCommunity: false,
  },
  {
    id: "cl-3",
    title: "Hope",
    description: "Not optimism — hope, which is harder and quieter.",
    cover: makeCover("Hope"),
    curatorId: null,
    storyIds: ["st-107", "st-108", "st-110"],
    isCommunity: true,
  },
  {
    id: "cl-4",
    title: "Ocean",
    description: "Water as witness, water as postman, water as memory.",
    cover: makeCover("Ocean"),
    curatorId: "a6",
    storyIds: ["st-102", "st-106"],
    isCommunity: false,
  },
  {
    id: "cl-5",
    title: "Winter Stories",
    description: "Snow that keeps its word and orchards that wait until spring.",
    cover: makeCover("Winter Stories"),
    curatorId: "a3",
    storyIds: ["st-105", "st-110"],
    isCommunity: false,
  },
  {
    id: "cl-6",
    title: "Catholic Fiction",
    description: "Faith made of stone and mercy made of doors.",
    cover: makeCover("Catholic Fiction"),
    curatorId: "a5",
    storyIds: ["st-104"],
    isCommunity: true,
  },
  {
    id: "cl-7",
    title: "Mystery",
    description: "Things the river kept, things the house remembers.",
    cover: makeCover("Mystery"),
    curatorId: "a4",
    storyIds: ["st-102", "st-109"],
    isCommunity: false,
  },
];

/* ---------- communities ---------- */

export const COMMUNITIES: Community[] = [
  {
    id: "co-1",
    name: "Fantasy",
    description: "Roads that appear, bells buried in dunes, and doors with no handles. We build worlds and leave them unfinished on purpose.",
    cover: makeCover("Fantasy Circle"),
    memberCount: 1284,
    memberIds: ["a2", "a8", "a6"],
    tags: ["World Building", "Slow Magic", "Thresholds"],
    featuredStoryIds: ["st-101", "st-108"],
    challengeIds: ["ch-2"],
    discussion: [
      {
        id: "d-1",
        authorId: "a2",
        body: `Rule of our circle: no world is finished until it has a road that didn't exist in the first draft. Who's building one this week?`,
        createdAt: "2026-08-02",
      },
      {
        id: "d-2",
        authorId: "a6",
        body: `The Glass Hour cracked my idea of 'hard magic.' Time-as-material is exactly the sort of thing this circle should play with more.`,
        createdAt: "2026-08-03",
      },
    ],
  },
  {
    id: "co-2",
    name: "Poetry",
    description: "A circle for those who write in the margins. Forms, half-lines, and the long patience of revision.",
    cover: makeCover("Poetry Circle"),
    memberCount: 941,
    memberIds: ["a3", "a7"],
    tags: ["Form", "Line Breaks", "Stillness"],
    featuredStoryIds: ["st-105", "st-110"],
    challengeIds: ["ch-4"],
    discussion: [
      {
        id: "d-3",
        authorId: "a3",
        body: `The first snow poem in the Weekly Prompt thread — whoever wrote it, come claim it. That last line ('you are allowed to rest') is doing cathedral work.`,
        createdAt: "2026-08-04",
      },
    ],
  },
  {
    id: "co-3",
    name: "Catholic Writers",
    description: "A quiet room for faith, mercy, and the grammar of grace. We write toward the light that waits behind the marble.",
    cover: makeCover("Catholic Writers"),
    memberCount: 622,
    memberIds: ["a5", "a1"],
    tags: ["Faith", "Mercy", "Cathedrals"],
    featuredStoryIds: ["st-104"],
    challengeIds: ["ch-5"],
    discussion: [
      {
        id: "d-4",
        authorId: "a5",
        body: `'Mercy is a door with no handle.' I keep coming back to it. The door in the cathedral started from a line I heard at a funeral. If you're in the Mercy Thread, I want to read everything you've written toward it.`,
        createdAt: "2026-08-01",
      },
    ],
  },
  {
    id: "co-4",
    name: "Sci-Fi",
    description: "Starships and hourglasses. We take the strangest premise we can afford and make it feel like home.",
    cover: makeCover("Sci-Fi Circle"),
    memberCount: 1107,
    memberIds: ["a6", "a2"],
    tags: ["Hard Concepts", "Soft Hearts", "The Future"],
    featuredStoryIds: ["st-107"],
    challengeIds: ["ch-6"],
    discussion: [
      {
        id: "d-5",
        authorId: "a6",
        body: `Time as a material you hold — I pitched it to the table and they said 'too soft.' The Glass Hour is my answer to that. Speculative doesn't have to be cold.`,
        createdAt: "2026-07-30",
      },
    ],
  },
  {
    id: "co-5",
    name: "Minimalists",
    description: "Say less. Mean more. One image, earned. A circle for people who cut their own favorite sentences.",
    cover: makeCover("Minimalists"),
    memberCount: 503,
    memberIds: ["a4"],
    tags: ["Restraint", "One Image", "Precision"],
    featuredStoryIds: ["st-102"],
    challengeIds: ["ch-6"],
    discussion: [
      {
        id: "d-6",
        authorId: "a4",
        body: `'The river did not answer, but it kept everything.' That's nine words. Nine. Ask yourself: what is your story keeping? If you can't answer in one sentence, the image isn't carrying yet.`,
        createdAt: "2026-08-03",
      },
    ],
  },
  {
    id: "co-6",
    name: "Historical Fiction",
    description: "Forty-three letters. One ferry. The past is a country with better manners and worse plumbing.",
    cover: makeCover("Historical Fiction"),
    memberCount: 758,
    memberIds: ["a1", "a5"],
    tags: ["Eras", "Archive", "Letters"],
    featuredStoryIds: ["st-100"],
    challengeIds: ["ch-2"],
    discussion: [
      {
        id: "d-7",
        authorId: "a1",
        body: `The hatbox is real — I keep one above my desk. Every letter in 'Letters Never Sent' was written with the archive of one actual grandmother. Steal from your own family's silences.`,
        createdAt: "2026-08-02",
      },
    ],
  },
];

/* ---------- notifications ---------- */

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "nt-1",
    kind: "continuation",
    actorId: "a3",
    storyId: "st-110",
    body: "Ivy Calloway continued 'The First Snow' with a poem.",
    read: false,
    createdAt: "2026-08-04",
  },
  {
    id: "nt-2",
    kind: "critique",
    actorId: "a4",
    storyId: "st-100",
    body: "Soren Whit left a critique on 'Letters Never Sent'.",
    read: false,
    createdAt: "2026-08-03",
  },
  {
    id: "nt-3",
    kind: "relay",
    actorId: "a2",
    storyId: "st-111",
    body: "You've been invited to join the relay 'The Exchange' — your turn begins in two hours.",
    read: false,
    createdAt: "2026-08-03",
  },
  {
    id: "nt-4",
    kind: "challenge",
    storyId: "st-110",
    body: "The Weekly Prompt 'Thresholds' closes in 3 days. 300 words. You have a draft waiting.",
    read: true,
    createdAt: "2026-08-02",
  },
  {
    id: "nt-5",
    kind: "anthology",
    storyId: "st-100",
    body: "Your story is featured in this month's anthology: Letters & Longing.",
    read: true,
    createdAt: "2026-08-01",
  },
  {
    id: "nt-6",
    kind: "welcome",
    body: "Welcome to Sprinter. Someone is always waiting for your next sentence.",
    read: true,
    createdAt: "2026-08-01",
  },
];

/* ---------- helpers ---------- */

export function authorById(id: string): Author {
  return AUTHORS.find((a) => a.id === id) ?? AUTHORS[AUTHORS.length - 1];
}

export function wordById(id: string): BeautifulWord {
  return (
    VAULT.find((w) => w.id === id) ??
    VAULT_EXTRA.find((w) => w.id === id) ??
    VAULT[0]
  );
}

export const VAULT_EXTRA: BeautifulWord[] = [];

export const THOUGHTS: Thought[] = [
  {
    id: "th-1",
    storyId: "st-101",
    authorId: "a2",
    content:
      "I think the bell should ring before the priest appears — let the sound arrive first, so we hear the cathedral before we see anyone.",
    createdAt: "2026-07-12",
  },
  {
    id: "th-2",
    storyId: "st-101",
    authorId: "a3",
    content:
      "The dust on the sill feels heavier than the sermon. That single image is doing all the work of the first page — hold on to it.",
    createdAt: "2026-07-14",
  },
  {
    id: "th-3",
    storyId: "st-101",
    authorId: "a6",
    content:
      "I wonder if the cathedral itself is alive. Not metaphorically — as a character who waits.",
    createdAt: "2026-07-18",
  },
  {
    id: "th-4",
    storyId: "st-102",
    authorId: "a1",
    content:
      "The suitcase as a stand-in for the unspoken is almost too clean — let it creak, let something fall out mid-sentence.",
    createdAt: "2026-07-20",
  },
  {
    id: "th-5",
    storyId: "st-105",
    authorId: "a4",
    content:
      "That second paragraph feels too fast. Let the moon take its time — the waiting is the point.",
    createdAt: "2026-07-22",
  },
  {
    id: "th-6",
    storyId: "st-110",
    authorId: "a2",
    content:
      "The ledger opens a door. I'd love a continuation that never explains who 'you' is — leave it half-lit.",
    createdAt: "2026-07-29",
  },
];

export function thoughtsFor(storyId: string): Thought[] {
  return THOUGHTS.filter((t) => t.storyId === storyId).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export function nodesFor(storyId: string): BranchNode[] {
  return NODES.filter((n) => n.storyId === storyId);
}

export function critiquesFor(storyId: string): Critique[] {
  return CRITIQUES.filter((c) => c.storyId === storyId);
}

export function storyById(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

export function storyBySlug(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
}

export const WEEKLY_PROMPT = {
  title: "Thresholds",
  prompt: "Continue this story in under 300 words.",
  detail:
    "Begin at the exact moment a character steps across a line they said they never would. Doors, rivers, glass, roads — the threshold is yours. Keep it under 300 words, and let the crossing change something structural, not just decorative.",
};

export const RELAY = {
  storyId: "st-111",
  hand: 7,
  hands: 19,
  hoursRemaining: 2,
  current: "a4",
};
