import { odsGoals } from "@/lib/ods";
import type { OdsScore } from "../quiz/types";

export function QuizSkyline({
  className = "",
  large = false,
  max,
  scores,
}: {
  className?: string;
  large?: boolean;
  max: number;
  scores: OdsScore[];
}) {
  const points = new Map(scores.map((score) => [score.ods_number, score.points]));

  return (
    <span aria-hidden="true" className={`block ${className}`}>
      <span
        className={`flex items-end ${
          large
            ? "h-28 gap-1 border-b-2 border-[var(--color-app-foreground)] sm:h-36 sm:gap-1.5"
            : "h-10 gap-0.5 border-b border-[var(--color-header-border)]"
        }`}
      >
        {odsGoals.map((goal, index) => (
          <span
            key={goal.number}
            className={
              large
                ? "flex-1 origin-bottom rounded-t-[3px] motion-safe:animate-[rise_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
                : "flex-1 rounded-t-xs"
            }
            style={{
              height: `${((points.get(goal.number) ?? 0) / max) * 100}%`,
              backgroundColor: goal.color,
              animationDelay: large ? `${index * 45}ms` : undefined,
            }}
          />
        ))}
      </span>

      {large ? (
        <span className="mt-2 flex gap-1 text-center font-display text-[0.6875rem] font-bold tabular-nums text-[var(--color-muted)] [font-stretch:85%] sm:gap-1.5 sm:text-xs">
          {odsGoals.map((goal) => (
            <span key={goal.number} className="flex-1">
              {String(goal.number).padStart(2, "0")}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
