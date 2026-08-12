"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Sparkles } from "lucide-react";
import { Modal } from "@/src/components/Modal";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { uid } from "@/src/utils/calculations";

type WaveRoute = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  steps: string[];
};

const reasons = ["Стресс", "Привычный момент", "Компания", "Скука", "Алкоголь", "Усталость", "После еды", "Другое"];

// These are complete, different routes. A person chooses one route and marks
// every action in it before the session can be completed and rewarded.
const waveRoutes: WaveRoute[] = [
  { id: "breath", icon: "◌", title: "Дыхательный якорь", subtitle: "снизить напряжение", description: "Подходит, когда тело напряжено или хочется действовать немедленно.", steps: ["Сядьте устойчиво и опустите плечи.", "Сделайте 3 цикла: вдох на 4, пауза на 2, выдох на 6.", "Назовите вслух: «Я пережидаю волну, а не выполняю её»." ] },
  { id: "water", icon: "≈", title: "Вода и ощущения", subtitle: "сменить сценарий", description: "Небольшая сенсорная пауза вместо привычного автоматического действия.", steps: ["Налейте воду в любимый стакан.", "Сделайте 7 небольших глотков, замечая температуру.", "Умойте лицо или подержите прохладную воду на запястьях." ] },
  { id: "walk", icon: "↟", title: "20 спокойных шагов", subtitle: "вернуть движение", description: "Подходит, когда тяга накопилась после сидения, работы или разговора.", steps: ["Встаньте и расправьте плечи.", "Пройдите 20 шагов в спокойном темпе.", "На каждом пятом шаге медленно выдыхайте." ] },
  { id: "place", icon: "↗", title: "Смена места", subtitle: "разорвать привычную связку", description: "Полезно в знакомом месте, где раньше автоматически курили.", steps: ["Выйдите из комнаты, на балкон без сигарет или в общий коридор.", "Оставьте телефон в руке, но не открывайте привычные триггеры.", "Побудьте в новом месте 3 минуты и выберите следующее дело." ] },
  { id: "grounding", icon: "◎", title: "Заземление 5–4–3–2–1", subtitle: "вернуться в настоящий момент", description: "Для тревоги, сильных мыслей и ощущения, что тяга захватывает всё внимание.", steps: ["Назовите 5 предметов, которые видите.", "Назовите 4 вещи, которых можете коснуться, и 3 звука вокруг.", "Назовите 2 запаха и 1 добрую фразу для себя." ] },
  { id: "thought", icon: "✦", title: "Разговор с мыслью", subtitle: "не подчиняться импульсу", description: "Для фраз вроде «мне срочно нужна сигарета» или «я не выдержу».", steps: ["Запишите или произнесите автоматическую мысль.", "Добавьте перед ней: «Я замечаю мысль, что…».", "Выберите одну альтернативу: вода, шаги, сообщение или игра." ] },
  { id: "contact", icon: "♥", title: "Контакт и поддержка", subtitle: "не оставаться одному", description: "Когда тяга связана с одиночеством, обидой или потребностью в поддержке.", steps: ["Выберите человека, которому можно написать без объяснений.", "Отправьте короткое сообщение: «У меня волна тяги, побудь со мной 5 минут».", "Пока ждёте ответ, сделайте 10 спокойных вдохов." ] },
  { id: "music", icon: "♫", title: "Музыка и ритм", subtitle: "переключить состояние", description: "Когда хочется наполнить паузу чем-то знакомым и безопасным.", steps: ["Включите одну песню, которая даёт вам опору.", "Слушайте только её — без ленты и новостей.", "Двигайтесь в ритм или отбивайте его пальцами до конца песни." ] },
  { id: "hands", icon: "✋", title: "Занять руки", subtitle: "дать телу другое действие", description: "Полезно для привычки держать сигарету или делать паузу руками.", steps: ["Возьмите ручку, мячик, чашку или другой предмет в руки.", "Сделайте 2 минуты простого дела: протереть поверхность, сложить вещи или полить растение.", "Отметьте, как изменилось напряжение в руках и плечах." ] },
  { id: "focus", icon: "⌁", title: "Игра на внимание", subtitle: "занять ум на несколько минут", description: "Когда нужно быстро переключить мозг с импульса на задачу.", steps: ["Откройте мини-игру LifeHub или найдите 5 предметов одного цвета вокруг.", "Удерживайте внимание на задаче 2 минуты.", "После этого сделайте повторную оценку тяги, не торопясь." ] },
];

const stageNames = ["Оценка", "Причина", "Маршрут", "Практика", "Новая оценка", "Готово"];

export function EmergencyFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState(0);
  const [before, setBefore] = useState(6);
  const [after, setAfter] = useState(3);
  const [reason, setReason] = useState("Стресс");
  const [routeId, setRouteId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const profile = useLifeHubStore((state) => state.profile);
  const addEmergency = useLifeHubStore((state) => state.addEmergency);
  const route = useMemo(() => waveRoutes.find((item) => item.id === routeId) ?? null, [routeId]);
  const routeFinished = Boolean(route && completedSteps.length === route.steps.length);

  const close = () => {
    setStage(0);
    setBefore(6);
    setAfter(3);
    setReason("Стресс");
    setRouteId(null);
    setCompletedSteps([]);
    onClose();
  };
  const selectRoute = (id: string) => { setRouteId(id); setCompletedSteps([]); };
  const toggleRouteStep = (index: number) => setCompletedSteps((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  const finish = () => {
    if (!route || !routeFinished) return;
    addEmergency({ id: uid("wave"), at: new Date().toISOString(), before, after, reason, copingChoice: route.title, completed: true });
    setStage(5);
  };
  const next = () => stage === 4 ? finish() : setStage((value) => Math.min(5, value + 1));
  const canContinue = stage !== 2 || Boolean(route);
  const canFinishRoute = stage !== 3 || routeFinished;

  return <Modal open={open} onClose={close} title="Хочу курить: пережить волну" className="emergency-modal">
    <div className="flow-progress"><span style={{ width: `${stage / 5 * 100}%` }} /></div>
    <div className="flow-meta"><span>Этап {Math.min(stage + 1, 5)} из 5</span><b>{stageNames[stage]}</b></div>
    <div className="flow-content">
      {stage === 0 && <><span className="flow-icon"><Sparkles /></span><h3>Насколько сильна тяга прямо сейчас?</h3><p>Не нужно быть точным. Просто выберите ближайшее число.</p><div className="range-value">{before}<small>/10</small></div><input aria-label="Сила тяги до упражнения" className="range" type="range" min="1" max="10" value={before} onChange={(event) => setBefore(Number(event.target.value))} /></>}
      {stage === 1 && <><h3>Что запустило эту волну?</h3><p>Название причины немного отделяет её от действия.</p><div className="choice-grid">{reasons.map((item) => <button key={item} className={reason === item ? "selected" : ""} onClick={() => setReason(item)}>{item}</button>)}</div><blockquote className="motivation-quote">«{profile?.motivation}»</blockquote></>}
      {stage === 2 && <><h3>Выберите свой путь на ближайшие минуты</h3><p>Это 10 разных маршрутов. Выберите один: его шаги откроются на следующем экране.</p><div className="wave-route-grid">{waveRoutes.map((item, index) => <button key={item.id} className={routeId === item.id ? "selected" : ""} onClick={() => selectRoute(item.id)}><span className="wave-route-number">{index + 1}</span><span className="wave-route-icon" aria-hidden="true">{item.icon}</span><b>{item.title}</b><small>{item.subtitle}</small></button>)}</div></>}
      {stage === 3 && route && <><span className="flow-icon"><Heart /></span><span className="eyebrow">Маршрут: {route.title}</span><h3>{route.subtitle}</h3><p>{route.description}</p><div className="route-step-list">{route.steps.map((item, index) => <button key={item} type="button" className={completedSteps.includes(index) ? "done" : ""} aria-pressed={completedSteps.includes(index)} onClick={() => toggleRouteStep(index)}><span>{completedSteps.includes(index) ? <Check /> : index + 1}</span><b>{item}</b></button>)}</div><p className="route-progress">Выполнено шагов: {completedSteps.length} из {route.steps.length}</p></>}
      {stage === 4 && <><h3>Оцените тягу ещё раз</h3><p>Даже небольшое изменение — важная информация. Вы прошли маршрут «{route?.title}».</p><div className="range-value">{after}<small>/10</small></div><input aria-label="Сила тяги после упражнения" className="range" type="range" min="1" max="10" value={after} onChange={(event) => setAfter(Number(event.target.value))} /></>}
      {stage === 5 && <div className="flow-success"><span><Check /></span><h3>Ты пережил эту волну.</h3><p>Было {before}/10, стало {after}/10. Сохранён маршрут: «{route?.title}». Это не случайный клик: вы прошли все его шаги.</p><button className="primary-button wide" onClick={close}>Вернуться в LifeHub</button></div>}
    </div>
    {stage < 5 && <footer className="flow-actions"><button className="ghost-button" disabled={stage === 0} onClick={() => setStage((value) => Math.max(0, value - 1))}><ArrowLeft />Назад</button><button className="primary-button" onClick={next} disabled={!canContinue || !canFinishRoute}>{stage === 4 ? "Сохранить результат" : stage === 2 ? "Открыть маршрут" : "Дальше"}<ArrowRight /></button></footer>}
  </Modal>;
}
