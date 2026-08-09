"use client";

import { motion } from "framer-motion";
import { Bird, Bug, Fish, Flower2, Leaf, Rabbit, Squirrel, Waves } from "lucide-react";
import type { CSSProperties } from "react";
import type { ForestObject } from "@/src/entities/types";
import { russianNoun } from "@/src/utils/russian";

function speciesClass(kind: string, cycle: number) {
  if (["Сосна", "Кедр", "Ель", "Пихта"].includes(kind)) return "conifer";
  if (kind === "Берёза" || kind === "Осина") return "slender";
  if (kind === "Ива") return "willow";
  if (["Яблоня", "Магнолия", "Сакура", "Рябина"].includes(kind)) return "blossom";
  return cycle % 3 === 0 ? "wide" : "round";
}

export function NatureScene({ vitality, cycle, kind, compact = false, forest, progressDays = 0 }: { vitality?: number; cycle?: number; kind?: string; compact?: boolean; forest?: ForestObject[]; progressDays?: number }) {
  const fallback: ForestObject = { id: `nature-${cycle ?? 1}`, cycle: cycle ?? 1, kind: kind ?? "Дуб", vitality: vitality ?? 15 };
  const objects = (forest?.length ? forest : [fallback]).slice(-36);
  const current = objects.at(-1) ?? fallback;
  const stage = Math.max(1, Math.ceil(current.vitality / 20));
  const visible = compact ? [current] : objects;
  return <div className={`nature-scene living-forest ${compact ? "compact" : ""}`} aria-label={`Живой лес: ${objects.length} ${russianNoun(objects.length, "дерево", "дерева", "деревьев")}, активность ${current.vitality}%`}>
    <div className="nature-sky"><span className="nature-sun" />{progressDays >= 3 && <Bird className="scene-bird bird-a" />}{progressDays >= 7 && <Bird className="scene-bird bird-b" />}</div>
    <div className="nature-hills"><i /><i /></div>
    <div className="forest-floor" />
    <div className="tree-grove">
      {visible.map((tree, index) => {
        const row = index % 3;
        const x = compact ? 50 : 7 + ((index * 23 + row * 11) % 88);
        const scale = compact ? .78 : .52 + ((index * 7) % 5) * .09;
        const style = { "--tree-x": `${x}%`, "--tree-scale": scale, "--tree-z": 3 + row, "--tree-hue": `${(index * 29) % 85 - 30}deg` } as CSSProperties;
        const treeStage = tree.completedAt ? 5 : Math.max(1, Math.ceil(tree.vitality / 20));
        return <motion.div key={tree.id} className={`real-tree ${speciesClass(tree.kind, tree.cycle)} tree-stage-${treeStage}`} style={style} initial={{ scale: .3, opacity: 0 }} animate={{ scale: 1, opacity: tree.vitality < 35 ? .72 : 1 }} transition={{ duration: .65, delay: Math.min(index * .035, .7) }} title={`${tree.kind} · цикл ${tree.cycle}`}>
          <span className="tree-shadow" /><span className="real-trunk"><i className="tree-hollow" /></span><span className="real-branch branch-left" /><span className="real-branch branch-right" />
          <span className="crown crown-a" /><span className="crown crown-b" /><span className="crown crown-c" /><span className="crown crown-d" />
          {treeStage >= 4 && <span className="tree-nest"><i /><i /></span>}
          {treeStage >= 5 && <><span className="tree-fruit fruit-a" /><span className="tree-fruit fruit-b" /></>}
          <b className="tree-name">{tree.kind}</b>
        </motion.div>;
      })}
    </div>
    {progressDays >= 4 && <><Flower2 className="scene-flower flower-a" /><Flower2 className="scene-flower flower-b" /></>}
    {progressDays >= 8 && <Bug className="wildlife butterfly" />}
    {progressDays >= 13 && <Rabbit className="wildlife rabbit" />}
    {progressDays >= 18 && <Squirrel className="wildlife squirrel" />}
    {progressDays >= 24 && <div className="pond"><Waves />{progressDays >= 32 && <Fish />}</div>}
    {progressDays >= 30 && <Bird className="wildlife ground-bird" />}
    <div className="nature-caption"><span><Leaf size={15} /> {objects.length === 1 ? `Цикл ${current.cycle}` : "Личная экосистема"}</span><strong>{objects.length === 1 ? current.kind : `${objects.length} ${russianNoun(objects.length, "уникальное дерево", "уникальных дерева", "уникальных деревьев")}`}</strong><small>{current.vitality}% жизненности · стадия {stage}/5</small></div>
  </div>;
}
