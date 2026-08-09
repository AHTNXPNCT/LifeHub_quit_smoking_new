"use client";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export function PageIntro({ eyebrow, title, text, actions }: { eyebrow?: string; title: string; text?: string; actions?: ReactNode }) {
  return <div className="page-intro"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{text && <p>{text}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

export function StatCard({ icon, label, value, note, tone = "default", onClick }: { icon: ReactNode; label: string; value: ReactNode; note?: string; tone?: string; onClick?: () => void }) {
  const content = <><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div></>;
  return onClick
    ? <button type="button" className={`stat-card stat-card-button tone-${tone}`} onClick={onClick} aria-label={`${label}: ${String(value)}. Открыть раздел`}>{content}</button>
    : <article className={`stat-card tone-${tone}`}>{content}</article>;
}

export function SectionCard({ title, overline, children, action }: { title: string; overline?: string; children: ReactNode; action?: { label: string; onClick: () => void } }) {
  return <section className="section-card">{(title || overline) && <header>{<div>{overline && <span className="eyebrow">{overline}</span>}<h3>{title}</h3></div>}{action && <button className="text-button" onClick={action.onClick}>{action.label}<ArrowUpRight size={16} /></button>}</header>}<div>{children}</div></section>;
}

export function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  return <div className="progress-wrap">{label && <div className="progress-label"><span>{label}</span><b>{Math.round(pct)}%</b></div>}<div className="progress-bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}><span style={{ width: `${pct}%` }} /></div></div>;
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="empty-state"><span>{icon}</span><b>{title}</b><p>{text}</p></div>;
}
