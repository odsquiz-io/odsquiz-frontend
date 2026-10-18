import Link from "next/link";
import { OdsBand } from "@/components/OdsBand";
import { eyebrow, primaryButton, surface } from "@/components/styles";
import { goalFor } from "./goals";
import type { QuizResult } from "./types";

const formatPoints = new Intl.NumberFormat("pt-BR").format;

function focusOnMount(node: HTMLElement | null) {
  node?.focus();
}

export function ResultPanel({ result }: { result: QuizResult }) {
  const scores = [...(result.ods_scores ?? [])].sort((a, b) => b.points - a.points);
  const topPoints = Math.max(0, ...scores.map((score) => score.points));
  const best = topPoints > 0 ? scores[0] : undefined;

  return (
    <section
      aria-labelledby="quiz-result-title"
      className="mx-auto mt-16 max-w-6xl px-4 sm:px-6"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className={eyebrow}>Resultado registrado</p>
          <h2
            ref={focusOnMount}
            id="quiz-result-title"
            tabIndex={-1}
            className="mt-4 scroll-mt-24 text-4xl font-extrabold leading-none tracking-[-0.01em] [font-stretch:82%] focus:outline-none sm:text-6xl"
          >
            Obrigado por responder!
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[var(--color-muted)]">
            Sua pontuação foi salva na sua conta. Veja qual objetivo somou mais
            pontos nas suas respostas e como os outros se comparam.
          </p>
          <p className="mt-10">
            <span className="block origin-bottom-left font-display text-[clamp(4.5rem,14vw,8.5rem)] font-extrabold leading-[0.85] tabular-nums [font-stretch:75%] motion-safe:animate-[zoom_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
              {formatPoints(result.total_points)}
            </span>
            <span className="mt-3 block text-xl font-bold">pontos no total</span>
          </p>
        </div>

        {best ? (
          <BestGoal odsNumber={best.ods_number} points={best.points} />
        ) : (
          <p className="self-end rounded-lg border-2 border-dashed border-[var(--color-header-border)] p-6 text-lg text-[var(--color-muted)] sm:p-8">
            Nenhum objetivo somou pontos com as respostas que você marcou.
          </p>
        )}
      </div>

      {scores.length > 0 ? (
        <div className="mt-20">
          <h3 className="text-2xl font-extrabold [font-stretch:85%] sm:text-3xl">
            Pontos por objetivo
          </h3>
          <p className="mt-2 text-[var(--color-muted)]">
            Do maior para o menor, entre os objetivos que aparecem no quiz.
          </p>

          <ol className="mt-8 grid gap-5">
            {scores.map((score, index) => {
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
                          width: `${(score.points / (topPoints || 1)) * 100}%`,
                          backgroundColor: goal.color,
                          animationDelay: `${300 + index * 70}ms`,
                        }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      <div className={`mt-20 overflow-hidden ${surface}`}>
        <OdsBand className="h-1.5" />
        <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h3 className="text-2xl font-extrabold [font-stretch:85%]">E agora?</h3>
            <p className="mt-2 text-[var(--color-muted)]">
              Conheça quem já atua pelos ODS perto de você e cadastre as
              iniciativas que você conhece.
            </p>
          </div>
          <Link href="/initiatives" className={`shrink-0 self-start md:self-auto ${primaryButton}`}>
            Ver iniciativas no mapa
          </Link>
        </div>
      </div>
    </section>
  );
}

function BestGoal({ odsNumber, points }: { odsNumber: number; points: number }) {
  const goal = goalFor(odsNumber);

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
        <p className="font-bold tabular-nums">{formatPoints(points)} pontos</p>
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
