"use client";

import { useMemo } from "react";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";

// A stable fallback is necessary: a fresh [] in a Zustand selector makes React
// think the selected value changed and can cause a render loop.
const EMPTY_SUGGESTIONS: string[] = [];

export function SuggestionField({ field, label, value, onChange, suggestions = [], placeholder, multiline = false, className }: { field: string; label: string; value: string; onChange: (value: string) => void; suggestions?: string[]; placeholder?: string; multiline?: boolean; className?: string }) {
  const saved = useLifeHubStore((state) => state.inputSuggestions[field] ?? EMPTY_SUGGESTIONS);
  const remember = useLifeHubStore((state) => state.rememberSuggestion);
  const options = useMemo(() => Array.from(new Set([...saved, ...suggestions])).filter(Boolean), [saved, suggestions]);
  const selectOption = (selected: string) => {
    if (!selected) return;
    onChange(selected);
    remember(field, selected);
  };
  const prompt = placeholder ?? "Выберите вариант выше или напишите свой";
  return <label className={className}>{label}<select className="suggestion-select" aria-label={`${label}: быстрый вариант`} value="" onChange={(event) => selectOption(event.target.value)}><option value="">Выберите быстрый вариант…</option>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select>{multiline ? <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => remember(field, value)} placeholder={prompt} /> : <input value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => remember(field, value)} placeholder={prompt} />}<small>Свой ответ автоматически добавится в этот список после перехода к следующему полю</small></label>;
}
