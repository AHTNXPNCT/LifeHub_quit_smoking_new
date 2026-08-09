"use client";

import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleAlert, Flame, History, Leaf, Pause, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import type { AppSection } from "@/src/app/LifeHubClient";
import { Modal } from "@/src/components/Modal";
import { PageIntro, ProgressBar, StatCard } from "@/src/components/ui";
import { useNow } from "@/src/hooks/use-now";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { formatLocalDay, localDateKey } from "@/src/utils/local-date";
import { quitStats } from "@/src/utils/calculations";
import { NatureScene } from "@/src/widgets/NatureScene";
import { russianCount, russianNoun } from "@/src/utils/russian";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function ProgressPage({ onNavigate }: { onNavigate: (section: AppSection) => void }) {
  const now = useNow(30000);
  const nowDate = new Date(now);
  const state = useLifeHubStore();
  const stats = quitStats(state.profile, now);
  const [monthOffset, setMonthOffset] = useState(0);
  const month = new Date(nowDate.getFullYear(), nowDate.getMonth() + monthOffset, 1);
  const monthYear = month.getFullYear();
  const monthIndex = month.getMonth();
  const [selected, setSelected] = useState<string | null>(null);
  const calendar = (() => {
    const first = new Date(monthYear, monthIndex, 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(first); date.setDate(1 - offset + index);
      const key = localDateKey(date);
      return { key, date, outside: date.getMonth() !== monthIndex, activity: state.activity.find((item) => item.date === key) };
    });
  })();
  const selectedActivity = selected ? state.activity.find((item) => item.date === selected) : undefined;
  const currentMonth = monthOffset === 0;
  const scrollCalendar = () => document.getElementById("activity-calendar")?.scrollIntoView({ behavior: state.reducedMotion ? "auto" : "smooth" });

  return <div className="page-stack"><PageIntro eyebrow="История сохраняется полностью" title="Ваш путь без обнулений" text="Серия показывает текущий ритм, общий путь — всё время с точки отказа, программа — выполненные шаги, а лес — ежедневную активность." actions={<button className="ghost-button" onClick={() => state.setPaused(!state.paused)}>{state.paused ? <Play /> : <Pause />} {state.paused ? "Продолжить" : "Пауза"}</button>} />
    <section className="stat-grid"><StatCard onClick={() => onNavigate("program")} icon={<CalendarDays />} label="Программа" value={`${state.completedDays.length} / 365`} note={`${Math.max(0, 365 - state.completedDays.length)} осталось`} tone="mint" /><StatCard onClick={scrollCalendar} icon={<Flame />} label="Текущая серия" value={russianCount(state.streak, "день", "дня", "дней")} note={`Рекорд ${state.bestStreak}`} tone="amber" /><StatCard onClick={scrollCalendar} icon={<History />} label="Общий путь" value={russianCount(stats.days, "день", "дня", "дней")} note={`${stats.hours} ч ${stats.minutes} мин`} tone="blue" /><StatCard onClick={() => document.getElementById("living-forest")?.scrollIntoView({ behavior: "smooth" })} icon={<Leaf />} label="Природный цикл" value={`${state.forest.at(-1)?.vitality ?? 0}%`} note={`${state.forest.length} ${russianNoun(state.forest.length, "дерево", "дерева", "деревьев")}`} tone="gold" /></section>

    <section id="living-forest" className="forest-collection"><div className="forest-heading"><div><span className="eyebrow">Личная экосистема</span><h3>Ваш живой лес</h3><p>Первое дерево растёт сразу. При переходе к новому десятидневному циклу рядом появляется следующее — уникального вида и формы.</p></div><div className="forest-total"><Leaf /><span><b>{state.forest.length}</b><small>{russianNoun(state.forest.length, "дерево", "дерева", "деревьев")}</small></span></div></div><NatureScene forest={state.forest} progressDays={state.completedDays.length} /><div className="forest-gallery">{state.forest.map((item, index) => <NatureScene key={item.id} compact vitality={item.vitality} cycle={item.cycle} kind={item.kind} progressDays={Math.min(state.completedDays.length, index * 10 + 10)} />)}</div></section>

    <section id="activity-calendar" className="section-card activity-calendar"><header><div><span className="eyebrow">Интерактивная история</span><h3>Календарь активности</h3></div><div className="calendar-nav"><button className="icon-button" aria-label="Предыдущий месяц" onClick={() => setMonthOffset((value) => value - 1)}><ChevronLeft /></button><b>{month.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</b><button className="icon-button" disabled={currentMonth} aria-label="Следующий месяц" onClick={() => setMonthOffset((value) => Math.min(0, value + 1))}><ChevronRight /></button></div></header><div className="calendar-legend"><span><i className="done" /> выполнен</span><span><i className="hard" /> сложный</span><span><i className="relapse" /> срыв</span><span><i /> без записи</span></div><div className="month-grid" role="grid" aria-label={`Календарь за ${month.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}`}>{weekDays.map((day) => <span className="weekday" key={day}>{day}</span>)}{calendar.map(({ key, date, outside, activity }) => <button key={key} role="gridcell" onClick={() => setSelected(key)} className={`${outside ? "outside" : ""} ${key === localDateKey(nowDate) ? "today" : ""} ${activity?.relapse ? "relapse" : activity?.difficult ? "hard" : activity?.completed ? "done" : activity ? "active" : ""}`} aria-label={`${formatLocalDay(key)}: ${activity ? activity.tasks.join(", ") : "нет записей"}`}><span>{date.getDate()}</span>{activity && <i>{activity.relapse ? "!" : activity.completed ? <Check /> : activity.tasks.length}</i>}<small>{activity?.xp ? `+${activity.xp} XP` : ""}</small></button>)}</div><div className="calendar-note"><CircleAlert /> Нажмите на любую дату: откроются задания, записи, XP и состояние дня. Информация обозначается не только цветом.</div></section>

    <section className="section-card"><header><div><span className="eyebrow">365 дней</span><h3>Общий прогресс программы</h3></div><b>{Math.round(state.completedDays.length / 365 * 100)}%</b></header><ProgressBar value={state.completedDays.length} max={365} /><div className="phase-bars">{[["Старт", 10], ["Новые модели", 30], ["Закрепление", 90], ["Устойчивость", 180], ["Идентичность", 270], ["Полный круг", 365]].map(([label, end], index, all) => { const start = index ? Number(all[index - 1][1]) + 1 : 1; const total = Number(end) - start + 1; const complete = state.completedDays.filter((day) => day >= start && day <= Number(end)).length; return <div key={label}><span>{complete >= total ? <Check /> : index + 1}</span><div><b>{label}</b><small>{complete}/{total}</small></div><ProgressBar value={complete} max={total} /></div>; })}</div></section>

    <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected ? formatLocalDay(selected) : "День"}><div className="calendar-day-modal">{selectedActivity ? <><div className={`day-state ${selectedActivity.relapse ? "relapse" : selectedActivity.difficult ? "hard" : selectedActivity.completed ? "done" : "active"}`}><span>{selectedActivity.relapse ? "Срыв разобран" : selectedActivity.completed ? "День программы выполнен" : selectedActivity.difficult ? "Сложный день" : "Есть активность"}</span><b>{selectedActivity.xp} XP</b></div><h3>Что отмечено</h3><ul>{selectedActivity.tasks.map((task) => <li key={task}><Check />{task}</li>)}</ul>{selectedActivity.at && <p>Последняя отметка: {new Date(selectedActivity.at).toLocaleString("ru-RU")}</p>}</> : <div className="calendar-empty"><CalendarDays /><h3>Записей за этот день нет</h3><p>Это не ошибка и не наказание. История начинает заполняться после дневной отметки, дневника, экстренной помощи или пройденного уровня игры.</p></div>}<div className="button-row"><button className="ghost-button" onClick={() => { setSelected(null); onNavigate("journals"); }}>Открыть дневники</button>{selected === localDateKey(nowDate) && <button className="primary-button" onClick={() => { setSelected(null); onNavigate("today"); }}><Sparkles /> Сегодняшний день</button>}</div></div></Modal>
  </div>;
}
