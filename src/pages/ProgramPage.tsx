"use client";
import { useMemo, useState } from "react";
import { Check, ChevronRight, LockKeyhole, Search, Sparkles } from "lucide-react";
import { Modal } from "@/src/components/Modal";
import { PageIntro, ProgressBar } from "@/src/components/ui";
import { getProgramDay, program365, programPhases } from "@/src/content/days/program";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import type { AppSection } from "@/src/app/LifeHubClient";
import { russianNoun } from "@/src/utils/russian";

export default function ProgramPage({ onNavigate }: { onNavigate: (section: AppSection) => void }) {
  const { activeDay, completedDays } = useLifeHubStore();
  const [phase, setPhase] = useState("Все этапы");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const items = useMemo(() => program365.filter((day) => (phase === "Все этапы" || day.phase === phase) && `${day.title} ${day.category}`.toLowerCase().includes(query.toLowerCase())), [phase, query]);
  const selectedDay = selected ? getProgramDay(selected) : null;
  return <div className="page-stack"><PageIntro eyebrow="Контент-движок" title="Программа на 365 дней" text="Каждый день — отдельная тема, практика и вопрос. Проходите в собственном темпе: пауза не стирает историю." />
    <section className="program-overview"><div><span className="program-number">{Math.min(activeDay, 365)}</span><small>текущий день</small></div><div className="program-progress"><div><b>{completedDays.length} {russianNoun(completedDays.length, "день завершён", "дня завершено", "дней завершено")}</b><span>{Math.max(0, 365 - completedDays.length)} до полного круга</span></div><ProgressBar value={completedDays.length} max={365} /></div><div className="program-beyond"><Sparkles /><span><b>После дня 365</b><small>Откроется режим продолжения: 366, 367 и далее.</small></span></div></section>
    <div className="phase-track">{programPhases.map((item) => { const done = completedDays.filter((day) => day >= item.from && day <= item.to).length; return <button key={item.name} onClick={() => setPhase(item.name)} className={phase === item.name ? "active" : ""}><span>{item.from}–{item.to}</span><b>{item.name}</b><small>{done}/{item.to - item.from + 1}</small></button>; })}</div>
    <section className="section-card program-list-card"><header><div><span className="eyebrow">Все материалы</span><h3>{phase}</h3></div><div className="search-field"><Search size={17} /><input aria-label="Поиск по программе" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти тему" /></div></header><div className="filter-pills"><button className={phase === "Все этапы" ? "active" : ""} onClick={() => setPhase("Все этапы")}>Все этапы</button>{programPhases.map((item) => <button key={item.name} className={phase === item.name ? "active" : ""} onClick={() => setPhase(item.name)}>{item.name}</button>)}</div><div className="program-list">{items.map((day) => { const complete = completedDays.includes(day.day); const future = day.day > activeDay; return <button key={day.day} onClick={() => setSelected(day.day)} className={`program-row ${day.day === activeDay ? "current" : ""}`}><span className={`day-status ${complete ? "complete" : future ? "future" : ""}`}>{complete ? <Check /> : future ? <LockKeyhole /> : day.day}</span><span className="program-row-copy"><small>{day.category} · {day.phase}</small><b>{day.title}</b><p>{day.description}</p></span><span className="row-xp">{future ? "По очереди" : `+${day.xp} XP`}</span><ChevronRight /></button>; })}</div></section>
    <Modal open={selected !== null} onClose={() => setSelected(null)} title={selectedDay ? `День ${selectedDay.day}: ${selectedDay.title}` : "День"}>{selectedDay && <div className="day-modal-content"><span className="eyebrow">{selectedDay.phase} · {selectedDay.category}</span><p>{selectedDay.description}</p><h4>Факт</h4><p>{selectedDay.fact}</p><h4>Практика</h4><p>{selectedDay.exercise}</p><h4>Миссия</h4><p>{selectedDay.mission}</p><blockquote>{selectedDay.question}</blockquote><div className="reward-row"><span><Sparkles /> {selectedDay.xp} XP</span><small>{selectedDay.completionCondition}</small></div>{selectedDay.day === activeDay ? <button className="primary-button wide" onClick={() => { setSelected(null); onNavigate("today"); }}>Открыть и выполнить текущий день</button> : selectedDay.day > activeDay ? <p className="gentle-note"><LockKeyhole /> День откроется по порядку после отметки предыдущих дней и смены даты устройства.</p> : <p className="gentle-note"><Check /> Этот день доступен для просмотра в истории и не начисляет XP повторно.</p>}</div>}</Modal>
  </div>;
}
