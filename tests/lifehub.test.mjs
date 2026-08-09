import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("PWA manifest and offline worker are complete", async () => {
  const manifest = JSON.parse(await readFile(new URL("public/manifest.webmanifest", root), "utf8"));
  const worker = await readFile(new URL("public/sw.js", root), "utf8");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.lang, "ru");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  assert.match(worker, /caches\.open/);
  assert.match(worker, /request\.mode === "navigate"/);
  await access(new URL("public/icon-192.png", root));
  await access(new URL("public/icon-512.png", root));
});

test("local persistence, content engine and critical flows exist", async () => {
  const [db, program, emergency, relapse, games, settings, store, progress, help, client] = await Promise.all([
    readFile(new URL("src/db/lifehub-db.ts", root), "utf8"),
    readFile(new URL("src/content/days/program.ts", root), "utf8"),
    readFile(new URL("src/features/emergency/EmergencyFlow.tsx", root), "utf8"),
    readFile(new URL("src/features/relapse/RelapseFlow.tsx", root), "utf8"),
    readFile(new URL("src/pages/GamesPage.tsx", root), "utf8"),
    readFile(new URL("src/pages/SettingsPage.tsx", root), "utf8"),
    readFile(new URL("src/store/use-lifehub-store.ts", root), "utf8"),
    readFile(new URL("src/pages/ProgressPage.tsx", root), "utf8"),
    readFile(new URL("src/pages/HelpPage.tsx", root), "utf8"),
    readFile(new URL("src/app/LifeHubClient.tsx", root), "utf8"),
  ]);
  assert.match(db, /DB_NAME = "lifehub-local"/);
  assert.match(db, /openDB\(DB_NAME/);
  assert.match(program, /Array\.from\(\{ length: 365 \}/);
  assert.match(emergency, /Шаг \{Math\.min\(step \+ 1, 10\)\} из 10/);
  assert.match(relapse, /Срыв не отменяет твой путь/);
  for (const game of ["Game2048", "MemoryGame", "PuzzleGame", "ObjectGame", "BubblesGame", "FocusGame", "BreathGame", "StressGame"]) assert.match(games, new RegExp(`function ${game}`));
  assert.match(games, /Уровень \{level\} из 50/);
  assert.doesNotMatch(games, /Завершить сессию · \+8 XP/);
  assert.match(store, /lastProgramCompletionDate !== localDateKey/);
  assert.match(store, /completeGame: \(game, level\)/);
  assert.match(progress, /month-grid/);
  assert.match(help, /Справка LifeHub/);
  for (const format of ["exportJson", "exportCsv", "exportPdf", "importJson"]) assert.match(settings, new RegExp(format));
  assert.match(client, /window\.location\.hash = next/);
  assert.doesNotMatch(client, /window\.history\.pushState/);
});

test("production static bundle contains the application shell without a catch-all redirect", async () => {
  const html = await readFile(new URL("dist/index.html", root), "utf8");
  assert.match(html, /<html lang="ru"/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /LifeHub:/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
  await access(new URL("dist/sw.js", root));
  await access(new URL("dist/assets", root));
  await assert.rejects(access(new URL("dist/_redirects", root)));
});
