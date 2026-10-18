import { formatPoints, goalFor, rankScores } from "./goals";
import type { OdsScore } from "./types";

export function ScoreBars({
  className = "",
  delay = 300,
  scores,
}: {
  className?: string;
  delay?: number;
  scores: OdsScore[];
}) {
  const ranked = rankScores(scores);
  const topPoints = ranked[0]?.points || 1;

  return (
    <ol className={`grid gap-5 ${className}`}>
      {ranked.map((score, index) => {
        const goal = goalFor(score.ods_number);

        return (
          <li
            key={score.ods_number}
            className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-4"
          >
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-[3px] font-display text-xl font-extrabold [font-stretch:75%]"
              style={{ backgroundColor: goal.color, color: goal.textColor }}
            >
              {String(goal.number).padStart(2, "0")}
            </span>
            <div>
              <p className="flex items-baseline justify-between gap-4">
                <span className="font-bold">
                  <span className="sr-only">ODS {goal.number}: </span>
                  {goal.name}
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  <span className="font-bold">{formatPoints(score.points)}</span>{" "}
                  <span className="text-[var(--color-muted)]">pontos</span>
                </span>
              </p>
              <div
                aria-hidden="true"
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--color-header-border)]"
              >
                <div
                  className="h-full origin-left rounded-full motion-safe:animate-[draw_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
                  style={{
                    width: `${(score.points / topPoints) * 100}%`,
                    backgroundColor: goal.color,
                    animationDelay: `${delay + index * 70}ms`,
                  }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
