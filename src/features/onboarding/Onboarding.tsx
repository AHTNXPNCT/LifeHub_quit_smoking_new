"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Leaf, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import type { Profile } from "@/src/entities/types";

function localDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

type OnboardingForm = Omit<Profile, "cigarettesPerDay" | "cigarettesPerPack" | "packPrice"> & {
  cigarettesPerDay: string;
  cigarettesPerPack: string;
  packPrice: string;
};

type NumericFormField = "cigarettesPerDay" | "cigarettesPerPack" | "packPrice";

function wholeNumber(value: string, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function Onboarding() {
  const setProfile = useLifeHubStore((state) => state.setProfile);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>({ name: "", quitAt: localDateTime(), cigarettesPerDay: "15", cigarettesPerPack: "20", packPrice: "220", nicotineType: "Сигареты" as Profile["nicotineType"], motivation: "Хочу свободно дышать, лучше чувствовать себя и вернуть контроль над своим временем." });
  const [numericStarted, setNumericStarted] = useState<Record<NumericFormField, boolean>>({ cigarettesPerDay: false, cigarettesPerPack: false, packPrice: false });
  const beginNumericEntry = (field: NumericFormField) => {
    if (numericStarted[field]) return;
    setNumericStarted({ ...numericStarted, [field]: true });
    setForm({ ...form, [field]: "" });
  };
  const changeNumericEntry = (field: NumericFormField, value: string) => {
    setNumericStarted({ ...numericStarted, [field]: true });
    setForm({ ...form, [field]: value });
  };
  const submit = () => setProfile({
    ...form,
    name: form.name.trim() || "Друг",
    quitAt: new Date(form.quitAt).toISOString(),
    cigarettesPerDay: wholeNumber(form.cigarettesPerDay, 1, 1, 200),
    cigarettesPerPack: wholeNumber(form.cigarettesPerPack, 1, 1, 100),
    packPrice: wholeNumber(form.packPrice, 0, 0, 1_000_000),
  });
  return (
    <main className="onboarding">
      <div className="onboarding-art" aria-hidden="true"><div className="sun" /><div className="hill hill-one" /><div className="hill hill-two" /><div className="onboarding-tree"><i /><i /><i /><b /></div><span className="bird bird-one">⌁</span><span className="bird bird-two">⌁</span></div>
      <div className="onboarding-panel">
        <div className="onboarding-brand"><span className="brand-mark"><Leaf size={22} /></span><b>LIFEHUB</b></div>
        <div className="step-dots" aria-label={`Шаг ${step + 1} из 3`}>{[0, 1, 2].map((item) => <i key={item} className={item <= step ? "active" : ""} />)}</div>
        {step === 0 && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="eyebrow">Персональная программа на 365 дней</span><h1>Бросай никотин<br />и <em>живи.</em></h1><p className="lead">Не марафон силы воли, а спокойный маршрут: ежедневные шаги, помощь при тяге и ваш собственный растущий лес.</p><ul className="feature-list"><li><Sparkles /><span><b>Один день за другим</b><small>Свой темп, без наказаний и давления</small></span></li><li><ShieldCheck /><span><b>Данные остаются у вас</b><small>Локально на устройстве, даже без интернета</small></span></li><li><Smartphone /><span><b>Работает как приложение</b><small>Можно установить на домашний экран</small></span></li></ul><button className="primary-button wide" onClick={() => setStep(1)}>Настроить мой путь <ArrowRight /></button></motion.section>}
        {step === 1 && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="eyebrow">Точка отсчёта</span>
          <h2>Начнём с фактов</h2>
          <p>Эти данные нужны только для вашего счётчика и расчёта экономии.</p>
          <div className="form-grid">
            <label>Как к вам обращаться<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Например, Саша" /></label>
            <label>Тип никотина<select value={form.nicotineType} onChange={(e) => setForm({ ...form, nicotineType: e.target.value as Profile["nicotineType"] })}>{["Сигареты", "Вейп", "Снюс", "Нагревание табака", "Другое"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="full">Дата и время последнего употребления<input required type="datetime-local" value={form.quitAt} max={localDateTime()} onChange={(e) => setForm({ ...form, quitAt: e.target.value })} /></label>
            <label>Количество сигарет в день, шт.<input type="number" inputMode="numeric" min="1" max="200" value={form.cigarettesPerDay} onFocus={() => beginNumericEntry("cigarettesPerDay")} onChange={(e) => changeNumericEntry("cigarettesPerDay", e.target.value)} /><small>Укажите поштучно: например, 15.</small></label>
            <label>Сигарет в пачке, шт.<input type="number" inputMode="numeric" min="1" max="100" value={form.cigarettesPerPack} onFocus={() => beginNumericEntry("cigarettesPerPack")} onChange={(e) => changeNumericEntry("cigarettesPerPack", e.target.value)} /><small>Обычно — 20.</small></label>
            <label className="full">Стоимость одной пачки, ₽<input type="number" inputMode="numeric" min="0" value={form.packPrice} onFocus={() => beginNumericEntry("packPrice")} onChange={(e) => changeNumericEntry("packPrice", e.target.value)} /><small>Нажмите на число и наберите новое: лишний ноль не добавится.</small></label>
          </div>
          <div className="button-row"><button className="ghost-button" onClick={() => setStep(0)}>Назад</button><button className="primary-button" onClick={() => setStep(2)}>Продолжить <ArrowRight /></button></div>
        </motion.section>}
        {step === 2 && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="eyebrow">Ваша опора</span><h2>Ради чего вы выбираете свободу?</h2><p>Мы покажем эту фразу в момент сильной тяги. Можно изменить её позже.</p><label className="motivation-field">Моя личная причина<textarea rows={6} value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} /></label><div className="privacy-note"><Check size={18} /> Всё готово. История, прогресс и лес будут сохраняться — даже если день окажется сложным.</div><div className="button-row"><button className="ghost-button" onClick={() => setStep(1)}>Назад</button><button className="primary-button" onClick={submit}>Начать путь <Leaf /></button></div></motion.section>}
      </div>
    </main>
  );
}
