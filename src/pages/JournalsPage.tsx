"use client";
import { useMemo, useState } from "react";
import { BrainCircuit, Calendar, ChevronRight, CircleGauge, Flame, Heart, MapPin, NotebookPen, Plus, RefreshCcw, TrendingDown } from "lucide-react";
import { EmptyState, PageIntro, StatCard } from "@/src/components/ui";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { uid } from "@/src/utils/calculations";
import { SuggestionField } from "@/src/components/SuggestionField";

type Tab = "cravings" | "mood" | "cbt" | "relapses";
const tabs: { id: Tab; label: string; icon: typeof Flame }[] = [{ id: "cravings", label: "Тяга", icon: Flame }, { id: "mood", label: "Настроение", icon: Heart }, { id: "cbt", label: "CBT-разбор", icon: BrainCircuit }, { id: "relapses", label: "Срывы", icon: RefreshCcw }];

export default function JournalsPage({ onRelapse }: { onRelapse: () => void }) {
  const state = useLifeHubStore();
  const [tab, setTab] = useState<Tab>("cravings");
  const [showForm, setShowForm] = useState(false);
  return <div className="page-stack"><PageIntro eyebrow="Наблюдать, а не судить" title="Дневники" text="Записи помогают видеть повторяющиеся ситуации и находить то, что действительно работает для вас." actions={<button className="primary-button" onClick={() => tab === "relapses" ? onRelapse() : setShowForm(true)}><Plus /> Новая запись</button>} />
    <div className="journal-tabs">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setShowForm(false); }}><Icon />{label}<span>{id === "cravings" ? state.cravings.length : id === "mood" ? state.moods.length : id === "cbt" ? state.cbtEntries.length : state.relapses.length}</span></button>)}</div>
    {tab === "cravings" && <CravingJournal showForm={showForm} onDone={() => setShowForm(false)} />}
    {tab === "mood" && <MoodJournal showForm={showForm} onDone={() => setShowForm(false)} />}
    {tab === "cbt" && <CbtJournal showForm={showForm} onDone={() => setShowForm(false)} />}
    {tab === "relapses" && <RelapseJournal onAdd={onRelapse} />}
  </div>;
}

function CravingJournal({ showForm, onDone }: { showForm: boolean; onDone: () => void }) {
  const { cravings, addCraving } = useLifeHubStore();
  const [form, setForm] = useState({ place: "", situation: "", trigger: "Стресс", intensity: 5, mood: "Напряжение", thought: "", action: "", helped: "", result: "Тяга снизилась" });
  const stats = useMemo(() => {
    const triggers = cravings.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.trigger || "Не указан"]: (acc[item.trigger || "Не указан"] ?? 0) + 1 }), {});
    const helps = cravings.reduce<Record<string, number>>((acc, item) => item.helped ? ({ ...acc, [item.helped]: (acc[item.helped] ?? 0) + 1 }) : acc, {});
    return { avg: cravings.length ? cravings.reduce((sum, item) => sum + item.intensity, 0) / cravings.length : 0, max: cravings.length ? Math.max(...cravings.map((item) => item.intensity)) : 0, trigger: Object.entries(triggers).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—", help: Object.entries(helps).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—" };
  }, [cravings]);
  const save = () => { addCraving({ ...form, id: uid("craving"), at: new Date().toISOString() }); onDone(); };
  return <div className="page-stack"><section className="stat-grid compact"><StatCard icon={<CircleGauge />} label="Средняя тяга" value={`${stats.avg.toFixed(1)} / 10`} tone="amber" /><StatCard icon={<TrendingDown />} label="Максимальная" value={`${stats.max} / 10`} tone="blue" /><StatCard icon={<Flame />} label="Частый триггер" value={stats.trigger} tone="mint" /><StatCard icon={<NotebookPen />} label="Лучше помогает" value={stats.help} tone="gold" /></section>
    {showForm && <section className="entry-form"><header><div><span className="eyebrow">Новая запись</span><h3>Что происходит с тягой?</h3></div><span className="xp-pill">+12 XP</span></header><div className="form-grid"><SuggestionField field="place" label="Место" value={form.place} onChange={(place) => setForm({ ...form, place })} suggestions={["Дом", "Работа", "Улица", "Машина", "Кафе"]} /><SuggestionField field="trigger" label="Триггер" value={form.trigger} onChange={(trigger) => setForm({ ...form, trigger })} suggestions={["Стресс", "Кофе", "После еды", "Компания", "Алкоголь", "Скука", "Усталость"]} /><SuggestionField className="full" multiline field="situation" label="Ситуация" value={form.situation} onChange={(situation) => setForm({ ...form, situation })} suggestions={["Перерыв на работе", "После еды", "Разговор вызвал напряжение", "Увидел, как курят другие"]} /><label className="full">Уровень тяги: <b>{form.intensity}/10</b><input className="range" type="range" min="1" max="10" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: Number(e.target.value) })} /></label><SuggestionField field="mood" label="Настроение" value={form.mood} onChange={(mood) => setForm({ ...form, mood })} suggestions={["Спокойствие", "Напряжение", "Грусть", "Злость", "Усталость", "Радость"]} /><SuggestionField className="full" field="thought" label="Автоматическая мысль" value={form.thought} onChange={(thought) => setForm({ ...form, thought })} suggestions={["Одна сигарета поможет", "Я не выдержу", "Мне нужен перерыв", "Это просто волна, она пройдёт"]} /><SuggestionField field="action" label="Что сделал" value={form.action} onChange={(action) => setForm({ ...form, action })} /><SuggestionField field="helped" label="Что помогло" value={form.helped} onChange={(helped) => setForm({ ...form, helped })} /><SuggestionField className="full" field="result" label="Результат" value={form.result} onChange={(result) => setForm({ ...form, result })} suggestions={["Тяга снизилась", "Тяга прошла", "Стало легче", "Нужна дополнительная поддержка"]} /></div><div className="button-row"><button className="ghost-button" onClick={onDone}>Отмена</button><button className="primary-button" disabled={!form.trigger || !form.result} onClick={save}>Сохранить запись</button></div></section>}
    <EntryList entries={cravings.map((item) => ({ id: item.id, at: item.at, icon: <Flame />, title: `${item.trigger || "Тяга"} · ${item.intensity}/10`, meta: `${item.place || "Место не указано"} · ${item.mood}`, text: item.helped ? `Помогло: ${item.helped}` : item.situation }))} emptyTitle="Записей о тяге пока нет" emptyText="Первая запись поможет заметить триггер и сохранить удачное действие." />
  </div>;
}

function MoodJournal({ showForm, onDone }: { showForm: boolean; onDone: () => void }) {
  const { moods, addMood } = useLifeHubStore(); const [score, setScore] = useState(4); const [note, setNote] = useState("");
  const labels = ["Очень тяжело", "Тяжело", "Ниже среднего", "Спокойно", "Хорошо", "Очень хорошо", "Отлично"];
  const save = () => { addMood({ id: uid("mood"), at: new Date().toISOString(), score, note }); setNote(""); onDone(); };
  return <div className="page-stack">{showForm && <section className="entry-form mood-form"><header><div><span className="eyebrow">Сегодня</span><h3>Как вы себя чувствуете?</h3></div><span className="xp-pill">+5 XP</span></header><div className="mood-scale">{labels.map((label, index) => <button key={label} className={score === index + 1 ? "active" : ""} onClick={() => setScore(index + 1)}><span>{["◔", "◑", "◒", "●", "◕", "✦", "☀"][index]}</span><small>{label}</small></button>)}</div><SuggestionField multiline field="moodNote" label="Короткая заметка" value={note} onChange={setNote} suggestions={["Хорошо выспался", "Было много дел", "Поддержал близкий человек", "Сильная усталость", "Спокойный день"]} placeholder="Что повлияло на настроение?" /><div className="button-row"><button className="ghost-button" onClick={onDone}>Отмена</button><button className="primary-button" onClick={save}>Сохранить настроение</button></div></section>}
    <section className="mood-chart-simple">{moods.slice(0, 14).reverse().map((item) => <div key={item.id} title={`${new Date(item.at).toLocaleDateString("ru-RU")}: ${item.score}/7`}><span style={{ height: `${item.score / 7 * 100}%` }} /><small>{new Date(item.at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</small></div>)}</section><EntryList entries={moods.map((item) => ({ id: item.id, at: item.at, icon: <Heart />, title: `Настроение ${item.score}/7`, meta: labels[item.score - 1], text: item.note }))} emptyTitle="Дневник настроения ждёт первую отметку" emptyText="Одной оценки и пары слов достаточно, чтобы начать видеть связи." /></div>;
}

function CbtJournal({ showForm, onDone }: { showForm: boolean; onDone: () => void }) {
  const { cbtEntries, addCbt } = useLifeHubStore(); const empty = { situation: "", thought: "", emotion: "", intensity: 5, facts: "", alternative: "", action: "", result: "" }; const [form, setForm] = useState(empty);
  const fields: [keyof typeof empty, string, string][] = [["situation", "1. Ситуация", "Что произошло?"], ["thought", "2. Автоматическая мысль", "Что мгновенно промелькнуло?"], ["emotion", "3. Эмоция", "Что вы почувствовали?"], ["facts", "5. Факты", "Что подтверждает и что не подтверждает мысль?"], ["alternative", "6. Альтернативная мысль", "Более точная и поддерживающая версия"], ["action", "7. Новое действие", "Что вы выбираете сделать?"], ["result", "8. Результат", "Что изменилось?"]];
  const save = () => { addCbt({ ...form, id: uid("cbt"), at: new Date().toISOString() }); setForm(empty); onDone(); };
  return <div className="page-stack">{showForm && <section className="entry-form cbt-form"><header><div><span className="eyebrow">Когнитивно-поведенческий разбор</span><h3>От ситуации к новому действию</h3></div><span className="xp-pill">+18 XP</span></header><div className="cbt-chain">{fields.map(([key, label, placeholder], index) => <div key={key}><SuggestionField multiline field={`cbt-${String(key)}`} label={label} value={String(form[key])} onChange={(value) => setForm({ ...form, [key]: value })} placeholder={placeholder} suggestions={key === "emotion" ? ["Тревога", "Злость", "Грусть", "Разочарование", "Напряжение"] : []} />{index < fields.length - 1 && <ChevronRight />}</div>)}</div><label>4. Интенсивность эмоции: <b>{form.intensity}/10</b><input className="range" type="range" min="1" max="10" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: Number(e.target.value) })} /></label><div className="button-row"><button className="ghost-button" onClick={onDone}>Отмена</button><button className="primary-button" disabled={!form.situation || !form.thought} onClick={save}>Сохранить разбор</button></div></section>}
    <EntryList entries={cbtEntries.map((item) => ({ id: item.id, at: item.at, icon: <BrainCircuit />, title: item.situation, meta: `${item.emotion} · ${item.intensity}/10`, text: `Новая мысль: ${item.alternative || "не записана"}` }))} emptyTitle="CBT-разборов пока нет" emptyText="Разложите трудную ситуацию на части — это часто делает следующий выбор яснее." /></div>;
}

function RelapseJournal({ onAdd }: { onAdd: () => void }) {
  const relapses = useLifeHubStore((state) => state.relapses);
  return <div className="page-stack"><div className="support-banner large"><RefreshCcw /><div><b>История нужна не для наказания</b><span>Каждая запись сохраняет контекст, вывод и план. Прогресс и лес остаются с вами.</span></div><button className="primary-button" onClick={onAdd}>Спокойно разобрать ситуацию</button></div><EntryList entries={relapses.map((item) => ({ id: item.id, at: item.at, icon: <RefreshCcw />, title: item.trigger || "Сложный эпизод", meta: `${item.amount} · ${item.mood}`, text: item.nextPlan ? `Следующий план: ${item.nextPlan}` : item.lesson }))} emptyTitle="Записей о срывах нет" emptyText="Если это произойдёт, LifeHub поможет разобрать ситуацию без осуждения и продолжить." /></div>;
}

function EntryList({ entries, emptyTitle, emptyText }: { entries: { id: string; at: string; icon: React.ReactNode; title: string; meta: string; text: string }[]; emptyTitle: string; emptyText: string }) {
  if (!entries.length) return <section className="section-card"><EmptyState icon={<NotebookPen />} title={emptyTitle} text={emptyText} /></section>;
  return <section className="section-card entry-list"><header><div><span className="eyebrow">История</span><h3>Последние записи</h3></div><span>{entries.length}</span></header>{entries.map((entry) => <article key={entry.id}><span className="entry-icon">{entry.icon}</span><div><div><b>{entry.title}</b><small><Calendar />{new Date(entry.at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</small></div><span><MapPin />{entry.meta}</span><p>{entry.text}</p></div></article>)}</section>;
}
