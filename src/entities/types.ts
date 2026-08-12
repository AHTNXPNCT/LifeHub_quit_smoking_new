export type ThemeName = "light" | "dark" | "system" | "nature" | "forest" | "sea" | "sky";

export interface Profile {
  name: string;
  quitAt: string;
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  packPrice: number;
  nicotineType: "Сигареты" | "Вейп" | "Снюс" | "Нагревание табака" | "Другое";
  motivation: string;
}

export interface DailyProgram {
  day: number;
  phase: string;
  title: string;
  category: string;
  description: string;
  fact: string;
  source: string;
  exercise: string;
  technique: string;
  mission: string;
  question: string;
  recommendation: string;
  xp: number;
  completionCondition: string;
  test?: { question: string; options: string[]; answer: number };
  natureDelta: number;
}

export interface CravingEntry {
  id: string;
  at: string;
  place: string;
  situation: string;
  trigger: string;
  intensity: number;
  mood: string;
  thought: string;
  action: string;
  helped: string;
  result: string;
}

export interface MoodEntry { id: string; at: string; score: number; note: string }

export interface CbtEntry {
  id: string;
  at: string;
  situation: string;
  thought: string;
  emotion: string;
  intensity: number;
  facts: string;
  alternative: string;
  action: string;
  result: string;
}

export interface RelapseEntry {
  id: string;
  at: string;
  amount: number;
  situation: string;
  trigger: string;
  mood: string;
  reason: string;
  lesson: string;
  nextPlan: string;
}

export interface EmergencySession {
  id: string;
  at: string;
  before: number;
  after: number;
  reason: string;
  copingChoice?: string;
  completed: boolean;
}

export interface ActivityDay {
  date: string;
  at?: string;
  completed: boolean;
  difficult: boolean;
  relapse: boolean;
  tasks: string[];
  xp: number;
}

export type GameId = "2048" | "memory" | "puzzle" | "objects" | "bubbles" | "focus" | "breath" | "stress";
export type DashboardWidgetId = "counter" | "motivation" | "program" | "forest" | "stats" | "today" | "health" | "xp" | "quick";

export interface DayDraft {
  checks: boolean[];
  answer: string;
  testAnswer: number | null;
  updatedAt: string;
}

export interface ForestObject {
  id: string;
  cycle: number;
  kind: string;
  vitality: number;
  completedAt?: string;
}

export interface LifeHubData {
  profile: Profile | null;
  activeDay: number;
  completedDays: number[];
  paused: boolean;
  streak: number;
  bestStreak: number;
  xp: number;
  unlockedAchievements: string[];
  cravings: CravingEntry[];
  moods: MoodEntry[];
  cbtEntries: CbtEntry[];
  relapses: RelapseEntry[];
  emergencySessions: EmergencySession[];
  activity: ActivityDay[];
  forest: ForestObject[];
  lastProgramCompletionDate: string | null;
  dayDrafts: Record<string, DayDraft>;
  gameLevels: Record<GameId, number>;
  gameCompletedLevels: Record<GameId, number[]>;
  gameWins: number;
  dashboardWidgets: DashboardWidgetId[];
  packPriceHistory: number[];
  inputSuggestions: Record<string, string[]>;
  dailyNoticeDismissed: string | null;
  favorites: string[];
  readMaterials: string[];
  viewHistory: string[];
  theme: ThemeName;
  reducedMotion: boolean;
  notifications: boolean;
}
