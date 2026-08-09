export type LibraryItem = { id: string; type: keyof typeof libraryLabels; title: string; description: string; author?: string; url?: string; source?: string };

export const libraryLabels = { books: "Книги", rules: "Правила", myths: "Мифы", facts: "Факты" } as const;

const bookData = [
  ["Лёгкий способ бросить курить", "Аллен Карр"], ["The Easy Way for Women to Stop Smoking", "Allen Carr"], ["The Little Book of Quitting", "Allen Carr"], ["Nicotine Explained", "William Porter"], ["Freedom from Nicotine", "John R. Polito"],
  ["The Smoke-Free Formula", "Robert West"], ["Stop Smoking Now", "Paul McKenna"], ["The No-Nag, No-Guilt, Do-It-Your-Own-Way Guide to Quitting Smoking", "Tom Ferguson"], ["The Tao of Quitting Smoking", "Joseph P. Weaver"], ["Quitting Smoking for Dummies", "David Brizer"],
  ["Atomic Habits", "James Clear"], ["Tiny Habits", "BJ Fogg"], ["The Power of Habit", "Charles Duhigg"], ["Good Habits, Bad Habits", "Wendy Wood"], ["Better Than Before", "Gretchen Rubin"],
  ["Unwinding Anxiety", "Judson Brewer"], ["The Craving Mind", "Judson Brewer"], ["The Willpower Instinct", "Kelly McGonigal"], ["Self-Compassion", "Kristin Neff"], ["The Happiness Trap", "Russ Harris"],
  ["Feeling Good", "David D. Burns"], ["Mind Over Mood", "Dennis Greenberger, Christine Padesky"], ["Rewire Your Anxious Brain", "Catherine M. Pittman, Elizabeth M. Karle"], ["Full Catastrophe Living", "Jon Kabat-Zinn"], ["Wherever You Go, There You Are", "Jon Kabat-Zinn"],
  ["Why We Sleep", "Matthew Walker"], ["Burnout", "Emily Nagoski, Amelia Nagoski"], ["The Upside of Stress", "Kelly McGonigal"], ["Spark", "John J. Ratey"], ["The Joy of Movement", "Kelly McGonigal"],
  ["Digital Minimalism", "Cal Newport"], ["Deep Work", "Cal Newport"], ["Four Thousand Weeks", "Oliver Burkeman"], ["The Comfort Book", "Matt Haig"], ["Reasons to Stay Alive", "Matt Haig"],
  ["Maybe You Should Talk to Someone", "Lori Gottlieb"], ["The Body Keeps the Score", "Bessel van der Kolk"], ["Man’s Search for Meaning", "Viktor E. Frankl"], ["The Gifts of Imperfection", "Brené Brown"], ["Daring Greatly", "Brené Brown"],
  ["Chatter", "Ethan Kross"], ["Emotional Agility", "Susan David"], ["The Choice", "Edith Eger"], ["The Expectation Effect", "David Robson"], ["How to Change", "Katy Milkman"],
  ["The Kindness Method", "Shahroo Izadi"], ["The Last Diet", "Shahroo Izadi"], ["Peak Mind", "Amishi Jha"], ["Hardwiring Happiness", "Rick Hanson"], ["The Practicing Mind", "Thomas M. Sterner"],
];

const ruleSeeds = [
  "Отложите решение на десять минут", "Уберите табак и аксессуары из быстрого доступа", "Держите воду рядом", "Запишите личную причину отказа", "Предупредите близкого человека о сложном дне",
  "Назовите триггер вслух или в дневнике", "Сделайте короткую прогулку", "Не оставайтесь голодным надолго", "Защитите время сна", "Заранее подготовьте фразу отказа",
  "Смените место во время сильной тяги", "Дышите медленнее обычного", "Займите руки безопасным предметом", "Отмечайте победу, а не только трудность", "Планируйте перерыв без сигареты",
  "Ограничьте алкоголь в период высокого риска", "Возвращайтесь к плану сразу после ошибки", "Просите поддержку конкретно", "Сравнивайте себя только с собой вчерашним", "Обсудите медикаментозную помощь с врачом",
];
const contexts = ["утром", "на работе", "в дороге", "вечером", "в компании"];
const mythSeeds = [
  "Нужно полагаться только на силу воли", "Одна сигарета ничего не меняет", "После долгого стажа бросать уже поздно", "Никотин снимает стресс", "Срыв означает полный провал",
  "Симптомы отмены одинаковы у всех", "Набор веса неизбежен", "Вейп всегда безвреден", "Кальян безопаснее сигарет", "Никотин нужен для концентрации",
  "Резкий отказ опасен для любого человека", "Поддержка — признак слабости", "Тяга будет только усиливаться", "Без сигареты невозможно общаться", "После месяца риск возврата исчезает",
  "Дыхание заменяет любую медицинскую помощь", "Нужно избегать всех курящих людей навсегда", "Нельзя радоваться до конца года", "Если думать о сигарете, значит ничего не получилось", "Все методы работают одинаково",
  "Никотин улучшает настроение в долгую", "Пассивное курение несущественно", "Табак без дыма не несёт риска", "Электронные устройства выделяют только водяной пар", "План не нужен — достаточно решения",
];
const factSeeds = [
  "Отказ полезен в любом возрасте", "Тяга меняется волнами", "Поведенческая поддержка повышает шансы", "Лекарственные методы требуют индивидуального выбора", "Триггеры включают места, эмоции и людей",
  "Алкоголь может повышать риск возврата", "Короткое движение иногда уменьшает тягу", "Сон влияет на самоконтроль", "Дневник помогает увидеть закономерности", "Срыв можно разобрать без самонаказания",
  "Пассивный дым связан с риском для здоровья", "Угарный газ после отказа снижается", "Вкус и обоняние могут меняться", "Пульс может начать меняться вскоре после отказа", "Кашель иногда временно меняется",
  "Новый ритуал легче закрепить в знакомом контексте", "Конкретная причина сильнее абстрактного обещания", "Поддержка бывает профессиональной и социальной", "Никотиновая зависимость имеет биологическую и поведенческую стороны", "Самосострадание совместимо с ответственностью",
  "Риск заболеваний снижается постепенно", "Индивидуальные сроки восстановления различаются", "Дети особенно уязвимы к табачному дыму", "Не существует безопасного уровня воздействия табачного дыма", "План предотвращения возврата полезен и после долгого периода",
];

const books: LibraryItem[] = bookData.map(([title, author], i) => ({ id: `book-${i + 1}`, type: "books", title, author, description: "Реальная книга о привычках, психологической гибкости, восстановлении или отказе от никотина.", url: `https://www.google.com/search?q=${encodeURIComponent(`${title} ${author}`)}` }));
const rules: LibraryItem[] = ruleSeeds.flatMap((seed, i) => contexts.map((context, j) => ({ id: `rule-${i * 5 + j + 1}`, type: "rules" as const, title: `${seed} — ${context}`, description: `Практическое правило: ${seed.toLowerCase()} ${context}. Подстройте действие под своё самочувствие и обстоятельства.`, source: "Smokefree.gov / NHS" })));
const myths: LibraryItem[] = mythSeeds.flatMap((seed, i) => ["что известно", "где ловушка", "как проверить", "что выбрать"].map((angle, j) => ({ id: `myth-${i * 4 + j + 1}`, type: "myths" as const, title: `Миф: ${seed.toLowerCase()} — ${angle}`, description: `Это упрощение не учитывает индивидуальность зависимости и данные исследований. Полезнее оценить конкретный триггер, доступную поддержку и следующий безопасный шаг.`, source: "ВОЗ / CDC / Cochrane" })));
const facts: LibraryItem[] = factSeeds.flatMap((seed, i) => ["суть", "для наблюдения", "для плана", "для разговора со специалистом"].map((angle, j) => ({ id: `fact-${i * 4 + j + 1}`, type: "facts" as const, title: `${seed}: ${angle}`, description: `${seed}. Это общее образовательное наблюдение, а не прогноз для конкретного человека.`, source: "ВОЗ / CDC / NHS" })));

export const library = { books, rules, myths, facts };
export const allLibraryItems = Object.values(library).flat();
