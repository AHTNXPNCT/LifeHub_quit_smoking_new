"use client";

import { useMemo } from "react";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";

export function SuggestionField({ field, label, value, onChange, suggestions = [], placeholder, multiline = false, className }: { field: string; label: string; value: string; onChange: (value: string) => void; suggestions?: string[]; placeholder?: string; multiline?: boolean; className?: string }) {
  const saved = useLifeHubStore((state) => state.inputSuggestions[field] ?? []);
  const remember = useLifeHubStore((state) => state.rememberSuggestion);
  const options = useMemo(() => Array.from(new Set([...saved, ...suggestions])).filter(Boolean), [saved, suggestions]);
  return <label className={className}>{label}<select className="suggestion-select" aria-label={`${label}: быстрый вариант`} value="" onChange={(event) => { if (event.target.value) onChange(event.target.value); }}><option value="">Выберите быстрый вариант…</option>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select>{multiline ? <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => remember(field, value)} placeholder={placeholder ?? "Выберите вариант выше или напишите свой"} /> : <input value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => remember(field, value)} placeholder={placeholder ?? "Выберите вариант выше или напишите свой"} />}<small>Свой ответ сохранится в этом списке</small></label>;
}
