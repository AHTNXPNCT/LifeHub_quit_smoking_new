"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Droplets, Footprints, Gamepad2, Heart, Sparkles, Wind } from "lucide-react";
import { Modal } from "@/src/components/Modal";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { uid } from "@/src/utils/calculations";

const reasons = ["Стресс", "Привычный момент", "Компания", "Скука", "Алкоголь", "Усталость", "После еды", "Другое"];
const steps = ["Оценка", "Причина", "Дыхание", "Вода", "Движение", "Мысль", "Причина отказа", "Переключение", "Мини-игра", "Снова оценка", "Готово"];

export function EmergencyFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [before, setBefore] = useState(6);
  const [after, setAfter] = useState(3);
  const [reason, setReason] = useState("Стресс");
  const [taps, setTaps] = useState(0);
  const profile = useLifeHubStore((state) => state.profile);
  const addEmergency = useLifeHubStore((state) => state.addEmergency);
  const close = () => { setStep(0); setTaps(0); setBefore(6); setAfter(3); onClose(); };
  const finish = () => { addEmergency({ id: uid("wave"), at: new Date().toISOString(), before, after, reason, completed: true }); setStep(10); };
  const next = () => step === 9 ? finish() : setStep((value) => Math.min(10, value + 1));
  return <Modal open={open} onClose={close} title="Пережить волну" className="emergency-modal"><div className="flow-progress"><span style={{ width: `${step / 10 * 100}%` }} /></div><div className="flow-meta"><span>Шаг {Math.min(step + 1, 10)} из 10</span><b>{steps[step]}</b></div><div className="flow-content">
    {step === 0 && <><span className="flow-icon"><Sparkles /></span><h3>Насколько сильна тяга прямо сейчас?</h3><p>Не нужно быть точным. Просто выберите ближайшее число.</p><div className="range-value">{before}<small>/10</small></div><input aria-label="Сила тяги до упражнения" className="range" type="range" min="1" max="10" value={before} onChange={(e) => setBefore(Number(e.target.value))} /></>}
    {step === 1 && <><h3>Что запустило эту волну?</h3><p>Название причины уже немного отделяет её от действия.</p><div className="choice-grid">{reasons.map((item) => <button key={item} className={reason === item ? "selected" : ""} onClick={() => setReason(item)}>{item}</button>)}</div></>}
    {step === 2 && <><span className="flow-icon breathing"><Wind /></span><h3>Три медленных цикла</h3><p>Вдохните на 4 счёта, задержитесь на 2, выдыхайте на 6. Не форсируйте дыхание.</p><div className="breath-orb"><span>вдох · пауза · выдох</span></div></>}
    {step === 3 && <><span className="flow-icon"><Droplets /></span><h3>Сделайте несколько глотков воды</h3><p>Почувствуйте температуру, движение и короткую паузу. Это не магия — это смена сценария.</p><div className="water-glass"><i /></div></>}
    {step === 4 && <><span className="flow-icon"><Footprints /></span><h3>Верните движение телу</h3><p>Встаньте, расправьте плечи и сделайте 20 спокойных шагов или мягко потянитесь.</p><div className="movement-line">1 <i /> 5 <i /> 10 <i /> 20</div></>}
    {step === 5 && <><h3>Мысль — это не команда</h3><p>Если звучит «мне нужна сигарета», попробуйте: <b>«Я замечаю мысль, что мне нужна сигарета. Тяга пройдёт, а решение останется моим».</b></p><blockquote>Импульс можно почувствовать и не выполнять.</blockquote></>}
    {step === 6 && <><span className="flow-icon"><Heart /></span><h3>Ваша личная причина</h3><blockquote className="motivation-quote">«{profile?.motivation}»</blockquote><p>Прямо сейчас достаточно защитить следующие десять минут, не весь будущий год.</p></>}
    {step === 7 && <><h3>Выберите быстрое переключение</h3><div className="choice-grid"><button>Открыть окно</button><button>Умыться</button><button>Написать близкому</button><button>Почистить зубы</button><button>Включить музыку</button><button>Выйти из комнаты</button></div></>}
    {step === 8 && <><span className="flow-icon"><Gamepad2 /></span><h3>Поймайте пять искр</h3><p>Переключите зрительное внимание на короткую игру.</p><button className="tap-game" onClick={() => setTaps((value) => Math.min(5, value + 1))} aria-label="Поймать искру"><span style={{ transform: `translate(${(taps * 47) % 120 - 60}px, ${(taps * 31) % 80 - 40}px)` }}>✦</span></button><b>{taps}/5</b></>}
    {step === 9 && <><h3>Оцените тягу ещё раз</h3><p>Даже небольшое изменение — важная информация.</p><div className="range-value">{after}<small>/10</small></div><input aria-label="Сила тяги после упражнения" className="range" type="range" min="1" max="10" value={after} onChange={(e) => setAfter(Number(e.target.value))} /></>}
    {step === 10 && <div className="flow-success"><span><Check /></span><h3>Ты пережил эту волну.</h3><p>Было {before}/10, стало {after}/10. Результат сохранён. Если тяга всё ещё сильная, можно повторить цикл или связаться с человеком, которому вы доверяете.</p><button className="primary-button wide" onClick={close}>Вернуться в LifeHub</button></div>}
  </div>{step < 10 && <footer className="flow-actions"><button className="ghost-button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft /> Назад</button><button className="primary-button" onClick={next} disabled={step === 8 && taps < 5}>{step === 9 ? "Сохранить" : "Дальше"} <ArrowRight /></button></footer>}</Modal>;
}
