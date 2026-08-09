export type Achievement = { id: string; title: string; description: string; category: string; rarity: "Обычное" | "Редкое" | "Скрытое"; target: number; icon: string };

const categories = [
  ["days", "Дни свободы", "День"], ["streaks", "Серии", "Ритм"], ["program", "Программа", "Маршрут"],
  ["cravings", "Тяга", "Волна"], ["journals", "Дневники", "Наблюдение"], ["knowledge", "Знания", "Исследователь"],
  ["savings", "Экономия", "Копилка"], ["health", "Здоровье", "Забота"], ["nature", "Природа", "Лесовод"],
  ["games", "Игры", "Переключение"], ["xp", "XP", "Опыт"],
] as const;
const milestones = [1, 2, 3, 5, 7, 10, 14, 20, 25, 30, 40, 50, 60, 75, 90, 100, 150, 200, 300, 365];
const milestoneNames = ["Первый шаг", "Продолжение", "Третий выбор", "Пять опор", "Неделя внимания", "Первая десятка", "Две недели", "Новый темп", "Четверть сотни", "Месяц пути", "Устойчивая линия", "Полсотни", "Шестьдесят", "Три четверти", "Новый сезон", "Сотня", "Большой рубеж", "Двести", "Дальний путь", "Полный круг"];
const icons = ["✦", "◌", "◆", "≈", "✎", "◈", "₽", "♥", "♣", "◎", "⚡"];

export const achievements: Achievement[] = categories.flatMap(([id, category, prefix], categoryIndex) =>
  milestones.map((target, index) => ({
    id: `${id}-${target}`,
    title: `${prefix}: ${milestoneNames[index]}`,
    description: `${category}: достигнут рубеж ${target}. Каждый такой шаг остаётся частью вашей истории.`,
    category,
    rarity: index === 19 || (index + categoryIndex) % 17 === 0 ? "Скрытое" : index >= 14 ? "Редкое" : "Обычное",
    target,
    icon: icons[categoryIndex],
  })),
);
