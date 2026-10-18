import type { CSSProperties } from "react";
import { findGoal, type OdsGoal } from "@/lib/ods";

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
