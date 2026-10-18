import Link from "next/link";
import { eyebrow, focusRing, primaryButton, surface } from "@/components/styles";
import { odsGoals } from "@/lib/ods";
import { BestGoal } from "../quiz/BestGoal";
import { formatPoints, goalFor, topScore } from "../quiz/goals";
import { ScoreBars } from "../quiz/ScoreBars";
import type { QuizSubmission } from "../quiz/types";
import { formatDate } from "./format";
import { QuizSkyline } from "./QuizSkyline";

const dateAndTime: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const formatDifference = new Intl.NumberFormat("pt-BR", {
  signDisplay: "exceptZero",
}).format;

export function QuizHistory({ submissions }: { submissions: QuizSubmission[] }) {
  if (submissions.length === 0) {
    return <EmptyHistory />;
  }

  const [latest, previous] = submissions;
  // One scale for every skyline, so results can be compared at a glance.
  const max = Math.max(
    1,
    ...submissions.flatMap((submission) => submission.ods_scores.map((score) => score.points)),
  );

  return (
    <>
      <LatestResult latest={latest} max={max} previous={previous} />

      <div className="mt-20">
        <h3 className="text-2xl font-extrabold [font-stretch:85%] sm:text-3xl">Histórico</h3>
        <p className="mt-2 text-[var(--color-muted)]">
          {submissions.length > 1 ? "Do mais recente para o mais antigo. " : null}
          As barras mostram os pontos de cada ODS, do 1 ao 17.
        </p>

        <ol className="mt-8 border-b border-[var(--color-header-border)]">
          {submissions.map((submission) => (
            <li key={submission.id} className="border-t border-[var(--color-header-border)]">
              <SubmissionRow max={max} submission={submission} />
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function LatestResult({
  latest,
  max,
  previous,
}: {
  latest: QuizSubmission;
  max: number;
  previous?: QuizSubmission;
}) {
  const difference = previous ? latest.total_points - previous.total_points : null;

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col">
        <h3 className={eyebrow}>Resultado mais recente</h3>
        <p className="mt-4 text-lg font-bold">
          <Timestamp value={latest.completed_at} />
        </p>
        <p className="mt-8">
          <span className="block font-display text-[clamp(4.5rem,14vw,8.5rem)] font-extrabold leading-[0.85] [font-stretch:75%]">
            {formatPoints(latest.total_points)}
          </span>
          <span className="mt-3 block text-xl font-bold">pontos no total</span>
        </p>
        {difference === null ? null : (
          <p className="mt-6 text-lg text-[var(--color-muted)]">
            {difference === 0 ? (
              "Mesmo total do quiz anterior."
            ) : (
              <>
                <span className="font-bold tabular-nums text-[var(--color-app-foreground)]">
                  {formatDifference(difference)} pontos
                </span>{" "}
                em relação ao quiz anterior
              </>
            )}
          </p>
        )}
        <QuizSkyline
          large
          max={max}
          scores={latest.ods_scores}
          className="mt-12 lg:mt-auto lg:pt-12"
        />
      </div>

      <BestGoal score={topScore(latest.ods_scores)} />
    </div>
  );
}

function SubmissionRow({ max, submission }: { max: number; submission: QuizSubmission }) {
  const best = topScore(submission.ods_scores);
  const goal = best ? goalFor(best.ods_number) : undefined;

  return (
    <details className="group">
      <summary
        className={`group/summary grid cursor-pointer list-none grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)_11rem_auto] sm:gap-x-6 lg:grid-cols-[3.5rem_minmax(0,1fr)_16rem_auto] [&::-webkit-details-marker]:hidden ${focusRing}`}
      >
        {goal ? (
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-[3px] font-display text-2xl font-extrabold [font-stretch:75%] sm:size-14 sm:text-3xl"
            style={{ backgroundColor: goal.color, color: goal.textColor }}
          >
            {String(goal.number).padStart(2, "0")}
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="size-12 rounded-[3px] border-2 border-dashed border-[var(--color-header-border)] sm:size-14"
          />
        )}

        <span className="min-w-0">
          <span className="block font-display text-lg font-extrabold leading-snug [font-stretch:85%] sm:text-xl">
            <Timestamp value={submission.completed_at} />
          </span>
          <span className="mt-1 block text-sm text-[var(--color-muted)]">
            <span className="font-bold tabular-nums text-[var(--color-app-foreground)]">
              {formatPoints(submission.total_points)}
            </span>{" "}
            pontos <span aria-hidden="true">·</span>{" "}
            {goal ? (
              <>
                Maior afinidade: <span className="sr-only">ODS {goal.number}: </span>
                {goal.name}
              </>
            ) : (
              "Nenhum objetivo somou pontos"
            )}
          </span>
        </span>

        <QuizSkyline
          max={max}
          scores={submission.ods_scores}
          className="col-span-full row-start-2 sm:col-span-1 sm:row-start-auto"
        />

        <span className="flex items-center gap-2 text-sm font-bold transition-colors group-hover/summary:text-[var(--color-link-hover)]">
          <span className="hidden md:inline">Pontos por objetivo</span>
          <span
            aria-hidden="true"
            className="text-2xl leading-none motion-safe:transition-transform group-open:rotate-45"
          >
            +
          </span>
        </span>
      </summary>

      <div className="pb-10 sm:pl-20">
        <p className="text-sm text-[var(--color-muted)]">
          Do maior para o menor, entre os objetivos que aparecem no quiz.
        </p>
        <ScoreBars scores={submission.ods_scores} delay={0} className="mt-6 max-w-3xl" />
      </div>
    </details>
  );
}

function EmptyHistory() {
  return (
    <div className={`overflow-hidden ${surface}`}>
      <div className="max-w-2xl p-6 sm:p-8">
        <h3 className="text-2xl font-extrabold [font-stretch:85%] sm:text-3xl">
          Seu primeiro resultado vai aparecer aqui.
        </h3>
        <p className="mt-3 text-[var(--color-muted)]">
          São perguntas sobre o dia a dia da sua casa e da sua comunidade. No
          fim, você descobre qual ODS tem mais a ver com a sua realidade.
        </p>
        <Link href="/quiz" className={`mt-6 ${primaryButton}`}>
          Fazer o quiz
        </Link>
      </div>

      <div
        aria-hidden="true"
        className="mt-2 flex h-16 items-end gap-1 px-6 sm:h-24 sm:gap-1.5 sm:px-8"
      >
        {odsGoals.map((goal) => (
          <span
            key={goal.number}
            className="h-full flex-1 rounded-t-[3px] border-2 border-b-0 border-dashed"
            style={{ borderColor: goal.color }}
          />
        ))}
      </div>
    </div>
  );
}

function Timestamp({ value }: { value: string }) {
  return <time dateTime={value}>{formatDate(value, dateAndTime)}</time>;
}
