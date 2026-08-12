"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BrainCircuit, Calendar, ChevronRight, CircleGauge, Flame, Heart, MapPin, NotebookPen, Pencil, Plus, RefreshCcw, TrendingDown } from "lucide-react";
import { EmptyState, PageIntro, StatCard } from "@/src/components/ui";
import { Modal } from "@/src/components/Modal";
import { SuggestionField } from "@/src/components/SuggestionField";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import type { CbtEntry, CravingEntry, MoodEntry, RelapseEntry } from "@/src/entities/types";
import { uid } from "@/src/utils/calculations";
import { localDateTimeValue } from "@/src/utils/local-date";

type Tab = "cravings" | "mood" | "cbt" | "relapses";
const tabs: { id: Tab; label: string; icon: typeof Flame }[] = [
  { id: "cravings", label: "Тяга", icon: Flame },
  { id: "mood", label: "Настроение", icon: Heart },
  { id: "cbt", label: "CBT-разбор", icon: BrainCircuit },
  { id: "relapses", label: "Срывы", icon: RefreshCcw },
];

const cravingSuggestions = {
  place: ["Дом", "Работа", "Улица", "Машина", "Кафе"],
  trigger: ["Стресс", "Кофе", "После еды", "Компания", "Алкоголь", "Скука", "Усталость"],
  situation: ["Перерыв на работе", "После еды", "Напряжённый разговор", "Увидел, как курят другие"],
  mood: ["Спокойствие", "Напряжение", "Грусть", "Злость", "Усталость", "Радость"],
  thought: ["Одна сигарета поможет", "Я не выдержу", "Мне нужен перерыв", "Это волна — она пройдёт"],
  action: ["Выпил воды", "Вышел пройтись", "Подышал", "Написал близкому", "Открыл LifeHub"],
  helped: ["Дыхание", "Вода", "Движение", "Разговор", "Игра", "Смена места"],
  result: ["Тяга снизилась", "Тяга прошла", "Стало легче", "Нужна дополнительная поддержка"],
};

const moodLabels = ["Очень тяжело", "Тяжело", "Ниже среднего", "Спокойно", "Хорошо", "Очень хорошо", "Отлично"];
const moodFaces = ["◔", "◕", "◒", "◐", "◕", "✦", "☀"];
const cbtSuggestions: Record<string, string[]> = {
  situation: ["Напряжённый разговор", "Перерыв на работе", "Увидел сигареты", "Вечер после тяжёлого дня"],
  thought: ["Мне нужна сигарета", "Я не справлюсь", "Один раз не считается", "Я уже достаточно терпел"],
  emotion: ["Тревога", "Злость", "Грусть", "Разочарование", "Напряжение"],
  facts: ["Тяга уже проходила раньше", "Сигарета не решит причину", "У меня есть план на 10 минут"],
  alternative: ["Это временная волна, а не приказ", "Мне нужен перерыв, не никотин", "Я могу выбрать действие на ближайшие 10 минут"],
  action: ["Выпью воды", "Пройдусь пять минут", "Открою экстренную помощь", "Напишу близкому"],
  result: ["Напряжение снизилось", "Появился следующий шаг", "Тяга стала переносимой"],
};

export default function JournalsPage({ onRelapse, onEditRelapse }: { onRelapse: () => void; onEditRelapse?: (entry: RelapseEntry) => void }) {
  const state = useLifeHubStore();
  const [tab, setTab] = useState<Tab>("cravings");
  const [showForm, setShowForm] = useState(false);
  const openNew = () => tab === "relapses" ? onRelapse() : setShowForm(true);
  return <div className="page-stack">
    <PageIntro eyebrow="Наблюдать, а не судить" title="Дневники" text="Записи помогают увидеть повторяющиеся ситуации и найти то, что действительно работает для вас." actions={<button className="primary-button" onClick={openNew}><Plus />Новая запись</button>} />
    <div className="journal-tabs">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setShowForm(false); }}><Icon />{label}<span>{id === "cravings" ? state.cravings.length : id === "mood" ? state.moods.length : id === "cbt" ? state.cbtEntries.length : state.relapses.length}</span></button>)}</div>
    {tab === "cravings" && <CravingJournal showForm={showForm} onDone={() => setShowForm(false)} />}
    {tab === "mood" && <MoodJournal showForm={showForm} onDone={() => setShowForm(false)} />}
    {tab === "cbt" && <CbtJournal showForm={showForm} onDone={() => setShowForm(false)} />}
    {tab === "relapses" && <RelapseJournal onAdd={onRelapse} onEdit={onEditRelapse} />}
  </div>;
}

function CravingJournal({ showForm, onDone }: { showForm: boolean; onDone: () => void }) {
  const { cravings, addCraving, updateCraving } = useLifeHubStore();
  const [selected, setSelected] = useState<CravingEntry | null>(null);
  const [editing, setEditing] = useState<CravingEntry | null>(null);
  const stats = useMemo(() => {
    const count = (key: "trigger" | "helped") => Object.entries(cravings.reduce<Record<string, number>>((total, item) => {
      const value = item[key] || "Не указано";
      total[value] = (total[value] ?? 0) + 1;
      return total;
    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { avg: cravings.length ? cravings.reduce((sum, item) => sum + item.intensity, 0) / cravings.length : 0, max: cravings.length ? Math.max(...cravings.map((item) => item.intensity)) : 0, trigger: count("trigger"), help: count("helped") };
  }, [cravings]);
  const formOpen = showForm || Boolean(editing);
  const closeForm = () => { setEditing(null); onDone(); };
  return <div className="page-stack">
    <section className="stat-grid compact"><StatCard icon={<CircleGauge />} label="Средняя тяга" value={`${stats.avg.toFixed(1)} / 10`} tone="amber" /><StatCard icon={<TrendingDown />} label="Максимальная" value={`${stats.max} / 10`} tone="blue" /><StatCard icon={<Flame />} label="Частый триггер" value={stats.trigger} tone="mint" /><StatCard icon={<NotebookPen />} label="Лучше помогает" value={stats.help} tone="gold" /></section>
    {formOpen && <CravingEditor key={editing?.id ?? "new"} initial={editing ?? undefined} onCancel={closeForm} onSave={(entry) => { if (editing) updateCraving(entry); else addCraving(entry); closeForm(); }} />}
    <EntryList entries={cravings.map((item) => ({ id: item.id, at: item.at, icon: <Flame />, title: `${item.trigger || "Тяга"} · ${item.intensity}/10`, meta: `${item.place || "Место не указано"} · ${item.mood || "Настроение не указано"}`, text: item.helped ? `Помогло: ${item.helped}` : item.situation }))} emptyTitle="Записей о тяге пока нет" emptyText="Первая запись поможет заметить триггер и сохранить удачное действие." onOpen={(id) => setSelected(cravings.find((entry) => entry.id === id) ?? null)} />
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Запись о тяге"><EntryDetails rows={selected ? [["Дата и время", displayDate(selected.at)], ["Место", selected.place], ["Ситуация", selected.situation], ["Триггер", selected.trigger], ["Уровень тяги", `${selected.intensity}/10`], ["Настроение", selected.mood], ["Автоматическая мысль", selected.thought], ["Что сделал", selected.action], ["Что помогло", selected.helped], ["Результат", selected.result]] : []} onEdit={() => { if (selected) setEditing(selected); setSelected(null); }} /></Modal>
  </div>;
}

function newCravingDraft() { return { place: "", situation: "", trigger: "Стресс", intensity: 5, mood: "Напряжение", thought: "", action: "", helped: "", result: "Тяга снизилась" }; }
function CravingEditor({ initial, onCancel, onSave }: { initial?: CravingEntry; onCancel: () => void; onSave: (entry: CravingEntry) => void }) {
  const [form, setForm] = useState<Omit<CravingEntry, "id" | "at">>(initial ? { place: initial.place, situation: initial.situation, trigger: initial.trigger, intensity: initial.intensity, mood: initial.mood, thought: initial.thought, action: initial.action, helped: initial.helped, result: initial.result } : newCravingDraft());
  const [at, setAt] = useState(localDateTimeValue(initial ? new Date(initial.at) : new Date()));
  const change = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  return <section className="entry-form"><header><div><span className="eyebrow">{initial ? "Корректировка записи" : "Новая запись"}</span><h3>Что происходило с тягой?</h3></div><span className="xp-pill">{initial ? "Без повторного XP" : "+12 XP"}</span></header><div className="form-grid">
    <DateTimeField value={at} onChange={setAt} />
    <SuggestionField field="place" label="Место" value={form.place} onChange={(value) => change("place", value)} suggestions={cravingSuggestions.place} />
    <SuggestionField field="trigger" label="Триггер" value={form.trigger} onChange={(value) => change("trigger", value)} suggestions={cravingSuggestions.trigger} />
    <SuggestionField className="full" multiline field="situation" label="Ситуация" value={form.situation} onChange={(value) => change("situation", value)} suggestions={cravingSuggestions.situation} />
    <label className="full">Уровень тяги: <b>{form.intensity}/10</b><input className="range" type="range" min="1" max="10" value={form.intensity} onChange={(event) => change("intensity", Number(event.target.value))} /></label>
    <SuggestionField field="mood" label="Настроение" value={form.mood} onChange={(value) => change("mood", value)} suggestions={cravingSuggestions.mood} />
    <SuggestionField className="full" multiline field="thought" label="Автоматическая мысль" value={form.thought} onChange={(value) => change("thought", value)} suggestions={cravingSuggestions.thought} />
    <SuggestionField field="action" label="Что сделал" value={form.action} onChange={(value) => change("action", value)} suggestions={cravingSuggestions.action} />
    <SuggestionField field="helped" label="Что помогло" value={form.helped} onChange={(value) => change("helped", value)} suggestions={cravingSuggestions.helped} />
    <SuggestionField className="full" field="result" label="Результат" value={form.result} onChange={(value) => change("result", value)} suggestions={cravingSuggestions.result} />
  </div><div className="button-row"><button className="ghost-button" onClick={onCancel}>Отмена</button><button className="primary-button" disabled={!form.trigger || !form.result} onClick={() => onSave({ ...form, id: initial?.id ?? uid("craving"), at: new Date(at).toISOString() })}>Сохранить запись</button></div></section>;
}

function MoodJournal({ showForm, onDone }: { showForm: boolean; onDone: () => void }) {
  const { moods, addMood, updateMood } = useLifeHubStore();
  const [selected, setSelected] = useState<MoodEntry | null>(null);
  const [editing, setEditing] = useState<MoodEntry | null>(null);
  const formOpen = showForm || Boolean(editing);
  const closeForm = () => { setEditing(null); onDone(); };
  return <div className="page-stack">
    {formOpen && <MoodEditor key={editing?.id ?? "new"} initial={editing ?? undefined} onCancel={closeForm} onSave={(entry) => { if (editing) updateMood(entry); else addMood(entry); closeForm(); }} />}
    <section className="mood-chart-simple">{moods.slice(0, 14).reverse().map((item) => <div key={item.id} title={`${displayDate(item.at)}: ${item.score}/7`}><span style={{ height: `${item.score / 7 * 100}%` }} /><small>{new Date(item.at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</small></div>)}</section>
    <EntryList entries={moods.map((item) => ({ id: item.id, at: item.at, icon: <Heart />, title: `Настроение ${item.score}/7`, meta: moodLabels[item.score - 1], text: item.note || "Без заметки" }))} emptyTitle="Дневник настроения ждёт первую отметку" emptyText="Одной оценки и пары слов достаточно, чтобы начать видеть связи." onOpen={(id) => setSelected(moods.find((entry) => entry.id === id) ?? null)} />
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Запись настроения"><EntryDetails rows={selected ? [["Дата и время", displayDate(selected.at)], ["Оценка", `${selected.score}/7 · ${moodLabels[selected.score - 1]}`], ["Заметка", selected.note]] : []} onEdit={() => { if (selected) setEditing(selected); setSelected(null); }} /></Modal>
  </div>;
}

function MoodEditor({ initial, onCancel, onSave }: { initial?: MoodEntry; onCancel: () => void; onSave: (entry: MoodEntry) => void }) {
  const [score, setScore] = useState(initial?.score ?? 4);
  const [note, setNote] = useState(initial?.note ?? "");
  const [at, setAt] = useState(localDateTimeValue(initial ? new Date(initial.at) : new Date()));
  return <section className="entry-form mood-form"><header><div><span className="eyebrow">{initial ? "Корректировка записи" : "Новая запись"}</span><h3>Как вы себя чувствуете?</h3></div><span className="xp-pill">{initial ? "Без повторного XP" : "+5 XP"}</span></header><div className="form-grid"><DateTimeField value={at} onChange={setAt} /></div><div className="mood-scale">{moodLabels.map((label, index) => <button type="button" key={label} className={score === index + 1 ? "active" : ""} onClick={() => setScore(index + 1)}><span>{moodFaces[index]}</span><small>{label}</small></button>)}</div><SuggestionField multiline field="mood-note" label="Короткая заметка" value={note} onChange={setNote} suggestions={["Хорошо выспался", "Было много дел", "Поддержал близкий человек", "Сильная усталость", "Спокойный день"]} placeholder="Что повлияло на настроение?" /><div className="button-row"><button className="ghost-button" onClick={onCancel}>Отмена</button><button className="primary-button" onClick={() => onSave({ id: initial?.id ?? uid("mood"), at: new Date(at).toISOString(), score, note })}>Сохранить настроение</button></div></section>;
}

function CbtJournal({ showForm, onDone }: { showForm: boolean; onDone: () => void }) {
  const { cbtEntries, addCbt, updateCbt } = useLifeHubStore();
  const [selected, setSelected] = useState<CbtEntry | null>(null);
  const [editing, setEditing] = useState<CbtEntry | null>(null);
  const formOpen = showForm || Boolean(editing);
  const closeForm = () => { setEditing(null); onDone(); };
  return <div className="page-stack">
    {formOpen && <CbtEditor key={editing?.id ?? "new"} initial={editing ?? undefined} onCancel={closeForm} onSave={(entry) => { if (editing) updateCbt(entry); else addCbt(entry); closeForm(); }} />}
    <EntryList entries={cbtEntries.map((item) => ({ id: item.id, at: item.at, icon: <BrainCircuit />, title: item.situation || "CBT-разбор", meta: `${item.emotion || "Эмоция не указана"} · ${item.intensity}/10`, text: `Новая мысль: ${item.alternative || "не записана"}` }))} emptyTitle="CBT-разборов пока нет" emptyText="Разложите трудную ситуацию на части — это помогает увидеть следующий шаг яснее." onOpen={(id) => setSelected(cbtEntries.find((entry) => entry.id === id) ?? null)} />
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="CBT-разбор"><EntryDetails rows={selected ? [["Дата и время", displayDate(selected.at)], ["Ситуация", selected.situation], ["Автоматическая мысль", selected.thought], ["Эмоция", `${selected.emotion} · ${selected.intensity}/10`], ["Факты", selected.facts], ["Альтернативная мысль", selected.alternative], ["Новое действие", selected.action], ["Результат", selected.result]] : []} onEdit={() => { if (selected) setEditing(selected); setSelected(null); }} /></Modal>
  </div>;
}

const cbtFields: { key: keyof Omit<CbtEntry, "id" | "at" | "intensity">; label: string; placeholder: string }[] = [
  { key: "situation", label: "1. Ситуация", placeholder: "Что произошло?" },
  { key: "thought", label: "2. Автоматическая мысль", placeholder: "Что мгновенно промелькнуло?" },
  { key: "emotion", label: "3. Эмоция", placeholder: "Что вы почувствовали?" },
  { key: "facts", label: "5. Факты", placeholder: "Что подтверждает и не подтверждает мысль?" },
  { key: "alternative", label: "6. Альтернативная мысль", placeholder: "Более точная и поддерживающая версия" },
  { key: "action", label: "7. Новое действие", placeholder: "Что вы выберете сделать?" },
  { key: "result", label: "8. Результат", placeholder: "Что изменилось?" },
];
function newCbtDraft(): Omit<CbtEntry, "id" | "at"> { return { situation: "", thought: "", emotion: "", intensity: 5, facts: "", alternative: "", action: "", result: "" }; }
function CbtEditor({ initial, onCancel, onSave }: { initial?: CbtEntry; onCancel: () => void; onSave: (entry: CbtEntry) => void }) {
  const [form, setForm] = useState<Omit<CbtEntry, "id" | "at">>(initial ? { situation: initial.situation, thought: initial.thought, emotion: initial.emotion, intensity: initial.intensity, facts: initial.facts, alternative: initial.alternative, action: initial.action, result: initial.result } : newCbtDraft());
  const [at, setAt] = useState(localDateTimeValue(initial ? new Date(initial.at) : new Date()));
  return <section className="entry-form cbt-form"><header><div><span className="eyebrow">Когнитивно-поведенческий разбор</span><h3>От ситуации к новому действию</h3></div><span className="xp-pill">{initial ? "Без повторного XP" : "+18 XP"}</span></header><div className="form-grid"><DateTimeField value={at} onChange={setAt} /></div><div className="cbt-chain">{cbtFields.map(({ key, label, placeholder }, index) => <div key={key}><SuggestionField multiline field={`cbt-${key}`} label={label} value={form[key]} onChange={(value) => setForm((current) => ({ ...current, [key]: value }))} placeholder={placeholder} suggestions={cbtSuggestions[key]} />{index < cbtFields.length - 1 && <ChevronRight />}</div>)}</div><label>4. Интенсивность эмоции: <b>{form.intensity}/10</b><input className="range" type="range" min="1" max="10" value={form.intensity} onChange={(event) => setForm((current) => ({ ...current, intensity: Number(event.target.value) }))} /></label><div className="button-row"><button className="ghost-button" onClick={onCancel}>Отмена</button><button className="primary-button" disabled={!form.situation || !form.thought} onClick={() => onSave({ ...form, id: initial?.id ?? uid("cbt"), at: new Date(at).toISOString() })}>Сохранить разбор</button></div></section>;
}

function RelapseJournal({ onAdd, onEdit }: { onAdd: () => void; onEdit?: (entry: RelapseEntry) => void }) {
  const relapses = useLifeHubStore((state) => state.relapses);
  const [selected, setSelected] = useState<RelapseEntry | null>(null);
  return <div className="page-stack"><div className="support-banner large"><RefreshCcw /><div><b>История нужна не для наказания</b><span>Каждая запись сохраняет контекст, вывод и план. Прогресс и лес остаются с вами.</span></div><button className="primary-button" onClick={onAdd}>Спокойно разобрать ситуацию</button></div><EntryList entries={relapses.map((item) => ({ id: item.id, at: item.at, icon: <RefreshCcw />, title: item.trigger || "Сложный эпизод", meta: `${item.amount} шт. · ${item.mood || "настроение не указано"}`, text: item.nextPlan ? `Следующий план: ${item.nextPlan}` : item.lesson }))} emptyTitle="Записей о срывах нет" emptyText="Если это произойдёт, LifeHub поможет разобрать ситуацию без осуждения и продолжить." onOpen={(id) => setSelected(relapses.find((entry) => entry.id === id) ?? null)} /><Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Разбор ситуации"><EntryDetails rows={selected ? [["Дата и время", displayDate(selected.at)], ["Количество", `${selected.amount} шт.`], ["Ситуация", selected.situation], ["Триггер", selected.trigger], ["Настроение", selected.mood], ["Что было трудно", selected.reason], ["Вывод", selected.lesson], ["Следующий план", selected.nextPlan]] : []} onEdit={onEdit && selected ? () => { onEdit(selected); setSelected(null); } : undefined} /></Modal></div>;
}

function DateTimeField({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <label>Дата и время<input type="datetime-local" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function EntryDetails({ rows, onEdit }: { rows: [string, string][]; onEdit?: () => void }) { return <div className="entry-details"><p className="gentle-note">Запись связана с датой устройства и отмечена в календаре активности.</p><dl>{rows.filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{onEdit && <button className="primary-button wide" onClick={onEdit}><Pencil />Исправить запись</button>}</div>; }
function displayDate(value: string) { return new Date(value).toLocaleString("ru-RU", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

function EntryList({ entries, emptyTitle, emptyText, onOpen }: { entries: { id: string; at: string; icon: ReactNode; title: string; meta: string; text: string }[]; emptyTitle: string; emptyText: string; onOpen: (id: string) => void }) {
  if (!entries.length) return <section className="section-card"><EmptyState icon={<NotebookPen />} title={emptyTitle} text={emptyText} /></section>;
  return <section className="section-card entry-list"><header><div><span className="eyebrow">История</span><h3>Последние записи</h3></div><span>{entries.length}</span></header>{entries.map((entry) => <article key={entry.id}><button className="entry-card-button" type="button" onClick={() => onOpen(entry.id)} aria-label={`Открыть запись: ${entry.title}`}><span className="entry-icon">{entry.icon}</span><div><div><b>{entry.title}</b><small><Calendar />{new Date(entry.at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</small></div><span><MapPin />{entry.meta}</span><p>{entry.text || "Открыть подробности"}</p></div></button></article>)}</section>;
}
