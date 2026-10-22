"use client";

import { useId } from "react";
import { formatInteger, formatShare, plural } from "../metrics/format";
import type { MetricsState } from "../metrics/hooks";
import type { Overview, SeriesMetric } from "../metrics/types";
import { Icon } from "../ui/Icon";
import { buttonClass } from "../ui/styles";
import { periodMetrics } from "./period";

const card =
  "flex min-h-[6.75rem] flex-1 flex-col rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3";
const grid = "grid gap-3 sm:grid-cols-2 xl:grid-cols-4";

export function KpiCards({
  current,
  previous,
  metric,
  length,
  onSelect,
}: {
  current: MetricsState<Overview>;
  previous: MetricsState<Overview>;
  metric: SeriesMetric;
  length: string;
  onSelect: (metric: SeriesMetric) => void;
}) {
  const name = useId();
  const failed = [current, previous].filter((state) => state.status === "error");

  return (
    <section aria-labelledby={`${name}title`}>
      <h2 id={`${name}title`} className="sr-only">
        Indicadores
      </h2>

      {failed.length ? (
        <div
          role="alert"
          className={`${card} items-center justify-center gap-3 text-center`}
        >
          <p className="text-sm text-[var(--admin-text)]">{failed[0].message}</p>
          <button
            type="button"
            onClick={() => failed.forEach((state) => state.retry())}
            className={buttonClass("secondary", "sm")}
          >
            Tentar de novo
          </button>
        </div>
      ) : current.status !== "ready" || previous.status !== "ready" ? (
        <div role="status" className={grid}>
          <span className="sr-only">Carregando indicadores…</span>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} aria-hidden="true" className={card}>
              <span className="metrics-skeleton h-3 w-1/2" />
              <span className="metrics-skeleton mt-2 h-8 w-2/3" />
              <span className="metrics-skeleton mt-auto h-2.5 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div
          aria-busy={current.refreshing || previous.refreshing}
          className={`${grid} ${current.refreshing || previous.refreshing ? "metrics-busy" : ""}`}
        >
          {periodMetrics.map((item) => {
            const value = item.value(current.data);
            const before = item.value(previous.data);
            const checked = item.metric === metric;

            return (
              <label key={item.metric} className="relative flex min-w-0">
                <input
                  type="radio"
                  name={name}
                  value={item.metric}
                  checked={checked}
                  onChange={() => onSelect(item.metric)}
                  className="peer sr-only"
                />
                <span
                  className={`${card} cursor-pointer hover:bg-[var(--admin-raised)] peer-checked:border-[var(--admin-accent)] peer-checked:shadow-[inset_0_0_0_1px_var(--admin-accent)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--admin-accent)] motion-safe:transition-colors`}
                >
                  <span className="flex items-center justify-between gap-2 text-xs text-[var(--admin-muted)]">
                    {item.label}
                    {checked ? (
                      <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
                        <span className="h-0.5 w-3 rounded-full bg-[var(--mx-series)]" />
                        no gráfico
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                      {formatInteger(value)}
                    </span>
                    <Delta value={value} before={before} />
                  </span>
                  <span className="mt-auto pt-1 text-[0.6875rem] leading-4 text-[var(--admin-muted)]">
                    {formatInteger(before)} nos {length} anteriores
                  </span>
                </span>
              </label>
            );
          })}

          <div className={card}>
            <p className="text-xs text-[var(--admin-muted)]">Pessoas atendidas</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
              <span className="text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                {formatInteger(current.data.initiatives.people_served)}
              </span>
              <span className="text-xs text-[var(--admin-muted)]">hoje</span>
            </p>
            <p className="mt-auto pt-1 text-[0.6875rem] leading-4 text-[var(--admin-muted)]">
              em {plural(current.data.initiatives.active, "iniciativa ativa", "iniciativas ativas")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

const trends = {
  up: {
    words: "Aumento de",
    tone: "bg-[var(--admin-success-soft)] text-[var(--admin-success)]",
    icon: <path d="M12 19V5M5 12l7-7 7 7" />,
  },
  down: {
    words: "Queda de",
    tone: "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]",
    icon: <path d="M12 5v14M19 12l-7 7-7-7" />,
  },
  flat: {
    words: "Sem variação:",
    tone: "bg-[var(--admin-raised)] text-[var(--admin-muted)]",
    icon: <path d="M5 12h14" />,
  },
};

// With nothing in the previous period a percentage is undefined, so the change shows as a count.
function Delta({ value, before }: { value: number; before: number }) {
  const change = value - before;
  const trend = trends[change > 0 ? "up" : change < 0 ? "down" : "flat"];
  const amount =
    before > 0 || change === 0
      ? formatShare(Math.abs(change), before)
      : `+${formatInteger(change)}`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${trend.tone}`}
    >
      <Icon className="size-3">{trend.icon}</Icon>
      <span className="sr-only">{trend.words} </span>
      {amount}
    </span>
  );
}
