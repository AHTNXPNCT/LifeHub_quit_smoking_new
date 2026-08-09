"use client";
import { Activity, ExternalLink, HeartPulse, Info, ShieldCheck, Stethoscope } from "lucide-react";
import { PageIntro } from "@/src/components/ui";
import { healthTimeline } from "@/src/content/health/timeline";
import { useNow } from "@/src/hooks/use-now";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { quitStats } from "@/src/utils/calculations";
import { russianNoun } from "@/src/utils/russian";

export default function HealthPage() {
  const profile = useLifeHubStore((state) => state.profile);
  const stats = quitStats(profile, useNow(60000));
  const activeIndex = stats.totalSeconds >= 15 * 365 * 86400 ? 7 : stats.totalSeconds >= 5 * 365 * 86400 ? 6 : stats.totalSeconds >= 365 * 86400 ? 5 : stats.totalSeconds >= 30 * 86400 ? 4 : stats.totalSeconds >= 14 * 86400 ? 3 : stats.totalSeconds >= 2 * 86400 ? 2 : stats.totalSeconds >= 12 * 3600 ? 1 : 0;
  return <div className="page-stack"><PageIntro eyebrow="Доказательная информация" title="Что может меняться после отказа" text="Сроки усреднены, а индивидуальный опыт зависит от здоровья, стажа и других факторов." />
    <section className="health-summary"><div className="health-pulse"><span><HeartPulse /></span><i /><i /></div><div><span className="eyebrow">Ваша точка на шкале</span><h3>{healthTimeline[activeIndex].time}: {healthTimeline[activeIndex].title}</h3><p>{healthTimeline[activeIndex].text}</p></div><div className="health-summary-number"><b>{stats.days}</b><span>{russianNoun(stats.days, "день", "дня", "дней")} пути</span></div></section>
    <section className="health-timeline">{healthTimeline.map((item, index) => <article key={item.time} className={index <= activeIndex ? "reached" : ""}><div className="timeline-marker">{index <= activeIndex ? <ShieldCheck /> : <span>{index + 1}</span>}</div><div className="timeline-time">{item.time}</div><div className="timeline-card"><div><span>{index % 2 ? <Activity /> : <HeartPulse />}</span><h3>{item.title}</h3></div><p>{item.text}</p><a href={item.url} target="_blank" rel="noreferrer">Источник: {item.source} <ExternalLink /></a></div></article>)}</section>
    <section className="medical-disclaimer"><Stethoscope /><div><b>Важная оговорка</b><p>Информация носит образовательный характер и не заменяет консультацию медицинского специалиста. Если симптомы выражены, необычны или вызывают тревогу, обратитесь за медицинской помощью.</p></div></section>
    <section className="section-card source-note"><Info /><p>LifeHub не обещает «полное очищение» организма к конкретной дате. Мы используем формулировки CDC, NHS и ВОЗ и говорим о возможных, а не гарантированных изменениях.</p></section>
  </div>;
}
