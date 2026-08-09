"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, HeartHandshake } from "lucide-react";
import { Modal } from "@/src/components/Modal";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { uid } from "@/src/utils/calculations";
import { SuggestionField } from "@/src/components/SuggestionField";
import { localDateTimeValue } from "@/src/utils/local-date";

export function RelapseFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addRelapse = useLifeHubStore((state) => state.addRelapse);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ at: localDateTimeValue(), amount: 1, situation: "", trigger: "", mood: "Напряжение", reason: "", lesson: "", nextPlan: "" });
  const close = () => { setStep(0); setSaved(false); onClose(); };
  const save = () => { addRelapse({ ...form, id: uid("relapse"), at: new Date(form.at).toISOString() }); setSaved(true); };
  return <Modal open={open} onClose={close} title="Спокойный разбор" className="relapse-modal"><div className="support-banner"><HeartHandshake /><div><b>Срыв не отменяет твой путь.</b><span>Лес, достижения и история остаются с вами.</span></div></div>{!saved ? <><div className="flow-progress"><span style={{ width: `${(step + 1) / 4 * 100}%` }} /></div><div className="flow-content">
    {step === 0 && <><h3>Что и когда произошло?</h3><div className="form-grid"><label>Дата и время<input type="datetime-local" value={form.at} onChange={(e) => setForm({ ...form, at: e.target.value })} /></label><label>Количество<input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></label><SuggestionField className="full" multiline field="relapse-situation" label="Где и в какой ситуации?" value={form.situation} onChange={(situation) => setForm({ ...form, situation })} suggestions={["На встрече с друзьями", "После тяжёлого разговора", "Во время перерыва", "После алкоголя"]} placeholder="Без оценки — только факты" /></div></>}
    {step === 1 && <><h3>Что запустило ситуацию?</h3><div className="form-grid"><SuggestionField className="full" field="trigger" label="Триггер" value={form.trigger} onChange={(trigger) => setForm({ ...form, trigger })} /><SuggestionField field="mood" label="Настроение" value={form.mood} onChange={(mood) => setForm({ ...form, mood })} /><SuggestionField className="full" multiline field="relapse-reason" label="Что было особенно трудно?" value={form.reason} onChange={(reason) => setForm({ ...form, reason })} suggestions={["Не подготовил ответ", "Был очень уставшим", "Не заметил нарастание тяги", "Побоялся отказаться в компании"]} /></div></>}
    {step === 2 && <><h3>Что вы узнали?</h3><p>Ищем не виноватого, а одну полезную деталь для следующего раза.</p><SuggestionField multiline field="relapse-lesson" label="Мой вывод" value={form.lesson} onChange={(lesson) => setForm({ ...form, lesson })} suggestions={["Мне нужен заранее подготовленный ответ", "Важно раньше замечать усталость", "Нужно попросить поддержку"]} /></>}
    {step === 3 && <><h3>Следующий маленький план</h3><SuggestionField multiline field="relapse-plan" label="Если похожая ситуация повторится, я…" value={form.nextPlan} onChange={(nextPlan) => setForm({ ...form, nextPlan })} suggestions={["Выйду на пять минут и открою экстренную помощь", "Сразу напишу близкому", "Выберу воду и короткую прогулку"]} /><p className="gentle-note">Текущая серия начнётся заново, но общий путь, XP, завершённые дни и лес сохранятся.</p></>}
  </div><footer className="flow-actions"><button className="ghost-button" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft /> Назад</button>{step < 3 ? <button className="primary-button" onClick={() => setStep(step + 1)}>Дальше <ArrowRight /></button> : <button className="primary-button" onClick={save}>Сохранить и продолжить</button>}</footer></> : <div className="flow-success"><span><HeartHandshake /></span><h3>Вы уже вернулись к своему выбору.</h3><p>Разбор сохранён. Текущий природный объект временно потерял часть жизненности и восстановится с новыми действиями.</p><button className="primary-button wide" onClick={close}>Продолжить путь</button></div>}</Modal>;
}
