"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Brain, CheckCircle2, CircleDot, Cloud, Gamepad2, Grid2X2, Puzzle, Search, TimerReset, Trophy, Wind } from "lucide-react";
import { Modal } from "@/src/components/Modal";
import { PageIntro, ProgressBar } from "@/src/components/ui";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import type { GameId } from "@/src/entities/types";
import { russianNoun } from "@/src/utils/russian";

const games: { id: GameId; title: string; text: string; icon: typeof Gamepad2; time: string }[] = [
  { id: "2048", title: "2048 · Листья", text: "Соберите цель уровня, соединяя одинаковые значения.", icon: Grid2X2, time: "логика" },
  { id: "memory", title: "Лесная память", text: "Находите всё больше пар природных символов.", icon: Brain, time: "память" },
  { id: "puzzle", title: "Тихая тропа", text: "Соберите поле 3×3, а затем 4×4.", icon: Puzzle, time: "пазл" },
  { id: "objects", title: "Найди светлячка", text: "Ищите несколько целей на растущем поле и на время.", icon: Search, time: "поиск" },
  { id: "bubbles", title: "Пузырьки", text: "Лопайте нужный цвет или найдите игрушки внутри.", icon: CircleDot, time: "реакция" },
  { id: "focus", title: "Цвет и слово", text: "Выбирайте цвет букв быстрее и точнее.", icon: TimerReset, time: "концентрация" },
  { id: "breath", title: "Дыхательная волна", text: "Пройдите заданное число спокойных циклов.", icon: Wind, time: "дыхание" },
  { id: "stress", title: "Сад кругов", text: "Рисуйте пальцем или мышью расходящиеся волны.", icon: Cloud, time: "антистресс" },
];

function gameWinsLabel(value: number) {
  const noun = russianNoun(value, "уровень", "уровня", "уровней");
  return `${value} ${noun} уже ${noun === "уровень" ? "пройден" : "пройдено"}`;
}

export default function GamesPage() {
  const state = useLifeHubStore();
  const [active, setActive] = useState<GameId | null>(null);
  const [completed, setCompleted] = useState<{ game: GameId; level: number; reward: number } | null>(null);
  const level = active ? state.gameLevels[active] : 1;
  const finishLevel = (game: GameId, completedLevel: number) => {
    const reward = state.completeGame(game, completedLevel);
    if (reward) setCompleted({ game, level: completedLevel, reward });
  };
  const chooseGame = (game: GameId) => { setCompleted(null); setActive(game); };
  const close = () => { setCompleted(null); setActive(null); };
  return <div className="page-stack"><PageIntro eyebrow="Полностью офлайн · 50 уровней в каждой игре" title="Переключить внимание" text="У каждого уровня есть проверяемая цель. XP начисляется только после победы — кнопки завершения с наградой больше нет." />
    <section className="game-intro"><div className="game-orbit"><Gamepad2 /><i /><i /></div><div><h3>{state.gameWins ? gameWinsLabel(state.gameWins) : "Начните с любого уровня 1"}</h3><p>Сложность растёт постепенно: больше объектов, новые правила, меньше времени и более длинные последовательности.</p></div><span><Trophy /> максимум 50</span></section>
    <div className="game-grid">{games.map(({ id, title, text, icon: Icon, time }, index) => { const gameLevel = state.gameLevels[id]; const finished50 = state.gameCompletedLevels[id]?.includes(50); return <button key={id} onClick={() => chooseGame(id)}><div className={`game-art game-${index + 1}`}><Icon /><span>{finished50 ? <CheckCircle2 /> : `${gameLevel}/50`}</span></div><div><span>{time}</span><h3>{title}</h3><p>{text}</p><ProgressBar value={state.gameCompletedLevels[id]?.length ?? 0} max={50} /></div><ArrowRight /></button>; })}</div>
    <Modal open={active !== null} onClose={close} title={games.find((game) => game.id === active)?.title ?? "Игра"} className="game-modal">{active && <div className="game-stage"><div className="game-level-head"><span>Уровень {level} из 50</span><ProgressBar value={state.gameCompletedLevels[active]?.length ?? 0} max={50} /></div>{completed ? <GameComplete result={completed} onNext={() => setCompleted(null)} onChoose={chooseGame} /> : <GameRouter key={`${active}-${level}`} id={active} level={level} onComplete={() => finishLevel(active, level)} />}</div>}</Modal>
  </div>;
}

function GameComplete({ result, onNext, onChoose }: { result: { game: GameId; level: number; reward: number }; onNext: () => void; onChoose: (game: GameId) => void }) {
  const next = Math.min(50, result.level + 1);
  const alternatives = games.filter((game) => game.id !== result.game).slice(result.level % 5, result.level % 5 + 3);
  return <div className="level-complete"><span><Trophy /></span><h3>Уровень {result.level} пройден</h3><p>Награда начислена за выполненную цель: <b>+{result.reward} XP</b>.</p>{result.level < 50 ? <button className="primary-button" onClick={onNext}>Уровень {next} · сложнее <ArrowRight /></button> : <b className="game-win">Все 50 уровней этой игры пройдены!</b>}<div className="next-games"><small>Или переключитесь на другую игру</small>{alternatives.map(({ id, title, icon: Icon }) => <button key={id} onClick={() => onChoose(id)}><Icon />{title}</button>)}</div></div>;
}

function GameRouter({ id, level, onComplete }: { id: GameId; level: number; onComplete: () => void }) {
  if (id === "2048") return <Game2048 level={level} onComplete={onComplete} />;
  if (id === "memory") return <MemoryGame level={level} onComplete={onComplete} />;
  if (id === "puzzle") return <PuzzleGame level={level} onComplete={onComplete} />;
  if (id === "objects") return <ObjectGame level={level} onComplete={onComplete} />;
  if (id === "bubbles") return <BubblesGame level={level} onComplete={onComplete} />;
  if (id === "focus") return <FocusGame level={level} onComplete={onComplete} />;
  if (id === "breath") return <BreathGame level={level} onComplete={onComplete} />;
  return <StressGame level={level} onComplete={onComplete} />;
}

type Direction = "left" | "right" | "up" | "down";
function addTile(board: number[]) { const empty = board.map((v, i) => v ? -1 : i).filter((i) => i >= 0); if (!empty.length) return board; const next = [...board]; next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < .9 ? 2 : 4; return next; }
function slideRow(row: number[]) { const values = row.filter(Boolean); const out: number[] = []; for (let i = 0; i < values.length; i += 1) { if (values[i] === values[i + 1]) { out.push(values[i] * 2); i += 1; } else out.push(values[i]); } return [...out, ...Array(4 - out.length).fill(0)]; }
function moveBoard(board: number[], direction: Direction) { const matrix = Array.from({ length: 4 }, (_, row) => board.slice(row * 4, row * 4 + 4)); const next = Array.from({ length: 4 }, () => Array(4).fill(0)); if (direction === "left" || direction === "right") matrix.forEach((row, i) => { const result = slideRow(direction === "right" ? [...row].reverse() : row); next[i] = direction === "right" ? result.reverse() : result; }); else for (let col = 0; col < 4; col += 1) { const column = matrix.map((row) => row[col]); const result = slideRow(direction === "down" ? column.reverse() : column); const final = direction === "down" ? result.reverse() : result; final.forEach((value, row) => { next[row][col] = value; }); } const flat = next.flat(); return flat.some((value, i) => value !== board[i]) ? addTile(flat) : board; }

function Game2048({ level, onComplete }: { level: number; onComplete: () => void }) {
  const target = 32 * 2 ** Math.min(4, Math.floor((level - 1) / 10));
  const [board, setBoard] = useState(() => addTile(addTile(Array(16).fill(0))));
  const touch = useRef<{ x: number; y: number } | null>(null);
  const move = useCallback((direction: Direction) => setBoard((value) => moveBoard(value, direction)), []);
  useEffect(() => { if (Math.max(...board) >= target) onComplete(); }, [board, onComplete, target]);
  useEffect(() => { const handler = (event: KeyboardEvent) => { const map: Record<string, Direction> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" }; if (map[event.key]) { event.preventDefault(); move(map[event.key]); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [move]);
  return <><p>Цель уровня: собрать плитку <b>{target}</b>. Управляйте стрелками, кнопками или свайпом.</p><div className="board-2048" onPointerDown={(event) => { touch.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={(event) => { if (!touch.current) return; const dx = event.clientX - touch.current.x; const dy = event.clientY - touch.current.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > 25) move(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "right" : "left" : dy > 0 ? "down" : "up"); touch.current = null; }}>{board.map((value, index) => <span key={index} data-value={value}>{value || ""}</span>)}</div><div className="game-controls"><button aria-label="Влево" onClick={() => move("left")}><ArrowLeft /></button><button aria-label="Вверх" onClick={() => move("up")}><ArrowUp /></button><button aria-label="Вниз" onClick={() => move("down")}><ArrowDown /></button><button aria-label="Вправо" onClick={() => move("right")}><ArrowRight /></button></div></>;
}

const memoryIcons = ["🍃", "🌿", "🌸", "🍄", "🌙", "🐦", "🦋", "🐿️", "🌰", "💧"];
function MemoryGame({ level, onComplete }: { level: number; onComplete: () => void }) {
  const pairCount = Math.min(10, 3 + Math.floor((level - 1) / 5));
  const cardsForLevel = useMemo(() => { const base = [...memoryIcons.slice(0, pairCount), ...memoryIcons.slice(0, pairCount)]; return base.map((card, index) => ({ card, order: (index * 37 + level * 13) % (base.length + 3) })).sort((a, b) => a.order - b.order || a.card.localeCompare(b.card)).map((item) => item.card); }, [level, pairCount]);
  const [cards] = useState(cardsForLevel); const [open, setOpen] = useState<number[]>([]); const [matched, setMatched] = useState<number[]>([]);
  useEffect(() => { if (matched.length === cards.length) onComplete(); }, [cards.length, matched.length, onComplete]);
  const choose = (index: number) => { if (open.length === 2 || open.includes(index) || matched.includes(index)) return; const next = [...open, index]; setOpen(next); if (next.length === 2) window.setTimeout(() => { if (cards[next[0]] === cards[next[1]]) setMatched((value) => [...value, ...next]); setOpen([]); }, Math.max(260, 650 - level * 6)); };
  return <><p>Найдите {pairCount} пар. Открыто: {matched.length / 2}/{pairCount}.</p><div className="memory-board" style={{ gridTemplateColumns: `repeat(${pairCount > 6 ? 5 : 4}, minmax(48px, 70px))` }}>{cards.map((card, index) => <button key={index} className={open.includes(index) || matched.includes(index) ? "open" : ""} onClick={() => choose(index)}><span>{open.includes(index) || matched.includes(index) ? card : "✦"}</span></button>)}</div></>;
}

function shuffledPuzzle(size: number, level: number) { const list = [...Array.from({ length: size * size - 1 }, (_, i) => i + 1), 0]; for (let n = 0; n < 35 + level * 3; n += 1) { const zero = list.indexOf(0); const row = Math.floor(zero / size); const col = zero % size; const options = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]].filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size).map(([r, c]) => r * size + c); const target = options[(n * 7 + level) % options.length]; [list[zero], list[target]] = [list[target], list[zero]]; } return list; }
function PuzzleGame({ level, onComplete }: { level: number; onComplete: () => void }) {
  const size = level >= 26 ? 4 : 3; const [tiles, setTiles] = useState(() => shuffledPuzzle(size, level));
  const won = tiles.every((value, index) => value === (index + 1) % (size * size));
  useEffect(() => { if (won) onComplete(); }, [onComplete, won]);
  const move = (index: number) => { const zero = tiles.indexOf(0); const row = Math.floor(zero / size); const col = zero % size; const valid = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]].filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size).map(([r, c]) => r * size + c); if (valid.includes(index)) { const next = [...tiles]; [next[zero], next[index]] = [next[index], next[zero]]; setTiles(next); } };
  return <><p>Соберите числа 1–{size * size - 1} по порядку. Поле {size}×{size}, перемешивание уровня {level}.</p><div className="puzzle-board" style={{ gridTemplateColumns: `repeat(${size}, minmax(52px, 82px))` }}>{tiles.map((value, index) => <button key={index} className={!value ? "empty" : ""} onClick={() => move(index)}>{value || ""}</button>)}</div></>;
}

function ObjectGame({ level, onComplete }: { level: number; onComplete: () => void }) {
  const fieldSize = Math.min(144, 48 + level * 2); const goal = Math.min(12, 2 + Math.floor(level / 4)); const limit = Math.max(18, 46 - Math.floor(level / 2));
  const [target, setTarget] = useState(() => (level * 17) % fieldSize); const [found, setFound] = useState(0); const [seconds, setSeconds] = useState(limit);
  useEffect(() => { const id = window.setInterval(() => setSeconds((value) => value > 1 ? value - 1 : limit), 1000); return () => window.clearInterval(id); }, [limit]);
  useEffect(() => { if (found >= goal) onComplete(); }, [found, goal, onComplete]);
  const choose = (index: number) => { if (index === target) { setFound((value) => value + 1); setTarget((value) => (value * 37 + 17 + level) % fieldSize); setSeconds(limit); } else setSeconds((value) => Math.max(1, value - 2)); };
  return <><p>Найдите светлячка ✦ {goal} раз. Найдено: <b>{found}/{goal}</b> · {seconds} сек.</p><div className="object-field" style={{ gridTemplateColumns: `repeat(${fieldSize > 100 ? 12 : 10}, 1fr)` }}>{Array.from({ length: fieldSize }, (_, index) => <button key={`${found}-${index}`} onClick={() => choose(index)} aria-label={index === target ? "Светлячок" : "Лист"}>{index === target ? "✦" : ["·", "⌁", "⌂", "˙"][index % 4]}</button>)}</div></>;
}

const bubbleColors = ["mint", "blue", "gold", "rose"] as const;
function BubblesGame({ level, onComplete }: { level: number; onComplete: () => void }) {
  const count = Math.min(56, 22 + level); const toyMode = level % 3 === 0; const targetColor = bubbleColors[level % bubbleColors.length]; const colorGoal = Math.min(12, 3 + Math.floor(level / 4)); const toyGoal = Math.min(5, 1 + Math.floor(level / 10)); const limit = Math.max(20, 48 - Math.floor(level / 2));
  const bubbles = useMemo(() => Array.from({ length: count }, (_, index) => ({ color: bubbleColors[index % bubbleColors.length], toy: toyMode && index < toyGoal })), [count, toyGoal, toyMode]);
  const [popped, setPopped] = useState<number[]>([]); const [found, setFound] = useState(0); const [mistakes, setMistakes] = useState(0); const [seconds, setSeconds] = useState(limit);
  const goal = toyMode ? toyGoal : colorGoal;
  useEffect(() => { const id = window.setInterval(() => setSeconds((value) => value > 1 ? value - 1 : limit), 1000); return () => window.clearInterval(id); }, [limit]);
  useEffect(() => { if (found >= goal) onComplete(); }, [found, goal, onComplete]);
  const pop = (index: number) => { if (popped.includes(index)) return; const bubble = bubbles[index]; const correct = toyMode ? bubble.toy : bubble.color === targetColor; if (correct) { setPopped((value) => [...value, index]); setFound((value) => value + 1); } else { setMistakes((value) => value + 1); setSeconds((value) => Math.max(1, value - 2)); } };
  const colorNames = { mint: "мятного", blue: "синего", gold: "золотого", rose: "розового" };
  return <><p>{toyMode ? `Найдите ${toyGoal} игрушки внутри пузырьков` : `Лопните ${colorGoal} пузырька ${colorNames[targetColor]} цвета`}. Выполнено: <b>{found}/{goal}</b> · {seconds} сек. · ошибок {mistakes}</p><div className="bubble-board">{bubbles.map((bubble, index) => <button key={index} data-color={bubble.color} className={popped.includes(index) ? "popped" : ""} onClick={() => pop(index)} aria-label="Проверить пузырёк" style={{ "--size": `${34 + index % 4 * 7}px`, "--delay": `${index % 7 * -.2}s` } as React.CSSProperties}>{popped.includes(index) && bubble.toy ? "🧸" : ""}</button>)}</div></>;
}

const colorOptions = [{ name: "зелёный", value: "#45c58d" }, { name: "синий", value: "#5594df" }, { name: "жёлтый", value: "#e6b84c" }, { name: "красный", value: "#df6e6e" }];
function FocusGame({ level, onComplete }: { level: number; onComplete: () => void }) {
  const goal = Math.min(20, 5 + Math.floor(level / 3)); const limit = Math.max(18, 45 - Math.floor(level / 2)); const makeRound = () => ({ word: colorOptions[Math.floor(Math.random() * 4)].name, color: Math.floor(Math.random() * 4) });
  const [round, setRound] = useState(makeRound); const [score, setScore] = useState(0); const [seconds, setSeconds] = useState(limit); const [message, setMessage] = useState("Выберите фактический цвет букв");
  useEffect(() => { const id = window.setInterval(() => setSeconds((value) => value > 1 ? value - 1 : limit), 1000); return () => window.clearInterval(id); }, [limit]);
  useEffect(() => { if (score >= goal) onComplete(); }, [goal, onComplete, score]);
  const choose = (index: number) => { if (index === round.color) { setScore((value) => value + 1); setMessage("Верно"); } else { setMessage("Смотрите на цвет, а не значение слова"); setSeconds((value) => Math.max(1, value - 3)); } setRound(makeRound()); };
  return <><p>Верных ответов: <b>{score}/{goal}</b> · {seconds} сек. {message}</p><div className="stroop-word" style={{ color: colorOptions[round.color].value }}>{round.word}</div><div className="choice-grid">{colorOptions.map((color, index) => <button key={color.name} onClick={() => choose(index)}>{color.name}</button>)}</div></>;
}

function BreathGame({ level, onComplete }: { level: number; onComplete: () => void }) {
  const cycles = Math.min(8, 2 + Math.floor((level - 1) / 8)); const [running, setRunning] = useState(false); const [seconds, setSeconds] = useState(0);
  useEffect(() => { if (!running) return; const id = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(id); }, [running]);
  useEffect(() => { if (seconds >= cycles * 8) onComplete(); }, [cycles, onComplete, seconds]);
  const point = seconds % 8; const phase = point < 3 ? "Вдох" : point < 4 ? "Пауза" : "Выдох";
  return <><p>Пройдите {cycles} спокойных цикла по 8 секунд. Выполнено: {Math.min(cycles, Math.floor(seconds / 8))}/{cycles}.</p><button className={`breath-game ${running ? "running" : ""}`} onClick={() => setRunning(!running)}><span>{running ? phase : "Начать"}</span></button><b>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</b><small className="game-safety">Если кружится голова — остановитесь и вернитесь к обычному дыханию.</small></>;
}

function StressGame({ level, onComplete }: { level: number; onComplete: () => void }) {
  const goal = Math.min(60, 12 + level); const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]); const [count, setCount] = useState(0); const ref = useRef<HTMLButtonElement>(null); const last = useRef(0); const lastPoint = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { if (count >= goal) onComplete(); }, [count, goal, onComplete]);
  const addWave = (x: number, y: number) => { const rect = ref.current?.getBoundingClientRect(); if (!rect) return; setRipples((value) => [...value.slice(-32), { id: Date.now() + Math.random(), x: x - rect.left, y: y - rect.top }]); setCount((value) => value + 1); };
  const followPointer = (event: React.PointerEvent<HTMLButtonElement>) => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const previous = lastPoint.current; const distance = previous ? Math.hypot(event.clientX - previous.x, event.clientY - previous.y) : 0; const now = performance.now(); if (distance < 10 || now - last.current < 65) return; last.current = now; lastPoint.current = { x: event.clientX, y: event.clientY }; addWave(event.clientX, event.clientY); };
  const keyboardWave = () => { const rect = ref.current?.getBoundingClientRect(); if (rect) addWave(rect.left + rect.width / 2 + (Math.random() - .5) * rect.width * .55, rect.top + rect.height / 2 + (Math.random() - .5) * rect.height * .55); };
  return <><p>Создайте непрерывным движением {goal} волн. Сейчас: <b aria-live="polite">{count}/{goal}</b>.</p><button ref={ref} className="stress-field" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); lastPoint.current = { x: event.clientX, y: event.clientY }; last.current = performance.now(); }} onPointerMove={followPointer} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); lastPoint.current = null; }} onPointerCancel={() => { lastPoint.current = null; }} onKeyDown={(event) => { if (["Enter", " ", "ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); keyboardWave(); } }} aria-label="Водите пальцем или мышью, создавая волны">{ripples.map((ripple) => <i key={ripple.id} style={{ left: ripple.x, top: ripple.y }} />)}<span>нажмите и ведите по саду</span></button></>;
}
