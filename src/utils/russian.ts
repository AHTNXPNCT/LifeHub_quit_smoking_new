export function russianNoun(value: number, one: string, few: string, many: string) {
  const absolute = Math.abs(value);
  const lastTwo = absolute % 100;
  const last = absolute % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

export function russianCount(value: number, one: string, few: string, many: string) {
  return `${value.toLocaleString("ru-RU")} ${russianNoun(value, one, few, many)}`;
}
