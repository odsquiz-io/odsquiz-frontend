"use client";

import { useEffect, useState } from "react";
import { LoginRequired } from "@/components/LoginRequired";
import { OdsBand } from "@/components/OdsBand";
import { PageHeader } from "@/components/PageHeader";
import { useAuthToken } from "@/lib/auth";
import { odsGoals } from "@/lib/ods";
import { fetchQuizQuestions, submitQuiz } from "./quiz/api";
import { QuestionCard } from "./quiz/QuestionCard";
import { ResultPanel } from "./quiz/ResultPanel";
import { SubmitBar } from "./quiz/SubmitBar";
import type { QuizQuestion, QuizResult, QuizStatus } from "./quiz/types";

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof TypeError) {
    return "Não foi possível conectar ao quiz. Confira sua conexão e tente de novo.";
  }

  return error instanceof Error ? error.message : fallback;
}

export default function Quiz() {
  const token = useAuthToken();
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
          setMessage(errorMessage(error, "Algo deu errado ao carregar o quiz."));
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
      setMessage(errorMessage(error, "Algo deu errado ao enviar o quiz."));
    }
  }

  return (
    <main className="min-h-svh flex-1 bg-[var(--color-app-background)] pb-24 text-[var(--color-app-foreground)] transition-colors">
      <div className="mx-auto max-w-6xl px-4 pt-36 sm:px-6 sm:pt-44">
        <PageHeader
          label="Quiz individual"
          title="Qual ODS tem mais a ver com a sua realidade?"
          actions={questions.length > 0 ? <QuizFacts questions={questions} /> : undefined}
        >
          Perguntas sobre o dia a dia da sua casa e da sua comunidade, cada uma
          ligada a um dos Objetivos de Desenvolvimento Sustentável. Não há
          resposta certa ou errada: no fim, você vê como a sua realidade se
          relaciona com cada ODS.
        </PageHeader>

        {status === "loading" ? (
          <div role="status" className="mt-12 flex items-center gap-4 text-[var(--color-muted)]">
            <OdsBand className="h-1.5 w-20 origin-left motion-safe:animate-[draw_1.2s_ease-in-out_infinite_alternate]" />
            Carregando perguntas…
          </div>
        ) : null}

        {status === "idle" && questions.length === 0 ? (
          <p className="mt-12 text-[var(--color-muted)]">
            Nenhuma pergunta disponível no momento. Volte mais tarde.
          </p>
        ) : null}

        {questions.length === 0 && message ? (
          <div role="alert" className="mt-12 max-w-3xl rounded-lg border-2 border-[var(--color-error)] p-6">
            <p className="font-bold text-[var(--color-error)]">{message}</p>
            <p className="mt-2 text-[var(--color-muted)]">
              Atualize a página para tentar de novo.
            </p>
          </div>
        ) : null}

        {token === null ? (
          <LoginRequired
            className="mt-12 max-w-4xl"
            message="Você pode marcar as respostas sem conta, mas só consegue enviá-las e ver o resultado depois de entrar. Faça login antes de começar para não perder o que marcou."
          />
        ) : null}
      </div>

      {result ? (
        <ResultPanel result={result} />
      ) : questions.length > 0 ? (
        <div className="mt-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ol aria-label="Perguntas do quiz" className="grid max-w-4xl gap-4">
              {questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  selectedOptionID={selections[question.id]}
                  total={questions.length}
                  onSelect={(answerOptionId) =>
                    setSelections((currentSelections) => ({
                      ...currentSelections,
                      [question.id]: answerOptionId,
                    }))
                  }
                />
              ))}
            </ol>
          </div>

          <SubmitBar
            answeredCount={answeredCount}
            canSubmit={canSubmit}
            hasToken={Boolean(token)}
            message={message}
            questions={questions}
            selections={selections}
            submitting={status === "submitting"}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </main>
  );
}

function QuizFacts({ questions }: { questions: QuizQuestion[] }) {
  const goalsCovered = new Set(questions.map((question) => question.ods_number)).size;

  return (
    <div className="flex origin-bottom-left gap-10 motion-safe:animate-[zoom_700ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
      <Fact value={questions.length} label="perguntas" />
      <Fact value={goalsCovered} label={`de ${odsGoals.length} ODS`} />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: number }) {
  return (
    <p>
      <span className="block font-display text-6xl font-extrabold leading-none tabular-nums [font-stretch:75%]">
        {value}
      </span>
      <span className="mt-2 block text-sm font-bold text-[var(--color-muted)]">{label}</span>
    </p>
  );
}
