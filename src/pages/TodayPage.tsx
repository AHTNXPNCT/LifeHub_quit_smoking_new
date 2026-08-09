"use client";
import { useState } from "react";
import { Brain, CalendarClock, Check, ChevronDown, FlaskConical, Footprints, HelpCircle, Lightbulb, LockKeyhole, MessageCircleQuestion, Sparkles } from "lucide-react";
import { PageIntro, ProgressBar } from "@/src/components/ui";
import { getProgramDay } from "@/src/content/days/program";
import { canCompleteProgramDay, useLifeHubStore } from "@/src/store/use-lifehub-store";
import type { DayDraft } from "@/src/entities/types";
import { formatLocalDay, localDateKey } from "@/src/utils/local-date";

export default function TodayPage() {
  const activeDay = useLifeHubStore((state) => state.activeDay);
  return <TodayDay key={activeDay} dayNumber={activeDay} />;
}

function TodayDay({ dayNumber }: { dayNumber: number }) {
  const state = useLifeHubStore();
  const { completedDays, completeDay, updateDayDraft } = state;
  const day = getProgramDay(dayNumber);
  const alreadyDone = completedDays.includes(day.day);
  const savedDraft = state.dayDrafts[String(day.day)];
  const [checked, setChecked] = useState(savedDraft?.checks ?? [false, false, false]);
  const [answer, setAnswer] = useState(savedDraft?.answer ?? "");
  const [testAnswer, setTestAnswer] = useState<number | null>(savedDraft?.testAnswer ?? null);
  const saveDraft = (next: Partial<DayDraft>) => updateDayDraft(day.day, { checks: checked, answer, testAnswer, updatedAt: new Date().toISOString(), ...next });
  const testReady = !day.test || testAnswer === day.test.answer;
  const canFinish = checked.every(Boolean) && answer.trim().length > 2 && testReady;
  const availableToday = canCompleteProgramDay(state, day.day);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const lockText = state.paused ? "Программа на паузе" : state.lastProgramCompletionDate === localDateKey() ? `Следующий день откроется ${formatLocalDay(localDateKey(tomorrow))}` : "Доступен текущий день";
  return <div className="page-stack today-page"><PageIntro eyebrow={`${day.phase} · ${day.category}`} title={`День ${day.day}. ${day.title}`} text={day.description} actions={<div className="today-date-badges"><span className="xp-pill"><CalendarClock /> {new Date().toLocaleDateString("ru-RU")}</span><span className="xp-pill"><Sparkles /> {day.xp} XP</span></div>} />
    <div className={`day-availability ${availableToday ? "available" : "locked"}`}><span>{availableToday ? <CalendarClock /> : <LockKeyhole />}</span><div><b>{lockText}</b><small>LifeHub использует дату устройства. За один календарный день можно отметить только один день программы.</small></div></div>
    <div className="today-layout"><div className="lesson-column">
      <article className="lesson-card fact-card"><header><span><FlaskConical /></span><div><small>Научный факт</small><h3>Важно понимать</h3></div></header><p>{day.fact}</p><details><summary>Источник <ChevronDown /></summary><p>{day.source}</p></details></article>
      <article className="lesson-card"><header><span><Brain /></span><div><small>Психологическая техника</small><h3>Новый способ отвечать</h3></div></header><p>{day.technique}</p></article>
      <article className="lesson-card mission-card"><header><span><Footprints /></span><div><small>Практика и мини-миссия</small><h3>Отметьте каждое выполненное действие</h3></div></header><div className="check-list">{[day.exercise, day.mission, day.recommendation].map((item, index) => <label key={item} className={checked[index] ? "done" : ""}><input type="checkbox" checked={checked[index]} onChange={() => { const next = checked.map((value, i) => i === index ? !value : value); setChecked(next); saveDraft({ checks: next }); }} /><span><Check /></span><p>{item}</p></label>)}</div></article>
      {day.test && <article className="lesson-card"><header><span><HelpCircle /></span><div><small>Мини-тест</small><h3>{day.test.question}</h3></div></header><div className="test-options">{day.test.options.map((option, index) => <button key={option} onClick={() => { setTestAnswer(index); saveDraft({ testAnswer: index }); }} className={testAnswer === index ? index === day.test?.answer ? "correct" : "wrong" : ""}>{option}</button>)}</div>{testAnswer !== null && <p className="test-feedback">{testAnswer === day.test.answer ? "Верно: маленькое осознанное действие укрепляет навык." : "Попробуйте выбрать ответ, где есть наблюдение и конкретное действие."}</p>}</article>}
    </div><aside className="reflection-card"><span className="reflection-icon"><MessageCircleQuestion /></span><small>Вопрос дня</small><h3>{day.question}</h3><textarea rows={8} value={answer} onChange={(e) => { setAnswer(e.target.value); saveDraft({ answer: e.target.value }); }} placeholder="Запишите пару честных строк…" /><div className="autosave-note"><Check size={14} /> Черновик автоматически сохраняется на устройстве</div><ProgressBar value={checked.filter(Boolean).length + (answer.trim().length > 2 ? 1 : 0) + (day.test && testReady ? 1 : 0)} max={day.test ? 5 : 4} label="Готовность дня" /><button className="primary-button wide" disabled={!canFinish || alreadyDone || !availableToday} onClick={() => completeDay(day.day, day.xp)}>{alreadyDone ? <><Check /> День завершён</> : !availableToday ? <><LockKeyhole /> {lockText}</> : <><Sparkles /> Отметить день выполненным · +{day.xp} XP</>}</button><div className="gentle-note"><Lightbulb /> Отметка доступна только после всех действий, ответа и правильного мини-теста. Следующий день откроется по дате устройства.</div></aside></div>
  </div>;
}
