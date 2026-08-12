"use client";

import { create } from "zustand";
import { loadLifeHubData, replaceLifeHubData, saveLifeHubData } from "@/src/db/lifehub-db";
import type { ActivityDay, CbtEntry, CravingEntry, DashboardWidgetId, DayDraft, EmergencySession, ForestObject, GameId, LifeHubData, MoodEntry, Profile, RelapseEntry, ThemeName } from "@/src/entities/types";
import { daysBetweenLocal, localDateKey } from "@/src/utils/local-date";

const forestKinds = ["Дуб", "Берёза", "Сосна", "Ива", "Клён", "Рябина", "Липа", "Кедр", "Яблоня", "Магнолия", "Ель", "Бук", "Ольха", "Вяз", "Осина", "Каштан", "Пихта", "Сакура", "Орех", "Платан"];
const gameIds: GameId[] = ["2048", "memory", "puzzle", "objects", "bubbles", "focus", "breath", "stress"];
const initialGameLevels = Object.fromEntries(gameIds.map((id) => [id, 1])) as Record<GameId, number>;
const initialCompletedGameLevels = Object.fromEntries(gameIds.map((id) => [id, [] as number[]])) as unknown as Record<GameId, number[]>;

export const initialData: LifeHubData = {
  profile: null,
  activeDay: 1,
  completedDays: [],
  paused: false,
  streak: 0,
  bestStreak: 0,
  xp: 0,
  unlockedAchievements: [],
  cravings: [],
  moods: [],
  cbtEntries: [],
  relapses: [],
  emergencySessions: [],
  activity: [],
  forest: [{ id: "tree-1", cycle: 1, kind: "Дуб", vitality: 15 }],
  lastProgramCompletionDate: null,
  dayDrafts: {},
  gameLevels: initialGameLevels,
  gameCompletedLevels: initialCompletedGameLevels,
  gameWins: 0,
  dashboardWidgets: ["counter", "motivation", "program", "forest", "stats", "today", "health", "xp", "quick"],
  packPriceHistory: [],
  inputSuggestions: {
    place: ["Дом", "Работа", "Улица", "Машина", "Кафе"],
    trigger: ["Стресс", "Кофе", "После еды", "Компания", "Скука", "Усталость"],
    mood: ["Спокойствие", "Напряжение", "Грусть", "Злость", "Усталость", "Радость"],
    action: ["Выпил воды", "Вышел пройтись", "Подышал", "Позвонил близкому", "Открыл LifeHub"],
    helped: ["Дыхание", "Вода", "Движение", "Разговор", "Игра", "Смена места"],
  },
  dailyNoticeDismissed: null,
  favorites: [],
  readMaterials: [],
  viewHistory: [],
  theme: "dark",
  reducedMotion: false,
  notifications: true,
};

interface LifeHubActions {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  updateDayDraft: (day: number, draft: DayDraft) => void;
  completeDay: (day: number, xp: number) => boolean;
  addCraving: (entry: CravingEntry) => void;
  updateCraving: (entry: CravingEntry) => void;
  addMood: (entry: MoodEntry) => void;
  updateMood: (entry: MoodEntry) => void;
  addCbt: (entry: CbtEntry) => void;
  updateCbt: (entry: CbtEntry) => void;
  addRelapse: (entry: RelapseEntry) => void;
  updateRelapse: (entry: RelapseEntry) => void;
  addEmergency: (entry: EmergencySession) => void;
  completeGame: (game: GameId, level: number) => number;
  setTheme: (theme: ThemeName) => void;
  setReducedMotion: (value: boolean) => void;
  setPaused: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  toggleDashboardWidget: (id: DashboardWidgetId) => void;
  rememberSuggestion: (field: string, value: string) => void;
  dismissDailyNotice: () => void;
  toggleFavorite: (id: string) => void;
  markRead: (id: string) => void;
  viewMaterial: (id: string) => void;
  grantXp: (amount: number) => void;
  importData: (data: LifeHubData) => Promise<void>;
  resetData: () => Promise<void>;
}

export type LifeHubStore = LifeHubData & LifeHubActions;

export function selectLifeHubData(state: LifeHubStore): LifeHubData {
  const keys = Object.keys(initialData) as (keyof LifeHubData)[];
  return Object.fromEntries(keys.map((key) => [key, state[key]])) as unknown as LifeHubData;
}

function normalizeData(saved: LifeHubData): LifeHubData {
  const completedDates = saved.activity?.filter((item) => item.completed).map((item) => item.date).sort() ?? [];
  const price = saved.profile?.packPrice;
  return {
    ...initialData,
    ...saved,
    gameLevels: { ...initialGameLevels, ...saved.gameLevels },
    gameCompletedLevels: { ...initialCompletedGameLevels, ...saved.gameCompletedLevels },
    inputSuggestions: { ...initialData.inputSuggestions, ...saved.inputSuggestions },
    lastProgramCompletionDate: saved.lastProgramCompletionDate ?? completedDates.at(-1) ?? null,
    packPriceHistory: Array.from(new Set([...(saved.packPriceHistory ?? []), ...(price ? [price] : [])])).slice(-10),
  };
}

type JournalData = Pick<LifeHubData, "cravings" | "moods" | "cbtEntries" | "relapses" | "emergencySessions">;
type JournalLedger = Map<string, { at: string; difficult: boolean; relapse: boolean; tasks: string[]; xp: number }>;
const JOURNAL_TASKS = new Set(["Дневник тяги", "Настроение", "CBT-разбор", "Разбор срыва", "Волна тяги пройдена"]);

function journalLedger(data: JournalData): JournalLedger {
  const ledger: JournalLedger = new Map();
  const add = (at: string, task: string, xp: number, flags: { difficult?: boolean; relapse?: boolean } = {}) => {
    const date = localDateKey(at);
    const previous = ledger.get(date) ?? { at, difficult: false, relapse: false, tasks: [], xp: 0 };
    ledger.set(date, {
      at: new Date(at).getTime() > new Date(previous.at).getTime() ? at : previous.at,
      difficult: previous.difficult || Boolean(flags.difficult),
      relapse: previous.relapse || Boolean(flags.relapse),
      tasks: Array.from(new Set([...previous.tasks, task])),
      xp: previous.xp + xp,
    });
  };
  data.cravings.forEach((entry) => add(entry.at, "Дневник тяги", 12, { difficult: entry.intensity >= 7 }));
  data.moods.forEach((entry) => add(entry.at, "Настроение", 5, { difficult: entry.score <= 2 }));
  data.cbtEntries.forEach((entry) => add(entry.at, "CBT-разбор", 18));
  data.relapses.forEach((entry) => add(entry.at, "Разбор срыва", 0, { difficult: true, relapse: true }));
  data.emergencySessions.forEach((entry) => add(entry.at, "Волна тяги пройдена", entry.after < entry.before ? 20 : 10, { difficult: entry.before >= 7 }));
  return ledger;
}

function reconcileJournalActivity(activity: ActivityDay[], beforeData: JournalData, afterData: JournalData): ActivityDay[] {
  const before = journalLedger(beforeData);
  const after = journalLedger(afterData);
  const byDate = new Map<string, ActivityDay>();
  activity.forEach((entry) => {
    const priorJournal = before.get(entry.date);
    const tasks = entry.tasks.filter((task) => !JOURNAL_TASKS.has(task));
    const isJournalOnly = tasks.length === 0 && !entry.completed;
    const remaining: ActivityDay = {
      ...entry,
      difficult: isJournalOnly ? false : entry.difficult,
      relapse: isJournalOnly ? false : entry.relapse,
      tasks,
      xp: Math.max(0, entry.xp - (priorJournal?.xp ?? 0)),
    };
    if (remaining.completed || remaining.tasks.length || remaining.xp || remaining.difficult || remaining.relapse) byDate.set(entry.date, remaining);
  });
  after.forEach((journal, date) => {
    const current = byDate.get(date) ?? { date, at: journal.at, completed: false, difficult: false, relapse: false, tasks: [], xp: 0 };
    byDate.set(date, {
      ...current,
      at: new Date(journal.at).getTime() > new Date(current.at ?? 0).getTime() ? journal.at : current.at,
      difficult: current.difficult || journal.difficult,
      relapse: current.relapse || journal.relapse,
      tasks: Array.from(new Set([...current.tasks, ...journal.tasks])),
      xp: current.xp + journal.xp,
    });
  });
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function canCompleteProgramDay(state: Pick<LifeHubData, "activeDay" | "completedDays" | "lastProgramCompletionDate" | "paused">, day: number, now = new Date()): boolean {
  return !state.paused && day === state.activeDay && !state.completedDays.includes(day) && state.lastProgramCompletionDate !== localDateKey(now);
}

export const useLifeHubStore = create<LifeHubStore>((set, get) => {
  const commit = (patch: Partial<LifeHubData>) => {
    set(patch);
    void saveLifeHubData(selectLifeHubData(get()));
  };
  const activityWith = (date: string, task: string, xp: number, flags: { completed?: boolean; difficult?: boolean; relapse?: boolean; at?: string } = {}) => {
    const previous = get().activity.find((item) => item.date === date);
    const next = {
      date,
      at: flags.at ?? previous?.at ?? new Date().toISOString(),
      completed: flags.completed ?? previous?.completed ?? false,
      difficult: flags.difficult ?? previous?.difficult ?? false,
      relapse: flags.relapse ?? previous?.relapse ?? false,
      tasks: Array.from(new Set([...(previous?.tasks ?? []), task])),
      xp: (previous?.xp ?? 0) + xp,
    };
    return [...get().activity.filter((item) => item.date !== date), next].sort((a, b) => a.date.localeCompare(b.date));
  };

  return {
    ...initialData,
    hydrated: false,
    hydrate: async () => {
      const saved = await loadLifeHubData();
      if (saved) set({ ...normalizeData(saved), hydrated: true });
      else set({ hydrated: true });
    },
    setProfile: (profile) => commit({
      profile,
      packPriceHistory: Array.from(new Set([...get().packPriceHistory, profile.packPrice])).filter((value) => value >= 0).slice(-10),
    }),
    updateDayDraft: (day, draft) => commit({ dayDrafts: { ...get().dayDrafts, [String(day)]: draft } }),
    completeDay: (day, reward) => {
      if (!canCompleteProgramDay(get(), day)) return false;
      const now = new Date();
      const today = localDateKey(now);
      const completedDays = [...get().completedDays, day].sort((a, b) => a - b);
      const last = get().lastProgramCompletionDate;
      const streak = last && daysBetweenLocal(last, today) === 1 ? get().streak + 1 : 1;
      const cycle = Math.floor((completedDays.length - 1) / 10) + 1;
      const cycleProgress = completedDays.length % 10 || 10;
      let forest = [...get().forest];
      const currentIndex = forest.findIndex((item) => item.cycle === cycle);
      const previousVitality = currentIndex >= 0 ? forest[currentIndex].vitality : 0;
      const object: ForestObject = {
        id: `nature-${cycle}`,
        cycle,
        kind: forestKinds[(cycle - 1) % forestKinds.length],
        vitality: Math.min(100, Math.max(15 + cycleProgress * 8.5, previousVitality + 10)),
        completedAt: cycleProgress === 10 ? today : undefined,
      };
      if (currentIndex >= 0) forest[currentIndex] = object;
      else forest = [...forest, object];
      commit({
        completedDays,
        activeDay: day + 1,
        lastProgramCompletionDate: today,
        streak,
        bestStreak: Math.max(get().bestStreak, streak),
        xp: get().xp + reward,
        forest,
        activity: activityWith(today, `Программа: день ${day}`, reward, { completed: true, at: now.toISOString() }),
      });
      return true;
    },
    addCraving: (entry) => {
      const reward = 12;
      commit({ cravings: [entry, ...get().cravings], xp: get().xp + reward, activity: activityWith(localDateKey(entry.at), "Дневник тяги", reward, { difficult: entry.intensity >= 7, at: entry.at }) });
    },
    updateCraving: (entry) => {
      const current = get();
      const cravings = current.cravings.map((item) => item.id === entry.id ? entry : item);
      commit({ cravings, activity: reconcileJournalActivity(current.activity, current, { ...current, cravings }) });
    },
    addMood: (entry) => {
      const reward = 5;
      commit({ moods: [entry, ...get().moods], xp: get().xp + reward, activity: activityWith(localDateKey(entry.at), "Настроение", reward, { difficult: entry.score <= 2, at: entry.at }) });
    },
    updateMood: (entry) => {
      const current = get();
      const moods = current.moods.map((item) => item.id === entry.id ? entry : item);
      commit({ moods, activity: reconcileJournalActivity(current.activity, current, { ...current, moods }) });
    },
    addCbt: (entry) => {
      const reward = 18;
      commit({ cbtEntries: [entry, ...get().cbtEntries], xp: get().xp + reward, activity: activityWith(localDateKey(entry.at), "CBT-разбор", reward, { at: entry.at }) });
    },
    updateCbt: (entry) => {
      const current = get();
      const cbtEntries = current.cbtEntries.map((item) => item.id === entry.id ? entry : item);
      commit({ cbtEntries, activity: reconcileJournalActivity(current.activity, current, { ...current, cbtEntries }) });
    },
    addRelapse: (entry) => {
      const today = localDateKey(entry.at);
      const forest = get().forest.map((item, index, all) => index === all.length - 1 ? { ...item, vitality: Math.max(10, item.vitality - 25) } : item);
      commit({
        relapses: [entry, ...get().relapses],
        streak: 0,
        forest,
        activity: activityWith(today, "Разбор срыва", 0, { difficult: true, relapse: true, at: entry.at }),
      });
    },
    updateRelapse: (entry) => {
      const current = get();
      const relapses = current.relapses.map((item) => item.id === entry.id ? entry : item);
      commit({ relapses, activity: reconcileJournalActivity(current.activity, current, { ...current, relapses }) });
    },
    addEmergency: (entry) => {
      const reward = entry.after < entry.before ? 20 : 10;
      commit({ emergencySessions: [entry, ...get().emergencySessions], xp: get().xp + reward, activity: activityWith(localDateKey(entry.at), "Волна тяги пройдена", reward, { difficult: entry.before >= 7, at: entry.at }) });
    },
    completeGame: (game, level) => {
      const current = get().gameLevels[game];
      const completed = get().gameCompletedLevels[game] ?? [];
      if (level !== current || completed.includes(level)) return 0;
      const reward = Math.min(30, 8 + Math.floor(level / 5) * 2);
      const gameLevels = { ...get().gameLevels, [game]: Math.min(50, level + 1) };
      const gameCompletedLevels = { ...get().gameCompletedLevels, [game]: [...completed, level] };
      const today = localDateKey();
      commit({ gameLevels, gameCompletedLevels, gameWins: get().gameWins + 1, xp: get().xp + reward, activity: activityWith(today, `Игра: уровень ${level}`, reward) });
      return reward;
    },
    setTheme: (theme) => commit({ theme }),
    setReducedMotion: (reducedMotion) => commit({ reducedMotion }),
    setPaused: (paused) => commit({ paused }),
    setNotifications: (notifications) => commit({ notifications }),
    toggleDashboardWidget: (id) => commit({ dashboardWidgets: get().dashboardWidgets.includes(id) ? get().dashboardWidgets.filter((item) => item !== id) : [...get().dashboardWidgets, id] }),
    rememberSuggestion: (field, raw) => {
      const value = raw.trim();
      if (!value) return;
      const current = get().inputSuggestions[field] ?? [];
      if (current.some((item) => item.toLocaleLowerCase("ru-RU") === value.toLocaleLowerCase("ru-RU"))) return;
      commit({ inputSuggestions: { ...get().inputSuggestions, [field]: [value, ...current].slice(0, 12) } });
    },
    dismissDailyNotice: () => commit({ dailyNoticeDismissed: localDateKey() }),
    toggleFavorite: (id) => commit({ favorites: get().favorites.includes(id) ? get().favorites.filter((item) => item !== id) : [...get().favorites, id] }),
    markRead: (id) => {
      if (get().readMaterials.includes(id)) return;
      const reward = 4;
      commit({ readMaterials: [...get().readMaterials, id], xp: get().xp + reward, activity: activityWith(localDateKey(), "Материал прочитан", reward) });
    },
    viewMaterial: (id) => commit({ viewHistory: [id, ...get().viewHistory.filter((item) => item !== id)].slice(0, 50) }),
    grantXp: (amount) => commit({ xp: get().xp + amount }),
    importData: async (data) => { const normalized = normalizeData(data); await replaceLifeHubData(normalized); set({ ...normalized, hydrated: true }); },
    resetData: async () => { await replaceLifeHubData(initialData); set({ ...initialData, hydrated: true }); },
  };
});
