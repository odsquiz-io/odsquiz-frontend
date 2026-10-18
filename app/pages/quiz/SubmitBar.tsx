import { focusRing, primaryButton } from "@/components/styles";
import { goalFor } from "./goals";
import type { QuizQuestion } from "./types";

export function SubmitBar({
  answeredCount,
  canSubmit,
  hasToken,
  message,
  onSubmit,
  questions,
  selections,
  submitting,
}: {
  answeredCount: number;
  canSubmit: boolean;
  hasToken: boolean;
  message: string;
  onSubmit: () => void;
  questions: QuizQuestion[];
  selections: Record<string, string>;
  submitting: boolean;
}) {
  const nextQuestion = questions.find((question) => !selections[question.id]);

  return (
    <div className="sticky bottom-0 z-10 mt-12 bg-[var(--color-app-background)]">
      <div aria-hidden="true" className="flex h-1.5 gap-px">
        {questions.map((question) => (
          <span
            key={question.id}
            className="flex-1 bg-[var(--color-header-border)] transition-colors duration-500"
            style={
              selections[question.id]
                ? { backgroundColor: goalFor(question.ods_number).color }
                : undefined
            }
          />
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:gap-8 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-3xl font-extrabold leading-none tabular-nums [font-stretch:75%]">
              {answeredCount}
              <span className="text-[var(--color-muted)]">/{questions.length}</span>
            </span>
            <span className="text-sm font-bold">respondidas</span>
          </p>

          {message ? (
            <p role="alert" className="mt-1 text-sm font-semibold text-[var(--color-error)]">
              {message}
            </p>
          ) : !nextQuestion ? (
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {hasToken
                ? "Tudo pronto para enviar."
                : "Entre na sua conta para enviar."}
            </p>
          ) : answeredCount > 0 ? (
            <a
              href={`#pergunta-${nextQuestion.number}`}
              className={`mt-1 inline-block text-sm font-bold underline underline-offset-4 transition hover:text-[var(--color-link-hover)] ${focusRing}`}
            >
              Ir para a pergunta {nextQuestion.number}
            </a>
          ) : (
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Responda a todas para enviar.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={onSubmit}
          className={`shrink-0 ${primaryButton} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {submitting ? (
            "Enviando…"
          ) : (
            <>
              Enviar<span className="hidden sm:inline">&nbsp;respostas</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
