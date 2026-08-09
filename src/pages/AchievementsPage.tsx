"use client";
import { useMemo, useState } from "react";
import { Award, LockKeyhole, Search, Sparkles } from "lucide-react";
import { PageIntro, ProgressBar } from "@/src/components/ui";
import { achievements } from "@/src/content/achievements/achievements";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { quitStats } from "@/src/utils/calculations";

export default function AchievementsPage() {
  const state = useLifeHubStore();
  const [filter, setFilter] = useState("Все");
  const [query, setQuery] = useState("");
  const stats = quitStats(state.profile);
  const progressFor = (category: string) => ({ "Дни свободы": stats.days, "Серии": state.bestStreak, "Программа": state.completedDays.length, "Тяга": state.emergencySessions.length, "Дневники": state.cravings.length + state.moods.length + state.cbtEntries.length + state.relapses.length, "Знания": state.readMaterials.length, "Экономия": Math.floor(stats.saved / 100), "Здоровье": stats.days, "Природа": state.forest.length, "Игры": Math.floor(state.xp / 20), XP: Math.floor(state.xp / 10) }[category] ?? 0);
  const visible = useMemo(() => achievements.filter((item) => (filter === "Все" || item.category === filter) && item.title.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  const unlocked = achievements.filter((item) => progressFor(item.category) >= item.target);
  const categories = ["Все", ...new Set(achievements.map((item) => item.category))];
  return <div className="page-stack"><PageIntro eyebrow={`${achievements.length} уникальных достижений`} title="Коллекция вашего пути" text="Обычные, редкие и скрытые награды. Ничего не исчезает после паузы или срыва." actions={<div className="achievement-total"><Award /><span><b>{unlocked.length}</b><small>открыто</small></span></div>} />
    <section className="achievement-hero"><div className="big-badge"><span>✦</span><i /><i /></div><div><span className="eyebrow">Следующая награда</span><h3>{achievements.find((item) => !unlocked.includes(item))?.title ?? "Все доступные рубежи открыты"}</h3><p>{achievements.find((item) => !unlocked.includes(item))?.description}</p><ProgressBar value={unlocked.length} max={achievements.length} label="Общая коллекция" /></div></section>
    <section className="section-card achievement-browser"><header><div><span className="eyebrow">Коллекция</span><h3>{filter}</h3></div><div className="search-field"><Search /><input aria-label="Поиск достижений" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти награду" /></div></header><div className="filter-pills scroll">{categories.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="achievement-grid">{visible.map((item) => { const isUnlocked = progressFor(item.category) >= item.target; return <article key={item.id} className={`${isUnlocked ? "unlocked" : "locked"} rarity-${item.rarity.toLowerCase()}`}><div className="achievement-icon">{isUnlocked ? item.icon : <LockKeyhole />}</div><div><span>{item.rarity} · {item.category}</span><h4>{item.rarity === "Скрытое" && !isUnlocked ? "Скрытая награда" : item.title}</h4><p>{item.rarity === "Скрытое" && !isUnlocked ? "Условие откроется вместе с достижением." : item.description}</p></div>{isUnlocked && <Sparkles className="badge-spark" />}</article>; })}</div></section>
  </div>;
}
