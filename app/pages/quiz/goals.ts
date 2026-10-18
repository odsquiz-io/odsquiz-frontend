import type { CSSProperties } from "react";
import { findGoal, type OdsGoal } from "@/lib/ods";
import type { OdsScore } from "./types";

export const formatPoints = new Intl.NumberFormat("pt-BR").format;

export function goalFor(odsNumber: number): OdsGoal {
  return (
    findGoal(odsNumber) ?? {
      number: odsNumber,
      name: "Objetivo não identificado",
      statement: "",
      color: "var(--color-app-foreground)",
      textColor: "var(--color-app-background)",
    }
  );
}

export function goalColors(goal: OdsGoal) {
  return { "--ods": goal.color, "--ods-text": goal.textColor } as CSSProperties;
}

// Ties go to the lowest goal number, so every screen picks the same goal.
export function rankScores(scores: OdsScore[]) {
  return [...scores].sort((a, b) => b.points - a.points || a.ods_number - b.ods_number);
}

export function topScore(scores: OdsScore[]) {
  const [best] = rankScores(scores);
  return best && best.points > 0 ? best : undefined;
}
