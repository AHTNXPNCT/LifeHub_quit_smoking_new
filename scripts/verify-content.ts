import { program365, verifyProgramUniqueness } from "../src/content/days/program.ts";
import { achievements } from "../src/content/achievements/achievements.ts";
import { library } from "../src/content/library/library.ts";

const results = verifyProgramUniqueness();
const failures = results.filter((result) => result.unique !== result.total);
if (program365.length !== 365) throw new Error(`Ожидалось 365 дней, получено ${program365.length}`);
if (failures.length) throw new Error(`Повторы в программе: ${JSON.stringify(failures)}`);
if (new Set(achievements.map((item) => item.title)).size !== achievements.length || achievements.length < 200) throw new Error("Достижения должны быть уникальны и их должно быть не менее 200");
const counts = Object.fromEntries(Object.entries(library).map(([key, value]) => [key, value.length]));
if (counts.books < 50 || counts.rules < 100 || counts.myths < 100 || counts.facts < 100) throw new Error(`Недостаточно материалов: ${JSON.stringify(counts)}`);
console.log(`Контент проверен: ${program365.length} уникальных дней, ${achievements.length} достижений, ${Object.values(counts).reduce((a, b) => a + b, 0)} материалов.`);
