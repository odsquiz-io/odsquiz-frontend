import Link from "next/link";
import { OdsBand } from "@/components/OdsBand";
import { eyebrow, primaryButton, surface } from "@/components/styles";
import { BestGoal } from "./BestGoal";
import { formatPoints, topScore } from "./goals";
import { ScoreBars } from "./ScoreBars";
import type { QuizResult } from "./types";

function focusOnMount(node: HTMLElement | null) {
  node?.focus();
}

export function ResultPanel({ result }: { result: QuizResult }) {
  const scores = result.ods_scores ?? [];

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
            className="mt-4 scroll-mt-9 text-4xl font-extrabold leading-none tracking-[-0.01em] [font-stretch:82%] focus:outline-none sm:text-6xl"
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

        <BestGoal score={topScore(scores)} />
      </div>

      {scores.length > 0 ? (
        <div className="mt-20">
          <h3 className="text-2xl font-extrabold [font-stretch:85%] sm:text-3xl">
            Pontos por objetivo
          </h3>
          <p className="mt-2 text-[var(--color-muted)]">
            Do maior para o menor, entre os objetivos que aparecem no quiz.
          </p>

          <ScoreBars scores={scores} className="mt-8" />
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
