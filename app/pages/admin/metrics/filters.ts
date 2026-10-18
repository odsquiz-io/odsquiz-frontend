import { states } from "@/lib/cep";
import type { SeriesInterval, SeriesMetric } from "./types";

export type RangeKey = "7d" | "30d" | "90d" | "12m" | "custom";

export type MetricsFilters = {
  range: RangeKey;
  // Empty from = since the first record; empty to = today (custom range only).
  from: string;
  to: string;
  state: string;
  city: string;
  ods: number | null;
  type: string;
};

export type ChartView = {
  metric: SeriesMetric;
  interval: SeriesInterval;
  question: number | null;
};

export const rangeOptions: { value: RangeKey; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "12m", label: "12 meses" },
  { value: "custom", label: "Personalizado" },
];

export const metricOptions: { value: SeriesMetric; label: string }[] = [
  { value: "signups", label: "Cadastros" },
  { value: "submissions", label: "Quizzes" },
  { value: "initiatives", label: "Iniciativas" },
];

export const intervalOptions: { value: SeriesInterval; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
];

export const initiativeTypes = [
  "Sociedade Civil",
  "Instituição Pública",
  "Instituição Privada",
];

const DEFAULT_RANGE: RangeKey = "30d";
const presetDays: Partial<Record<RangeKey, number>> = { "7d": 7, "30d": 30, "90d": 90 };

export function todayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value;

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function toUtc(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

const toIso = (date: Date) => date.toISOString().slice(0, 10);

function isDay(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && toIso(toUtc(value)) === value);
}

function presetRange(range: RangeKey, today: string) {
  const end = toUtc(today);

  if (range === "12m") {
    // Whole calendar months, so the monthly series starts on a full bucket.
    return { from: toIso(new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11, 1))), to: today };
  }

  end.setUTCDate(end.getUTCDate() - ((presetDays[range] ?? 30) - 1));

  return { from: toIso(end), to: today };
}

type Params = { get(name: string): string | null };

export function parseFilters(params: Params, today: string): MetricsFilters {
  const rawRange = params.get("range");
  const range = rangeOptions.some((option) => option.value === rawRange)
    ? (rawRange as RangeKey)
    : DEFAULT_RANGE;

  let { from, to } = range === "custom" ? { from: "", to: "" } : presetRange(range, today);

  if (range === "custom") {
    const rawFrom = params.get("from");
    const rawTo = params.get("to");
    from = isDay(rawFrom) ? rawFrom : "";
    to = isDay(rawTo) ? rawTo : "";

    if (from && to && from > to) {
      [from, to] = [to, from];
    }
  }

  const state = (params.get("state") ?? "").toUpperCase();
  const ods = Number(params.get("ods"));

  return {
    range,
    from,
    to,
    state: states.includes(state) ? state : "",
    city: (params.get("city") ?? "").trim().slice(0, 255),
    ods: Number.isInteger(ods) && ods >= 1 && ods <= 17 ? ods : null,
    type: (params.get("type") ?? "").trim().slice(0, 255),
  };
}

export function parseView(params: Params, filters: MetricsFilters, today: string): ChartView {
  const metric = params.get("metric");
  const interval = params.get("interval");
  const question = Number(params.get("question"));

  return {
    metric: metricOptions.find((option) => option.value === metric)?.value ?? "signups",
    interval:
      intervalOptions.find((option) => option.value === interval)?.value ??
      autoInterval(filters, today),
    question: Number.isInteger(question) && question > 0 ? question : null,
  };
}

function autoInterval({ from, to }: MetricsFilters, today: string): SeriesInterval {
  if (!from) {
    return "month";
  }

  const days = (toUtc(to || today).getTime() - toUtc(from).getTime()) / 86_400_000 + 1;

  return days <= 45 ? "day" : days <= 200 ? "week" : "month";
}

export function filtersQuery(filters: MetricsFilters, extra: Record<string, string> = {}) {
  const query = new URLSearchParams();
  const entries = {
    from: filters.from,
    to: filters.to,
    state: filters.state,
    city: filters.city,
    ods: filters.ods ? String(filters.ods) : "",
    type: filters.type,
    ...extra,
  };

  for (const [key, value] of Object.entries(entries)) {
    if (value) {
      query.set(key, value);
    }
  }

  return query.toString();
}

export function hasRefinements(filters: MetricsFilters) {
  return Boolean(filters.state || filters.city || filters.ods || filters.type);
}
