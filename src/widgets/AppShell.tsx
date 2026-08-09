"use client";

import type { ReactNode } from "react";
import { Award, BarChart3, Bell, CalendarDays, CheckCircle2, ChevronRight, Gamepad2, HeartPulse, HelpCircle, Home, Leaf, Library, Menu, NotebookTabs, Settings, Sparkles, Target, X } from "lucide-react";
import { useState } from "react";
import type { AppSection } from "@/src/app/LifeHubClient";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { xpLevel } from "@/src/utils/calculations";
import { localDateKey } from "@/src/utils/local-date";

const nav: { id: AppSection; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Главная", icon: Home }, { id: "today", label: "Сегодня", icon: Target },
  { id: "progress", label: "Прогресс", icon: Leaf }, { id: "journals", label: "Дневники", icon: NotebookTabs },
  { id: "program", label: "Программа", icon: CalendarDays }, { id: "games", label: "Игры", icon: Gamepad2 },
  { id: "health", label: "Здоровье", icon: HeartPulse }, { id: "statistics", label: "Статистика", icon: BarChart3 },
  { id: "achievements", label: "Достижения", icon: Award }, { id: "library", label: "Библиотека", icon: Library },
  { id: "help", label: "Справка", icon: HelpCircle }, { id: "settings", label: "Настройки", icon: Settings },
];

export function AppShell({ children, section, onNavigate, onEmergency, onRelapse }: { children: ReactNode; section: AppSection; onNavigate: (section: AppSection) => void; onEmergency: () => void; onRelapse: () => void }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const { xp, profile, activeDay, activity, moods } = useLifeHubStore();
  const level = xpLevel(xp);
  const today = localDateKey();
  const todayActivity = activity.find((item) => item.date === today);
  const moodDone = moods.some((item) => localDateKey(item.at) === today);
  const pendingCount = Number(!todayActivity?.completed) + Number(!moodDone);
  const go = (id: AppSection) => { onNavigate(id); setMoreOpen(false); };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">К основному содержанию</a>
      <aside className="sidebar" aria-label="Основная навигация">
        <button className="brand" onClick={() => go("home")} aria-label="LifeHub, на главную">
          <span className="brand-mark"><Leaf size={20} /></span><span><b>LIFEHUB</b><small>БРОСЬ КУРИТЬ</small></span>
        </button>
        <nav>{nav.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? "active" : ""} onClick={() => go(id)} aria-current={section === id ? "page" : undefined}><Icon size={19} /><span>{label}</span>{section === id && <i />}</button>)}</nav>
        <div className="sidebar-level"><div className="level-row"><Sparkles size={16} /><span>Уровень {level.level}</span><b>{xp} XP</b></div><div className="mini-progress"><span style={{ width: `${Math.min(100, level.inLevel / level.needed * 100)}%` }} /></div><small>До уровня {level.level + 1}: {level.toNext} XP</small></div>
        <button className="sidebar-emergency" onClick={onEmergency}>Хочу курить <ChevronRight size={18} /></button>
      </aside>
      <div className="content-shell">
        <header className="topbar"><div><span className="eyebrow">День {activeDay} · один день за другим</span><h1>{nav.find((item) => item.id === section)?.label}</h1></div><div className="topbar-actions"><button className="icon-button notification-button" aria-label={`Уведомления: ${pendingCount}`} onClick={() => setNoticesOpen(!noticesOpen)}><Bell />{pendingCount > 0 && <b>{pendingCount}</b>}</button><button className="ghost-button desktop-only" onClick={onRelapse}>Я сорвался</button><button className="emergency-button" onClick={onEmergency}>Хочу курить</button><div className="avatar" aria-label={`Профиль: ${profile?.name || "пользователь"}`}>{(profile?.name || "Л").slice(0, 1).toUpperCase()}</div></div></header>
        {noticesOpen && <aside className="notification-panel" aria-label="Задачи на сегодня"><header><div><span className="eyebrow">Сегодня</span><h2>Что осталось отметить</h2></div><button className="icon-button" onClick={() => setNoticesOpen(false)} aria-label="Закрыть"><X /></button></header><button onClick={() => { go("today"); setNoticesOpen(false); }} className={todayActivity?.completed ? "done" : ""}>{todayActivity?.completed ? <CheckCircle2 /> : <CalendarDays />}<span><b>День программы</b><small>{todayActivity?.completed ? "Уже выполнено" : `Открыть день ${activeDay}`}</small></span></button><button onClick={() => { go("journals"); setNoticesOpen(false); }} className={moodDone ? "done" : ""}>{moodDone ? <CheckCircle2 /> : <NotebookTabs />}<span><b>Настроение</b><small>{moodDone ? "Уже отмечено" : "Добавить короткую запись"}</small></span></button><button onClick={() => { go("help"); setNoticesOpen(false); }}><HelpCircle /><span><b>Нужна подсказка?</b><small>Открыть справку по приложению</small></span></button></aside>}
        <main id="main-content" tabIndex={-1}>{children}</main>
      </div>
      <nav className="bottom-nav" aria-label="Мобильная навигация">
        {nav.slice(0, 4).map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? "active" : ""} onClick={() => go(id)}><Icon size={21} /><span>{label}</span></button>)}
        <button className={moreOpen ? "active" : ""} onClick={() => setMoreOpen(!moreOpen)}>{moreOpen ? <X size={21} /> : <Menu size={21} />}<span>Ещё</span></button>
      </nav>
      {moreOpen && <div className="mobile-more" role="dialog" aria-label="Все разделы"><div className="mobile-more-grid">{nav.slice(4).map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? "active" : ""} onClick={() => go(id)}><Icon size={22} /><span>{label}</span></button>)}</div><button className="relapse-link" onClick={onRelapse}>Я сорвался — спокойно разобрать ситуацию</button></div>}
    </div>
  );
}
