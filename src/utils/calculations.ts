import type { Profile } from "@/src/entities/types";

export function quitStats(profile: Profile | null, now = Date.now()) {
  if (!profile) return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, cigarettes: 0, packs: 0, saved: 0, daily: 0, weekly: 0, monthly: 0, yearly: 0 };
  const totalSeconds = Math.max(0, Math.floor((now - new Date(profile.quitAt).getTime()) / 1000));
  const daysFloat = totalSeconds / 86400;
  const daily = (profile.cigarettesPerDay / profile.cigarettesPerPack) * profile.packPrice;
  const cigarettes = Math.floor(daysFloat * profile.cigarettesPerDay);
  const packs = cigarettes / profile.cigarettesPerPack;
  return {
    totalSeconds,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    cigarettes,
    packs,
    saved: packs * profile.packPrice,
    daily,
    weekly: daily * 7,
    monthly: daily * 30.44,
    yearly: daily * 365,
  };
}

export function xpLevel(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 80)) + 1;
  const currentFloor = (level - 1) ** 2 * 80;
  const nextFloor = level ** 2 * 80;
  return { level, inLevel: xp - currentFloor, needed: nextFloor - currentFloor, toNext: nextFloor - xp };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
