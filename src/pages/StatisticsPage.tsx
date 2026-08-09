"use client";
import { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { CigaretteOff, Coins, TrendingUp, WalletCards } from "lucide-react";
import { PageIntro, SectionCard, StatCard } from "@/src/components/ui";
import { useNow } from "@/src/hooks/use-now";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { formatMoney, quitStats } from "@/src/utils/calculations";
import { russianNoun } from "@/src/utils/russian";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

export default function StatisticsPage() {
  const now = useNow(30000);
  const state = useLifeHubStore();
  const stats = quitStats(state.profile, now);
  const lineData = useMemo(() => {
    const points = Math.max(2, Math.min(12, Math.ceil(stats.days / 30) || 2));
    return { labels: Array.from({ length: points }, (_, i) => i === points - 1 ? "Сейчас" : `М${i + 1}`), datasets: [{ label: "Накопленная экономия", data: Array.from({ length: points }, (_, i) => Math.min(stats.saved, stats.daily * 30.44 * (i + 1))), fill: true, borderColor: "#63d9a4", backgroundColor: "rgba(99,217,164,.12)", tension: .35, pointRadius: 3 }] };
  }, [stats.days, stats.saved, stats.daily]);
  const triggerCounts = state.cravings.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.trigger || "Не указан"]: (acc[item.trigger || "Не указан"] ?? 0) + 1 }), {});
  const triggerEntries = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const barData = { labels: triggerEntries.map(([label]) => label), datasets: [{ label: "Записей", data: triggerEntries.map(([, count]) => count), backgroundColor: ["#63d9a4", "#f1c56d", "#6d9fe8", "#d78383", "#a985da", "#79cfd0"], borderRadius: 8 }] };
  const averageCraving = state.cravings.length ? state.cravings.reduce((sum, item) => sum + item.intensity, 0) / state.cravings.length : 0;
  return <div className="page-stack"><PageIntro eyebrow="Реальные данные пользователя" title="Статистика и экономия" text="Все показатели рассчитываются из вашей точки отказа, параметров потребления и записей дневника." />
    <section className="stat-grid"><StatCard icon={<Coins />} label="За весь период" value={formatMoney(stats.saved)} note={`${stats.days} ${russianNoun(stats.days, "день", "дня", "дней")}`} tone="mint" /><StatCard icon={<WalletCards />} label="В этом месяце" value={formatMoney(Math.min(stats.saved, stats.monthly))} note={`Прогноз: ${formatMoney(stats.monthly)}`} tone="gold" /><StatCard icon={<CigaretteOff />} label="Не выкурено" value={stats.cigarettes.toLocaleString("ru-RU")} note={`${stats.packs.toFixed(1)} ${russianNoun(Math.round(stats.packs), "пачка", "пачки", "пачек")}`} tone="blue" /><StatCard icon={<TrendingUp />} label="За год" value={formatMoney(stats.yearly)} note={`${formatMoney(stats.weekly)} в неделю`} tone="amber" /></section>
    <div className="chart-grid"><SectionCard title="Накопленная экономия" overline="Финансовый прогресс"><div className="chart-wrap"><Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: "rgba(120,140,130,.12)" } } } }} /></div><div className="money-breakdown">{[["Сегодня", stats.daily], ["Неделя", stats.weekly], ["Месяц", stats.monthly], ["Год", stats.yearly]].map(([label, value]) => <div key={String(label)}><span>{label}</span><b>{formatMoney(Number(value))}</b></div>)}</div></SectionCard><SectionCard title="Триггеры тяги" overline="По дневнику"><div className="chart-wrap">{triggerEntries.length ? <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} /> : <div className="chart-empty">Добавьте несколько записей в дневник тяги — график построится автоматически.</div>}</div><div className="insight-strip"><span>Средняя тяга</span><b>{averageCraving.toFixed(1)} / 10</b><span>Волн пройдено</span><b>{state.emergencySessions.length}</b></div></SectionCard></div>
    <SectionCard title="Связи, которые уже видны" overline="Мягкие наблюдения"><div className="correlation-grid"><div><span>Настроение ↔ тяга</span><b>{state.moods.length && state.cravings.length ? "Есть данные для наблюдения" : "Нужно больше записей"}</b><p>LifeHub не делает медицинских выводов, а показывает совпадения по датам и времени.</p></div><div><span>Лучшее действие</span><b>{state.cravings.map((item) => item.helped).filter(Boolean)[0] || "Пока не определено"}</b><p>Чаще отмечайте, что именно помогло пережить волну.</p></div><div><span>Сложные дни</span><b>{state.activity.filter((item) => item.difficult || item.relapse).length}</b><p>Они остаются частью пути и помогают точнее готовить план.</p></div></div></SectionCard>
  </div>;
}
