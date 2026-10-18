import type {
  GoalMetrics,
  InitiativeTypeMetrics,
  Overview,
  PlaceMetrics,
  QuestionMetrics,
  TimeSeries,
} from "./types";

export type MetricsEndpoint =
  | "overview"
  | "timeseries"
  | "ods"
  | "questions"
  | "places"
  | "initiative-types";

export class MetricsError extends Error {}

export async function fetchMetrics(
  endpoint: MetricsEndpoint,
  query: string,
  token: string,
  signal: AbortSignal,
) {
  let response: Response;

  try {
    response = await fetch(`/api/admin/metrics/${endpoint}${query ? `?${query}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }

    throw new MetricsError(
      "Sem conexão com o servidor. Verifique sua internet e tente de novo.",
    );
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new MetricsError(errorMessage(response.status, payload));
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

function errorMessage(status: number, payload: unknown) {
  const code = isRecord(payload) ? payload.code : undefined;

  if (code === "invalid_request" || status === 400) {
    return "Os filtros escolhidos não são válidos. Revise o período e tente de novo.";
  }

  if (code === "unauthorized" || status === 401) {
    return "Sua sessão expirou. Entre de novo para ver as métricas.";
  }

  if (code === "forbidden" || status === 403) {
    return "Sua conta não tem acesso às métricas do painel.";
  }

  return "Não foi possível carregar os dados agora. Tente de novo em instantes.";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function list<T>(payload: unknown, key: string): T[] {
  const value = isRecord(payload) ? payload[key] : undefined;

  return Array.isArray(value) ? (value as T[]) : [];
}

export function overviewFrom(payload: unknown) {
  const overview = payload as Partial<Overview>;

  if (!overview.users || !overview.quizzes || !overview.initiatives) {
    throw new MetricsError("A resposta do servidor veio incompleta. Tente de novo.");
  }

  return overview as Overview;
}

export function seriesFrom(payload: unknown): TimeSeries {
  return { ...(payload as TimeSeries), points: list(payload, "points") };
}

export const goalsFrom = (payload: unknown) => list<GoalMetrics>(payload, "goals");

export const questionsFrom = (payload: unknown) =>
  list<QuestionMetrics>(payload, "questions").map((question) => ({
    ...question,
    options: Array.isArray(question.options) ? question.options : [],
  }));

export const placesFrom = (payload: unknown) => list<PlaceMetrics>(payload, "places");

export const typesFrom = (payload: unknown) =>
  list<InitiativeTypeMetrics>(payload, "types");
