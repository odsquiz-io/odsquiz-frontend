import { formatPoints, goalFor } from "./goals";
import type { OdsScore } from "./types";

export function BestGoal({ score }: { score?: OdsScore }) {
  if (!score) {
    return (
      <p className="self-end rounded-lg border-2 border-dashed border-[var(--color-header-border)] p-6 text-lg text-[var(--color-muted)] sm:p-8">
        Nenhum objetivo somou pontos com as respostas que você marcou.
      </p>
    );
  }

  const goal = goalFor(score.ods_number);

  return (
    <div
      className="flex flex-col rounded-lg p-6 sm:p-8 motion-safe:animate-[build_1000ms_cubic-bezier(0.2,0.8,0.2,1)_150ms_both]"
      style={{ backgroundColor: goal.color, color: goal.textColor }}
    >
      <h3 className="text-sm font-bold uppercase tracking-[0.1em]">Maior afinidade</h3>
      <p
        aria-hidden="true"
        className="mt-6 font-display text-[clamp(5rem,12vw,8rem)] font-extrabold leading-[0.8] [font-stretch:75%]"
      >
        {String(goal.number).padStart(2, "0")}
      </p>
      <p className="mt-4 font-display text-2xl font-extrabold leading-tight [font-stretch:85%] sm:text-3xl">
        <span className="sr-only">ODS {goal.number}: </span>
        {goal.name}
      </p>
      {goal.statement ? <p className="mt-3 flex-1 leading-relaxed">{goal.statement}.</p> : null}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-current/30 pt-4">
        <p className="font-bold tabular-nums">{formatPoints(score.points)} pontos</p>
        <a
          href={`https://brasil.un.org/pt-br/sdgs/${goal.number}`}
          target="_blank"
          rel="noreferrer"
          className="font-bold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          Metas na ONU Brasil
          <span className="sr-only"> (abre em nova guia)</span>
        </a>
      </div>
    </div>
  );
}
