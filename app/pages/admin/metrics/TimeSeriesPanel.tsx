"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { seriesFrom } from "./api";
import { Segmented, TableToggle } from "./controls";
import { intervalOptions, metricOptions, type ChartView } from "./filters";
import { formatBucket, formatCompact, formatInteger, formatTick } from "./format";
import { useMetrics } from "./hooks";
import { Panel } from "./Panel";
import type { SeriesInterval, SeriesMetric, SeriesPoint } from "./types";

const metricNouns: Record<SeriesMetric, [string, string]> = {
  signups: ["cadastro", "cadastros"],
  submissions: ["quiz respondido", "quizzes respondidos"],
  initiatives: ["iniciativa criada", "iniciativas criadas"],
};

const intervalNouns: Record<SeriesInterval, string> = {
  day: "dia",
  week: "semana",
  month: "mês",
};

const CHART_HEIGHT = 240;
// Caption + gap + plot + the partial-bucket note.
const SERIES_BODY_HEIGHT = CHART_HEIGHT + 60;

export function TimeSeriesPanel({
  query,
  view,
  onViewChange,
  className,
}: {
  query: string;
  className?: string;
  view: ChartView;
  onViewChange: (changes: Partial<Record<"metric" | "interval", string>>) => void;
}) {
  const [showTable, setShowTable] = useState(false);
  const state = useMetrics(
    "timeseries",
    [query, `metric=${view.metric}`, `interval=${view.interval}`].filter(Boolean).join("&"),
    seriesFrom,
  );
  const metricLabel = metricOptions.find((option) => option.value === view.metric)?.label;

  return (
    <Panel
      id="metrics-series"
      className={className}
      title="Evolução no período"
      description={`${metricLabel} por ${intervalNouns[view.interval]}, no horário de Brasília.`}
      actions={
        <>
          <Segmented
            label="Indicador"
            value={view.metric}
            options={metricOptions}
            onChange={(metric) => onViewChange({ metric })}
          />
          <Segmented
            label="Agrupar por"
            value={view.interval}
            options={intervalOptions}
            onChange={(interval) => onViewChange({ interval })}
          />
          <TableToggle showTable={showTable} onToggle={() => setShowTable(!showTable)} />
        </>
      }
      state={state}
      height={SERIES_BODY_HEIGHT}
      isEmpty={(series) => series.points.every((point) => point.value === 0)}
      emptyMessage={`Sem ${metricNouns[view.metric][1]} no período.`}
    >
      {(series) => (
        <SeriesFigure
          points={series.points}
          metric={view.metric}
          interval={view.interval}
          showTable={showTable}
        />
      )}
    </Panel>
  );
}

function SeriesFigure({
  points,
  metric,
  interval,
  showTable,
}: {
  points: SeriesPoint[];
  metric: SeriesMetric;
  interval: SeriesInterval;
  showTable: boolean;
}) {
  const [one, many] = metricNouns[metric];
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const peak = points.reduce((best, point) => (point.value > best.value ? point : best), points[0]);
  const bucket = formatBucket(peak.date, interval);
  const peakText = `pico de ${formatInteger(peak.value)} ${interval === "week" ? `na ${bucket.toLowerCase()}` : `em ${bucket}`}`;
  const summary = `${formatInteger(total)} ${total === 1 ? one : many} no período, ${peakText}.`;

  return (
    <figure className="m-0 flex flex-1 flex-col gap-3">
      <figcaption className="text-xs text-[var(--admin-muted)]">
        <strong className="text-sm font-semibold text-[var(--admin-text)]">
          {formatInteger(total)}
        </strong>{" "}
        {total === 1 ? one : many} no período · {peakText}
      </figcaption>

      {showTable ? (
        <div className="overflow-y-auto" style={{ height: CHART_HEIGHT }}>
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{summary}</caption>
            <thead className="sticky top-0 bg-[var(--admin-surface)] text-[var(--admin-muted)]">
              <tr className="border-b border-[var(--admin-border)]">
                <th scope="col" className="py-1.5 pr-3 font-medium">
                  Período
                </th>
                <th scope="col" className="py-1.5 text-right font-medium">
                  {many.charAt(0).toUpperCase() + many.slice(1)}
                </th>
              </tr>
            </thead>
            <tbody className="tabular-nums text-[var(--admin-text)]">
              {points.map((point) => (
                <tr key={point.date} className="border-b border-[var(--admin-border)] last:border-0">
                  <th scope="row" className="py-1.5 pr-3 font-normal">
                    {formatBucket(point.date, interval)}
                  </th>
                  <td className="py-1.5 text-right">{formatInteger(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ height: CHART_HEIGHT }}>
          <AreaChart
            responsive
            data={points}
            role="img"
            aria-label={summary}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
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
              width={44}
            />
            <Tooltip
              cursor={{ stroke: "var(--admin-control)", strokeWidth: 1 }}
              content={({ active, payload, label }) => (
                <SeriesTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  interval={interval}
                  noun={many}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={many}
              stroke="var(--mx-series)"
              strokeWidth={2}
              fill="var(--mx-series)"
              fillOpacity={0.1}
              dot={points.length === 1 ? { r: 4, fill: "var(--mx-series)", strokeWidth: 0 } : false}
              activeDot={{
                r: 4,
                fill: "var(--mx-series)",
                stroke: "var(--admin-surface)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </div>
      )}

      {interval !== "day" ? (
        <p className="text-[0.6875rem] text-[var(--admin-muted)]">
          O primeiro e o último intervalo podem estar incompletos.
        </p>
      ) : null}
    </figure>
  );
}

function SeriesTooltip({
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
