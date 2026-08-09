"use client";

import { useState } from "react";
import { Award, Bell, BookOpen, CalendarCheck, CigaretteOff, Coins, Flame, Gamepad2, HeartPulse, Leaf, NotebookTabs, Play, Settings2, Sparkles, TimerReset, X } from "lucide-react";
import type { AppSection } from "@/src/app/LifeHubClient";
import type { DashboardWidgetId } from "@/src/entities/types";
import { getProgramDay } from "@/src/content/days/program";
import { useNow } from "@/src/hooks/use-now";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { formatMoney, quitStats, xpLevel } from "@/src/utils/calculations";
import { localDateKey } from "@/src/utils/local-date";
import { russianNoun } from "@/src/utils/russian";
import { NatureScene } from "@/src/widgets/NatureScene";
import { ProgressBar, SectionCard, StatCard } from "@/src/components/ui";
import { Modal } from "@/src/components/Modal";

const widgetLabels: { id: DashboardWidgetId; label: string; text: string }[] = [
  { id: "counter", label: "Счётчик", text: "Время без никотина и экстренная помощь" },
  { id: "motivation", label: "Мотивация", text: "Личная причина в закреплённой области" },
  { id: "program", label: "Прогресс дня", text: "Текущий день и отметка выполнения" },
  { id: "forest", label: "Живой лес", text: "Деревья и природные события" },
  { id: "stats", label: "Основные показатели", text: "Серия, сигареты, экономия, программа" },
  { id: "today", label: "Задача дня", text: "Практика и награда" },
  { id: "health", label: "Здоровье", text: "Переход к временной шкале" },
  { id: "xp", label: "XP и уровень", text: "Опыт и достижения" },
  { id: "quick", label: "Быстрое переключение", text: "Переходы к ключевым разделам" },
];

export default function DashboardPage({ onNavigate, onEmergency }: { onNavigate: (section: AppSection) => void; onEmergency: () => void; onRelapse: () => void }) {
  const now = useNow();
  const nowDate = new Date(now);
  const state = useLifeHubStore();
  const [customize, setCustomize] = useState(false);
  const stats = quitStats(state.profile, now);
  const level = xpLevel(state.xp);
  const day = getProgramDay(state.activeDay);
  const currentNature = state.forest.at(-1)!;
  const visible = (id: DashboardWidgetId) => state.dashboardWidgets.includes(id);
  const todayKey = localDateKey(nowDate);
  const todayActivity = state.activity.find((item) => item.date === todayKey);
  const moodDone = state.moods.some((item) => localDateKey(item.at) === todayKey);
  const showDailyNotice = state.dailyNoticeDismissed !== todayKey;

  return <div className="dashboard page-stack">
    <div className="dashboard-tools"><div><span className="eyebrow">Ваш экран</span><b>Важное — сразу под рукой</b></div><button className="ghost-button" onClick={() => setCustomize(true)}><Settings2 /> Настроить экран</button></div>
    {showDailyNotice && <section className="daily-notice" role="status"><Bell /><div><b>На сегодня осталось отметить</b><p>{todayActivity?.completed ? "День программы уже отмечен." : `День ${day.day}: выполните практику и поставьте отметку.`} {moodDone ? "Настроение записано." : "Добавьте короткую отметку настроения."}</p><div className="notice-actions"><button onClick={() => onNavigate("today")}>Открыть день</button>{!moodDone && <button onClick={() => onNavigate("journals")}>Отметить настроение</button>}</div></div><button className="icon-button" aria-label="Скрыть напоминание на сегодня" onClick={state.dismissDailyNotice}><X /></button></section>}

    <section className="pinned-dashboard" aria-label="Закреплённые элементы главного экрана">
      {visible("motivation") && <button className="pinned-card motivation-pin" onClick={onEmergency}><span>Моя опора</span><b>«{state.profile?.motivation}»</b><small>Нажмите, если нужна помощь при тяге</small></button>}
      {visible("program") && <button className="pinned-card program-pin" onClick={() => onNavigate("today")}><span>Сегодня · день {day.day}</span><b>{todayActivity?.completed ? "День отмечен" : day.title}</b><ProgressBar value={state.completedDays.length} max={365} /><small>{state.completedDays.length} из 365 · открыть текущий день</small></button>}
      {visible("forest") && <button className="pinned-card forest-pin" onClick={() => onNavigate("progress")}><NatureScene compact forest={state.forest} progressDays={state.completedDays.length} /><span><b>{state.forest.length} {russianNoun(state.forest.length, "дерево", "дерева", "деревьев")}</b><small>Лес оживает от действий</small></span></button>}
    </section>

    {visible("counter") && <section className="hero-grid"><div className="timer-hero"><div className="timer-copy"><span className="eyebrow"><span className="live-dot" /> Ты уже без никотина</span><div className="big-counter"><strong>{stats.days}</strong><span>{russianNoun(stats.days, "день", "дня", "дней")}</span><strong>{String(stats.hours).padStart(2, "0")}</strong><span>{russianNoun(stats.hours, "час", "часа", "часов")}</span><strong>{String(stats.minutes).padStart(2, "0")}</strong><span>{russianNoun(stats.minutes, "минута", "минуты", "минут")}</span><strong>{String(stats.seconds).padStart(2, "0")}</strong><span>{russianNoun(stats.seconds, "секунда", "секунды", "секунд")}</span></div><p>Каждая секунда — не запрет, а возвращённое себе время.</p></div><button className="craving-orb" onClick={onEmergency}><i><TimerReset /></i><b>Хочу курить</b><span>Помощь за 10 шагов</span></button></div><div className="daily-quote"><span>Сегодня</span><blockquote>«Я уже меняю свою жизнь.»</blockquote><small>Один день за другим.</small></div></section>}

    {visible("stats") && <section className="stat-grid"><StatCard onClick={() => onNavigate("progress")} icon={<Flame />} label="Текущая серия" value={`${state.streak} дн.`} note={`Лучшая: ${state.bestStreak}`} tone="amber" /><StatCard onClick={() => onNavigate("statistics")} icon={<CigaretteOff />} label="Не выкурено" value={stats.cigarettes.toLocaleString("ru-RU")} note={`${stats.packs.toFixed(1)} пачки`} tone="mint" /><StatCard onClick={() => onNavigate("statistics")} icon={<Coins />} label="Сэкономлено" value={formatMoney(stats.saved)} note={`${formatMoney(stats.daily)} в день`} tone="gold" /><StatCard onClick={() => onNavigate("program")} icon={<CalendarCheck />} label="Программа" value={`${Math.min(365, state.completedDays.length)} / 365`} note={state.activeDay > 365 ? `Продолжение: день ${state.activeDay}` : `Осталось ${365 - state.completedDays.length}`} tone="blue" /></section>}

    {(visible("today") || visible("health")) && <section className="dashboard-grid">{visible("today") && <SectionCard overline={`День ${day.day} · ${day.phase}`} title={day.title} action={{ label: "Открыть день", onClick: () => onNavigate("today") }}><p className="card-lead">{day.description}</p><div className="task-preview"><span><Play size={17} /></span><div><b>Практика дня</b><p>{day.exercise}</p></div></div><div className="reward-row"><span><Sparkles size={16} /> +{day.xp} XP после полной отметки</span><button className="primary-button small" onClick={() => onNavigate("today")}>Начать</button></div></SectionCard>}{visible("health") && <button className="health-card health-card-button" onClick={() => onNavigate("health")}><div><span className="eyebrow">Здоровье</span><h3>Тело восстанавливает баланс</h3><p>Изменения индивидуальны. Откройте научную временную шкалу с источниками.</p><span className="text-button">Смотреть шкалу <HeartPulse size={17} /></span></div><div className="health-rings"><i /><i /><HeartPulse /></div></button>}</section>}

    {visible("forest") && <section className="forest-block"><div className="forest-copy"><span className="eyebrow">Ваш живой прогресс</span><h2>{state.forest.length === 1 ? `${currentNature.kind} набирает силу` : `Лес из ${state.forest.length} ${russianNoun(state.forest.length, "дерева", "деревьев", "деревьев")}`}</h2><p>Каждый новый десятидневный цикл добавляет уникальное дерево. По мере активности появляются птицы, гнёзда, дупла, цветы, животные и вода.</p><ProgressBar value={currentNature.vitality} label={`Цикл ${currentNature.cycle} · рост текущего дерева`} /><div className="forest-meta"><span><Leaf /> {state.forest.length} {russianNoun(state.forest.length, "дерево", "дерева", "деревьев")}</span><span><Award /> {Math.floor(state.completedDays.length / 10)} {russianNoun(Math.floor(state.completedDays.length / 10), "цикл", "цикла", "циклов")}</span></div></div><NatureScene forest={state.forest} progressDays={state.completedDays.length} /></section>}

    {visible("xp") && <button className="xp-banner xp-banner-button" onClick={() => onNavigate("achievements")}><div className="xp-level"><span>{level.level}</span><div><small>Ваш уровень</small><b>Спокойная сила</b></div></div><div className="xp-progress"><div><span>{state.xp} XP</span><span>Ещё {level.toNext} XP до уровня {level.level + 1}</span></div><ProgressBar value={level.inLevel} max={level.needed} /></div><span className="ghost-button">Достижения</span></button>}

    {visible("quick") && <section className="quick-switch"><header><div><span className="eyebrow">Быстрое переключение</span><h3>Куда перейти?</h3></div></header><div>{[
      ["today", "Сегодня", CalendarCheck], ["journals", "Дневники", NotebookTabs], ["games", "Игры", Gamepad2], ["progress", "Лес и календарь", Leaf], ["library", "Библиотека", BookOpen], ["achievements", "Достижения", Award],
    ].map(([id, label, Icon]) => { const IconComponent = Icon as typeof Leaf; return <button key={String(id)} onClick={() => onNavigate(id as AppSection)}><IconComponent /><span>{String(label)}</span></button>; })}</div></section>}

    <Modal open={customize} onClose={() => setCustomize(false)} title="Настроить главный экран"><div className="dashboard-customize"><p>Включите только те блоки, которые хотите видеть. Порядок остаётся логичным: опора и прогресс — сверху, детали — ниже.</p>{widgetLabels.map((item) => <label key={item.id} htmlFor={`widget-${item.id}`} className="widget-toggle"><input id={`widget-${item.id}`} aria-label={item.label} type="checkbox" checked={visible(item.id)} onChange={() => state.toggleDashboardWidget(item.id)} /><span><b>{item.label}</b><small>{item.text}</small></span></label>)}</div></Modal>
  </div>;
}
