import { AccountSuspendedError, isAccountSuspended } from "@/components/SessionProvider";
import type { QuizQuestion, QuizResult, QuizSubmission } from "./types";

export async function fetchQuizQuestions() {
  const payload = await request(
    "/api/quiz/questions",
    {},
    "Não foi possível carregar o quiz.",
  );

  return questionsFrom(payload);
}

export async function submitQuiz(
  selections: Record<string, string>,
  token: string,
) {
  const payload = await request(
    "/api/quiz/submissions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: Object.entries(selections).map(([questionId, answerOptionId]) => ({
          question_id: questionId,
          answer_option_id: answerOptionId,
        })),
      }),
    },
    "Não foi possível enviar suas respostas.",
  );

  return payload as QuizResult;
}

export async function fetchQuizSubmissions(token: string) {
  const payload = await request(
    "/api/quiz/submissions",
    { headers: { Authorization: `Bearer ${token}` } },
    "Não foi possível carregar seus quizzes.",
  );

  return Array.isArray(payload) ? (payload as QuizSubmission[]) : [];
}

async function request(url: string, init: RequestInit, fallbackMessage: string) {
  const response = await fetch(url, init);
  const payload = await readPayload(response);

  if (!response.ok) {
    throw errorFrom(response.status, payload, fallbackMessage);
  }

  return payload;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

// Chosen by status or code: the API replies with codes or English text, never with page copy.
function errorFrom(status: number, payload: unknown, fallback: string) {
  if (isAccountSuspended(payload)) {
    return new AccountSuspendedError(
      "Sua conta está suspensa, por isso não é possível enviar respostas do quiz.",
    );
  }

  if (status === 401) {
    return new Error("Sua sessão expirou. Entre de novo para continuar.");
  }

  return new Error(fallback);
}

function questionsFrom(payload: unknown): QuizQuestion[] {
  if (Array.isArray(payload)) {
    return payload as QuizQuestion[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  const list = [payload.questions, payload.data, payload.items, payload.results].find(
    Array.isArray,
  );

  return Array.isArray(list) ? (list as QuizQuestion[]) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
