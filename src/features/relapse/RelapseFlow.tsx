"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, HeartHandshake } from "lucide-react";
import { Modal } from "@/src/components/Modal";
import { SuggestionField } from "@/src/components/SuggestionField";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import type { RelapseEntry } from "@/src/entities/types";
import { uid } from "@/src/utils/calculations";
import { localDateTimeValue } from "@/src/utils/local-date";

type RelapseDraft = Omit<RelapseEntry, "id" | "at"> & { at: string };
const suggestions = {
  situation: ["На встрече с друзьями", "После тяжёлого разговора", "Во время перерыва", "После алкоголя"],
  trigger: ["Стресс", "Кофе", "После еды", "Компания", "Алкоголь", "Скука", "Усталость"],
  mood: ["Напряжение", "Грусть", "Злость", "Усталость", "Одиночество"],
  reason: ["Не подготовил ответ", "Был очень уставшим", "Не заметил нарастание тяги", "Побоялся отказаться в компании"],
  lesson: ["Мне нужен заранее подготовленный ответ", "Важно раньше замечать усталость", "Нужно попросить поддержку"],
  nextPlan: ["Выйду на пять минут и открою экстренную помощь", "Сразу напишу близкому", "Выберу воду и короткую прогулку"],
};
function draft(entry?: RelapseEntry | null): RelapseDraft {
  return entry ? { at: localDateTimeValue(new Date(entry.at)), amount: entry.amount, situation: entry.situation, trigger: entry.trigger, mood: entry.mood, reason: entry.reason, lesson: entry.lesson, nextPlan: entry.nextPlan } : { at: localDateTimeValue(), amount: 1, situation: "", trigger: "", mood: "Напряжение", reason: "", lesson: "", nextPlan: "" };
}

export function RelapseFlow({ open, onClose, entry }: { open: boolean; onClose: () => void; entry?: RelapseEntry | null }) {
  const addRelapse = useLifeHubStore((state) => state.addRelapse);
  const updateRelapse = useLifeHubStore((state) => state.updateRelapse);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<RelapseDraft>(() => draft(entry));
  const close = () => { setStep(0); setSaved(false); onClose(); };
  const save = () => {
    const value: RelapseEntry = { ...form, id: entry?.id ?? uid("relapse"), at: new Date(form.at).toISOString() };
    if (entry) updateRelapse(value); else addRelapse(value);
    setSaved(true);
  };
  return <Modal open={open} onClose={close} title={entry ? "Корректировка разбора" : "Спокойный разбор"} className="relapse-modal"><div className="support-banner"><HeartHandshake /><div><b>Срыв не отменяет твой путь.</b><span>Лес, достижения и история остаются с вами.</span></div></div>{!saved ? <><div className="flow-progress"><span style={{ width: `${(step + 1) / 4 * 100}%` }} /></div><div className="flow-content">
    {step === 0 && <><h3>Что и когда произошло?</h3><div className="form-grid"><label>Дата и время<input type="datetime-local" value={form.at} onChange={(event) => setForm({ ...form, at: event.target.value })} /></label><label>Количество, шт.<input type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: Math.max(1, Number(event.target.value)) })} /></label><SuggestionField className="full" multiline field="relapse-situation" label="Где и в какой ситуации?" value={form.situation} onChange={(situation) => setForm({ ...form, situation })} suggestions={suggestions.situation} placeholder="Без оценки — только факты" /></div></>}
    {step === 1 && <><h3>Что запустило ситуацию?</h3><div className="form-grid"><SuggestionField field="relapse-trigger" label="Триггер" value={form.trigger} onChange={(trigger) => setForm({ ...form, trigger })} suggestions={suggestions.trigger} /><SuggestionField field="relapse-mood" label="Настроение" value={form.mood} onChange={(mood) => setForm({ ...form, mood })} suggestions={suggestions.mood} /><SuggestionField className="full" multiline field="relapse-reason" label="Что было особенно трудно?" value={form.reason} onChange={(reason) => setForm({ ...form, reason })} suggestions={suggestions.reason} /></div></>}
    {step === 2 && <><h3>Что вы узнали?</h3><p>Ищем не виноватого, а одну полезную деталь для следующего раза.</p><SuggestionField multiline field="relapse-lesson" label="Мой вывод" value={form.lesson} onChange={(lesson) => setForm({ ...form, lesson })} suggestions={suggestions.lesson} /></>}
    {step === 3 && <><h3>Следующий маленький план</h3><SuggestionField multiline field="relapse-plan" label="Если похожая ситуация повторится, я…" value={form.nextPlan} onChange={(nextPlan) => setForm({ ...form, nextPlan })} suggestions={suggestions.nextPlan} /><p className="gentle-note">Текущая серия начнётся заново, но общий путь, XP, завершённые дни и лес сохранятся.</p></>}
  </div><footer className="flow-actions"><button className="ghost-button" disabled={step === 0} onClick={() => setStep((value) => value - 1)}><ArrowLeft />Назад</button>{step < 3 ? <button className="primary-button" onClick={() => setStep((value) => value + 1)}>Дальше<ArrowRight /></button> : <button className="primary-button" onClick={save}>Сохранить и продолжить</button>}</footer></> : <div className="flow-success"><span><HeartHandshake /></span><h3>{entry ? "Корректировка сохранена." : "Вы уже вернулись к своему выбору."}</h3><p>Разбор сохранён. Следующее действие может быть маленьким — главное, что оно выбрано вами.</p><button className="primary-button wide" onClick={close}>Продолжить путь</button></div>}</Modal>;
}
