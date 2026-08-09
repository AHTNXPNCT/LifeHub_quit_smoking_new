"use client";

import { Bell, CalendarCheck, ChevronRight, CircleHelp, Download, Gamepad2, Leaf, NotebookTabs, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import type { AppSection } from "@/src/app/LifeHubClient";
import { PageIntro } from "@/src/components/ui";

const guides = [
  { icon: CalendarCheck, title: "Как проходить программу", text: "Откройте «Сегодня», выполните три действия, ответьте на вопрос и мини-тест. После отметки следующий день откроется только в следующую календарную дату по времени устройства." },
  { icon: TimerReset, title: "Что делать при тяге", text: "Кнопка «Хочу курить» доступна сверху и на главной. Пройдите все десять шагов и повторно оцените тягу — результат сохранится в календаре и статистике." },
  { icon: Leaf, title: "Как растёт лес", text: "Активность развивает текущее дерево. Новый десятидневный цикл добавляет следующее уникальное дерево. Птицы, животные, гнёзда, дупла, цветы и вода появляются постепенно." },
  { icon: NotebookTabs, title: "Как вести дневники", text: "Выбирайте готовый вариант из списка или вводите свой. Новый ответ запомнится на устройстве и появится среди вариантов в следующий раз." },
  { icon: Gamepad2, title: "Как работают игры", text: "У каждой игры 50 уровней. XP начисляется только после выполнения цели уровня. После победы можно перейти на следующий уровень или выбрать другую игру." },
  { icon: Bell, title: "Напоминания", text: "Колокольчик показывает, что осталось сделать сегодня. В настройках можно разрешить системные уведомления; внутри приложения напоминания работают и без них." },
  { icon: ShieldCheck, title: "Где хранятся данные", text: "Профиль, история, лес, дневники и игровые уровни сохраняются локально в IndexedDB. Аккаунт и обязательный сервер не требуются." },
  { icon: Download, title: "Резервная копия", text: "В настройках экспортируйте полный JSON. Этот файл можно импортировать на том же или другом устройстве и восстановить весь путь." },
];

export default function HelpPage({ onNavigate, onEmergency }: { onNavigate: (section: AppSection) => void; onEmergency: () => void }) {
  return <div className="page-stack"><PageIntro eyebrow="Инструкция и обучение" title="Справка LifeHub" text="Короткие ответы о программе, лесной системе, дневниках, играх, уведомлениях и сохранении данных." actions={<button className="emergency-button" onClick={onEmergency}>Хочу курить</button>} />
    <section className="help-start"><CircleHelp /><div><span className="eyebrow">Быстрый старт</span><h3>Один день — одна честная отметка</h3><p>Главное действие находится в разделе «Сегодня». Не нужно наверстывать программу за один вечер: дата устройства защищает спокойный ежедневный ритм.</p></div><button className="primary-button" onClick={() => onNavigate("today")}>Открыть сегодня <ChevronRight /></button></section>
    <section className="help-grid">{guides.map(({ icon: Icon, title, text }, index) => <details key={title} open={index === 0}><summary><span><Icon /></span><b>{title}</b><ChevronRight /></summary><p>{text}</p></details>)}</section>
    <section className="help-route"><Sparkles /><div><b>Рекомендуемый ежедневный маршрут</b><p>Уведомления → Сегодня → отметка настроения → при необходимости дневник тяги или игра → просмотр живого леса.</p></div><button className="ghost-button" onClick={() => onNavigate("home")}>На главную</button></section>
  </div>;
}
