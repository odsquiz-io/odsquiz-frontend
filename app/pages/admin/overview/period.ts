import { parseFilters, rangeOptions, type RangeKey } from "../metrics/filters";
import type { Overview, SeriesInterval, SeriesMetric } from "../metrics/types";

export type OverviewRange = Exclude<RangeKey, "custom">;

export const overviewRanges = rangeOptions.filter(
  (option): option is { value: OverviewRange; label: string } => option.value !== "custom",
);

const spans: Record<OverviewRange, { length: string; interval: SeriesInterval }> = {
  "7d": { length: "7 dias", interval: "day" },
  "30d": { length: "30 dias", interval: "day" },
  "90d": { length: "90 dias", interval: "week" },
  "12m": { length: "12 meses", interval: "month" },
};

export const periodMetrics: {
  metric: SeriesMetric;
  label: string;
  nouns: [string, string];
  value: (overview: Overview) => number;
}[] = [
  {
    metric: "signups",
    label: "Novos cadastros",
    nouns: ["cadastro", "cadastros"],
    value: (overview) => overview.users.new,
  },
  {
    metric: "submissions",
    label: "Quizzes respondidos",
    nouns: ["quiz respondido", "quizzes respondidos"],
    value: (overview) => overview.quizzes.submissions,
  },
  {
    metric: "initiatives",
    label: "Novas iniciativas",
    nouns: ["iniciativa criada", "iniciativas criadas"],
    value: (overview) => overview.initiatives.new,
  },
];

export const periodMetric = (metric: SeriesMetric) =>
  periodMetrics.find((item) => item.metric === metric) ?? periodMetrics[0];

const DAY = 86_400_000;

const shift = (day: string, days: number) =>
  new Date(Date.parse(day) + days * DAY).toISOString().slice(0, 10);

// The previous period has the same number of days and ends the day before the current one starts.
export function overviewPeriod(selected: RangeKey, today: string) {
  const range: OverviewRange = selected === "custom" ? "30d" : selected;
  const { from, to } = parseFilters({ get: (name) => (name === "range" ? range : null) }, today);
  const days = (Date.parse(to) - Date.parse(from)) / DAY + 1;

  return {
    range,
    ...spans[range],
    query: `from=${from}&to=${to}`,
    previousQuery: `from=${shift(from, -days)}&to=${shift(from, -1)}`,
  };
}

export function analysisHref(range: OverviewRange, filters: Record<string, string | number> = {}) {
  const params = new URLSearchParams(range === "30d" ? {} : { range });

  for (const [key, value] of Object.entries(filters)) {
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `/admin/analysis?${query}` : "/admin/analysis";
}
