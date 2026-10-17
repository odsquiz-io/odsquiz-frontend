"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Header } from "@/components/Header";
import { odsNames } from "./ods";
import {
  fetchQuizQuestions,
  getServerAuthToken,
  getStoredAuthToken,
  submitQuiz,
  subscribeToAuthToken,
} from "./quiz/api";
import type { QuizQuestion, QuizResult, QuizStatus } from "./quiz/types";

export default function Quiz() {
  const token = useSyncExternalStore(
    subscribeToAuthToken,
    getStoredAuthToken,
    getServerAuthToken,
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [status, setStatus] = useState<QuizStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadQuestions() {
      setStatus("loading");
      setMessage("");

      try {
        const nextQuestions = await fetchQuizQuestions();
        if (isCurrent) {
          setQuestions(nextQuestions);
          setStatus("idle");
        }
      } catch (error) {
        if (isCurrent) {
          setStatus("error");
          setMessage(
            error instanceof Error ? error.message : "Algo deu errado ao carregar o quiz.",
          );
        }
      }
    }

    loadQuestions();

    return () => {
      isCurrent = false;
    };
  }, []);

  const answeredCount = Object.keys(selections).length;
  const canSubmit = Boolean(token) && answeredCount === questions.length && questions.length > 0;

  const orderedScores = useMemo(() => {
    return [...(result?.ods_scores ?? [])]
      .filter((score) => score.points > 0)
      .sort((a, b) => b.points - a.points);
  }, [result]);

  async function handleSubmit() {
    if (!token) {
      setMessage("Entre na sua conta para salvar sua pontuação.");
      return;
    }

    if (!canSubmit) {
      setMessage("Responda todas as perguntas antes de enviar.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const submission = await submitQuiz(selections, token);
      setResult(submission);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Algo deu errado ao enviar o quiz.",
      );
    }
  }

  return (
    <main className="relative min-h-screen bg-[var(--color-app-background)] transition-colors">
      <Header />

      <section className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-link-hover)]">
              ODS Quiz
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[var(--color-app-foreground)]">
              Quiz individual
            </h1>
          </div>

          <div className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] px-4 py-3 text-sm text-[var(--color-app-foreground)] shadow-xl shadow-black/10">
            {answeredCount}/{questions.length} respondidas
          </div>
        </div>

        {!token ? <LoginRequired /> : null}

        {status === "loading" ? (
          <p className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 text-sm text-[var(--color-app-foreground)]">
            Carregando perguntas...
          </p>
        ) : null}

        {message ? (
          <p className="mb-5 rounded-lg border border-red-400/40 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
            {message}
          </p>
        ) : null}

        {result ? (
          <ResultPanel result={result} orderedScores={orderedScores} />
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                selectedOptionID={selections[question.id]}
                onSelect={(answerOptionId) =>
                  setSelections((currentSelections) => ({
                    ...currentSelections,
                    [question.id]: answerOptionId,
                  }))
                }
              />
            ))}

            {questions.length > 0 ? (
              <div className="sticky bottom-0 z-10 -mx-4 border-t border-[var(--color-header-border)] bg-[var(--color-app-background)]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-[var(--color-app-foreground)]">
                    {canSubmit
                      ? "Tudo respondido."
                      : "Complete todas as perguntas para registrar sua pontuação."}
                  </p>
                  <button
                    type="button"
                    disabled={!canSubmit || status === "submitting"}
                    onClick={handleSubmit}
                    className="min-h-11 rounded-md border border-[var(--color-app-foreground)] px-5 text-sm font-bold text-[var(--color-app-foreground)] transition enabled:hover:bg-[var(--color-app-foreground)] enabled:hover:text-[var(--color-button-hover-text)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "submitting" ? "Enviando..." : "Enviar respostas"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

function QuestionCard({
  onSelect,
  question,
  selectedOptionID,
}: {
  onSelect: (answerOptionId: string) => void;
  question: QuizQuestion;
  selectedOptionID?: string;
}) {
  return (
    <fieldset className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-4 text-[var(--color-app-foreground)] shadow-xl shadow-black/10 sm:p-5">
      <legend className="sr-only">Pergunta {question.number}</legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-base font-bold leading-7">
          {question.number}) {question.text}
        </p>
        <span className="shrink-0 rounded-md border border-[var(--color-header-border)] px-2 py-1 text-xs font-bold text-[var(--color-link-hover)]">
          ODS {question.ods_number}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition ${
              selectedOptionID === option.id
                ? "border-[var(--color-link-hover)] bg-[var(--color-link-hover)]/15"
                : "border-[var(--color-header-border)] hover:border-[var(--color-link-hover)]"
            }`}
          >
            <input
              type="radio"
              name={question.id}
              checked={selectedOptionID === option.id}
              onChange={() => onSelect(option.id)}
              className="mt-1 h-4 w-4 accent-[var(--color-link-hover)]"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ResultPanel({
  orderedScores,
  result,
}: {
  orderedScores: QuizResult["ods_scores"];
  result: QuizResult;
}) {
  const bestScore = orderedScores[0];

  return (
    <div className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 text-[var(--color-app-foreground)] shadow-2xl shadow-black/20 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-link-hover)]">
        Resultado registrado
      </p>
      <h2 className="mt-2 text-3xl font-extrabold">{result.total_points} pontos</h2>
      {bestScore ? (
        <p className="mt-2 text-sm">
          Maior afinidade: ODS {bestScore.ods_number}
          {odsNames[bestScore.ods_number] ? ` - ${odsNames[bestScore.ods_number]}` : ""}.
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orderedScores.map((score) => (
          <div
            key={score.ods_number}
            className="rounded-md border border-[var(--color-header-border)] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">ODS {score.ods_number}</p>
              <p className="text-sm font-bold text-[var(--color-link-hover)]">
                {score.points} pts
              </p>
            </div>
            <p className="mt-1 text-xs opacity-80">{odsNames[score.ods_number]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginRequired() {
  return (
    <div className="mb-5 rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 text-[var(--color-app-foreground)] shadow-xl shadow-black/10">
      <h2 className="text-xl font-bold">Login necessário</h2>
      <p className="mt-2 text-sm">Entre na sua conta para salvar sua pontuação.</p>
      <Link
        href="/login"
        className="mt-5 inline-flex min-h-11 items-center rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)]"
      >
        Fazer login
      </Link>
    </div>
  );
}
