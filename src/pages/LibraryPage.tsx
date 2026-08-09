"use client";
import { useMemo, useState } from "react";
import { BookOpen, Check, ExternalLink, Filter, Heart, History, Search, Sparkles } from "lucide-react";
import { Modal } from "@/src/components/Modal";
import { PageIntro } from "@/src/components/ui";
import { allLibraryItems, library, libraryLabels, type LibraryItem } from "@/src/content/library/library";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";

type LibraryType = keyof typeof libraryLabels | "all" | "favorites";

export default function LibraryPage() {
  const state = useLifeHubStore();
  const [type, setType] = useState<LibraryType>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(36);
  const [selected, setSelected] = useState<LibraryItem | null>(null);
  const items = useMemo(() => allLibraryItems.filter((item) => (type === "all" || type === "favorites" ? type !== "favorites" || state.favorites.includes(item.id) : item.type === type) && `${item.title} ${item.author ?? ""} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [type, query, state.favorites]);
  const open = (item: LibraryItem) => { setSelected(item); state.viewMaterial(item.id); };
  return <div className="page-stack"><PageIntro eyebrow={`${allLibraryItems.length} материалов`} title="Библиотека свободы" text="Книги и практические карточки LifeHub: правила, разборы мифов и образовательные факты. Каталоги других приложений и сайтов удалены." actions={<div className="library-history"><History /><span><b>{state.viewHistory.length}</b><small>в истории</small></span></div>} />
    <section className="library-hero"><div><BookOpen /><span><small>Прочитано</small><b>{state.readMaterials.length}</b></span></div><div><Heart /><span><small>В избранном</small><b>{state.favorites.length}</b></span></div><div><Sparkles /><span><small>Получено за чтение</small><b>{state.readMaterials.length * 4} XP</b></span></div></section>
    <section className="section-card library-browser"><header><div className="search-field large"><Search /><input aria-label="Поиск в библиотеке" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(36); }} placeholder="Книга, правило, миф, факт…" /></div><button className="ghost-button" onClick={() => setType("all")}><Filter /> Сбросить фильтр</button></header><div className="library-categories"><button className={type === "all" ? "active" : ""} onClick={() => setType("all")}><span>◈</span><b>Все</b><small>{allLibraryItems.length}</small></button>{Object.entries(libraryLabels).map(([id, label]) => <button key={id} className={type === id ? "active" : ""} onClick={() => { setType(id as LibraryType); setLimit(36); }}><span>{id === "books" ? "▥" : id === "rules" ? "✓" : id === "myths" ? "?" : "✦"}</span><b>{label}</b><small>{library[id as keyof typeof library].length}</small></button>)}<button className={type === "favorites" ? "active" : ""} onClick={() => setType("favorites")}><Heart /><b>Избранное</b><small>{state.favorites.length}</small></button></div>
      <div className="material-grid">{items.slice(0, limit).map((item) => { const read = state.readMaterials.includes(item.id); const favorite = state.favorites.includes(item.id); return <article key={item.id}><div className="material-top"><span>{libraryLabels[item.type]}</span><button aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"} className={favorite ? "favorite" : ""} onClick={() => state.toggleFavorite(item.id)}><Heart /></button></div><button className="material-body" onClick={() => open(item)}><div className="material-symbol">{item.type === "books" ? "К" : item.type === "rules" ? "✓" : item.type === "myths" ? "?" : "✦"}</div><h3>{item.title}</h3>{item.author && <span>{item.author}</span>}<p>{item.description}</p></button><footer>{read ? <span className="read-mark"><Check /> Прочитано</span> : <span>Открыть материал</span>}<ExternalLink /></footer></article>; })}</div>
      {!items.length && <div className="chart-empty">По этому запросу ничего не найдено. Попробуйте короче или выберите другую категорию.</div>}{limit < items.length && <button className="ghost-button load-more" onClick={() => setLimit(limit + 36)}>Показать ещё {Math.min(36, items.length - limit)}</button>}
    </section>
    <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? "Материал"}>{selected && <div className="material-modal"><span className="eyebrow">{libraryLabels[selected.type]} {selected.author ? `· ${selected.author}` : ""}</span><p>{selected.description}</p>{selected.source && <div className="source-box"><b>Источник</b><span>{selected.source}</span></div>}<p className="gentle-note">Внешние материалы могут быть недоступны без интернета. Карточка и отметки сохраняются локально.</p><div className="button-row"><button className="primary-button" onClick={() => state.markRead(selected.id)}>{state.readMaterials.includes(selected.id) ? <><Check /> Прочитано</> : <>Отметить прочитанным · +4 XP</>}</button>{selected.url && <a className="ghost-button" href={selected.url} target="_blank" rel="noreferrer">Открыть источник <ExternalLink /></a>}</div></div>}</Modal>
  </div>;
}
