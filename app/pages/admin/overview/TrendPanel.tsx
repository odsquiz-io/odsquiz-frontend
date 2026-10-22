"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { seriesFrom } from "../metrics/api";
import { formatBucket, formatCompact, formatInteger, formatTick } from "../metrics/format";
import { useMetrics } from "../metrics/hooks";
import { Panel } from "../metrics/Panel";
import type { SeriesInterval, SeriesMetric, TimeSeries } from "../metrics/types";
import { periodMetric } from "./period";

const intervalNouns: Record<SeriesInterval, string> = {
  day: "dia",
  week: "semana",
  month: "mês",
};

const partialNotes: Partial<Record<SeriesInterval, string>> = {
  week: "A primeira e a última semana podem estar incompletas.",
  month: "O último mês ainda está em andamento.",
};

const CHART_HEIGHT = 280;
// Padding + plot + the partial-bucket note, so the loaded chart fills exactly the skeleton.
export const TREND_HEIGHT = CHART_HEIGHT + 56;

export function TrendPanel({
  query,
  metric,
  interval,
  className,
}: {
  query: string;
  metric: SeriesMetric;
  interval: SeriesInterval;
  className?: string;
}) {
  const config = periodMetric(metric);
  const state = useMetrics(
    "timeseries",
    `${query}&metric=${metric}&interval=${interval}`,
    seriesFrom,
  );

  return (
    <Panel
      id="overview-trend"
      className={className}
      title="Evolução"
      description={`${config.label} por ${intervalNouns[interval]}. Escolha outro indicador nos cartões acima.`}
      state={state}
      height={TREND_HEIGHT}
      isEmpty={(series) => series.points.every((point) => point.value === 0)}
      emptyMessage={`Sem ${config.nouns[1]} no período.`}
    >
      {(series) => <TrendChart series={series} />}
    </Panel>
  );
}

// Labels follow the loaded series, so a refetch in progress never mislabels the previous one.
function TrendChart({ series: { metric, interval, points } }: { series: TimeSeries }) {
  const [one, many] = periodMetric(metric).nouns;
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const peak = points.reduce((best, point) => (point.value > best.value ? point : best), points[0]);
  const bucket = formatBucket(peak.date, interval);
  const summary = `${formatInteger(total)} ${total === 1 ? one : many} no período, com pico de ${formatInteger(peak.value)} ${interval === "week" ? `na ${bucket.toLowerCase()}` : `em ${bucket}`}.`;

  return (
    <figure className="m-0 flex flex-1 flex-col gap-2">
      <div style={{ height: CHART_HEIGHT }}>
        <AreaChart
          responsive
          data={points}
          role="img"
          aria-label={summary}
          margin={{ top: 24, right: 12, bottom: 0, left: 0 }}
          style={{ width: "100%", height: "100%" }}
        >
          <CartesianGrid vertical={false} stroke="var(--admin-border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatTick(value, interval)}
            tick={{ fill: "var(--admin-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--admin-control)" }}
            minTickGap={20}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tickFormatter={formatCompact}
            tick={{ fill: "var(--admin-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: "var(--admin-control)", strokeWidth: 1 }}
            content={({ active, payload, label }) => (
              <TrendTooltip
                active={active}
                payload={payload}
                label={label}
                interval={interval}
                noun={many}
              />
            )}
          />
          <Area
            type="linear"
            dataKey="value"
            name={many}
            stroke="var(--mx-series)"
            strokeWidth={2}
            fill="var(--mx-series)"
            fillOpacity={0.1}
            activeDot={{
              r: 4,
              fill: "var(--mx-series)",
              stroke: "var(--admin-surface)",
              strokeWidth: 2,
            }}
          />
          <ReferenceDot
            x={peak.date}
            y={peak.value}
            r={4}
            fill="var(--mx-series)"
            stroke="var(--admin-surface)"
            strokeWidth={2}
            label={{
              value: formatInteger(peak.value),
              position: "top",
              offset: 8,
              fill: "var(--admin-text)",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        </AreaChart>
      </div>

      {partialNotes[interval] ? (
        <figcaption className="text-[0.6875rem] text-[var(--admin-muted)]">
          {partialNotes[interval]}
        </figcaption>
      ) : null}

      <table className="sr-only">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Período</th>
            <th scope="col">{many.charAt(0).toUpperCase() + many.slice(1)}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <th scope="row">{formatBucket(point.date, interval)}</th>
              <td>{formatInteger(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function TrendTooltip({
  active,
  payload,
  label,
  interval,
  noun,
}: Pick<TooltipContentProps, "active" | "payload" | "label"> & {
  interval: SeriesInterval;
  noun: string;
}) {
  const value = payload?.[0]?.value;

  if (!active || typeof value !== "number" || typeof label !== "string") {
    return null;
  }

  return (
    <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-xs shadow-lg">
      <p className="text-[var(--admin-muted)]">{formatBucket(label, interval)}</p>
      <p className="mt-1 flex items-center gap-2">
        <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-[var(--mx-series)]" />
        <span className="text-sm font-semibold tabular-nums text-[var(--admin-text)]">
          {formatInteger(value)}
        </span>
        <span className="text-[var(--admin-muted)]">{noun}</span>
      </p>
    </div>
  );
}
