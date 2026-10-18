"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type YAxisTickContentProps,
} from "recharts";
import { findGoal, odsGoals, type OdsGoal } from "@/lib/ods";
import { goalsFrom } from "./api";
import { Segmented, TableToggle, useMediaQuery } from "./controls";
import { formatDecimal, formatInteger, formatShare } from "./format";
import { useMetrics } from "./hooks";
import { Panel } from "./Panel";
import type { GoalMetrics } from "./types";

type Measure = "average_points" | "top_count" | "initiatives" | "people_served";

const measures: {
  value: Measure;
  label: string;
  description: string;
  empty: string;
  noun: string;
  format: (value: number) => string;
}[] = [
  {
    value: "average_points",
    label: "Pontuação média",
    description: "Média de pontos de cada ODS nos quizzes respondidos no período.",
    empty: "Sem quizzes respondidos no período.",
    noun: "pontos em média",
    format: formatDecimal,
  },
  {
    value: "top_count",
    label: "Maior afinidade",
    description: "Quizzes do período em que o ODS teve a maior pontuação.",
    empty: "Sem quizzes respondidos no período.",
    noun: "quizzes",
    format: formatInteger,
  },
  {
    value: "initiatives",
    label: "Iniciativas",
    description: "Iniciativas ativas hoje, pelo ODS principal. O período não se aplica.",
    empty: "Nenhuma iniciativa ativa com estes filtros.",
    noun: "iniciativas",
    format: formatInteger,
  },
  {
    value: "people_served",
    label: "Pessoas atendidas",
    description: "Pessoas atendidas hoje pelas iniciativas ativas de cada ODS. O período não se aplica.",
    empty: "Nenhuma iniciativa ativa com estes filtros.",
    noun: "pessoas",
    format: formatInteger,
  },
];

type GoalRow = GoalMetrics & { goal: OdsGoal; value: number };

const ROW_HEIGHT = 26;
const CHART_HEIGHT = ROW_HEIGHT * odsGoals.length + 8;
// Two-line caption + gap + plot, so the loaded chart fills exactly the skeleton.
const BODY_HEIGHT = CHART_HEIGHT + 44;
const AXIS_WIDE = 212;
const AXIS_NARROW = 34;

export function OdsPanel({
  query,
  selectedOds,
  className,
}: {
  query: string;
  selectedOds: number | null;
  className?: string;
}) {
  const [measure, setMeasure] = useState<Measure>("average_points");
  const [showTable, setShowTable] = useState(false);
  const state = useMetrics("ods", query, goalsFrom);
  const config = measures.find((item) => item.value === measure) ?? measures[0];

  return (
    <Panel
      id="metrics-ods"
      className={className}
      title="Indicadores por ODS"
      description={config.description}
      actions={
        <>
          <Segmented
            label="Medida"
            value={measure}
            options={measures}
            onChange={setMeasure}
          />
          <TableToggle showTable={showTable} onToggle={() => setShowTable(!showTable)} />
        </>
      }
      state={state}
      height={BODY_HEIGHT}
      isEmpty={(goals) => goals.every((goal) => !goal[measure])}
      emptyMessage={config.empty}
    >
      {(goals) => {
        const rows = goalRows(goals, measure);

        return showTable ? (
          <GoalTable rows={rows} />
        ) : (
          <GoalChart rows={rows} config={config} selectedOds={selectedOds} />
        );
      }}
    </Panel>
  );
}

function goalRows(goals: GoalMetrics[], measure: Measure): GoalRow[] {
  const byNumber = new Map(goals.map((goal) => [goal.ods_number, goal]));

  return odsGoals.map((goal) => {
    const metrics = byNumber.get(goal.number) ?? {
      ods_number: goal.number,
      average_points: 0,
      top_count: 0,
      initiatives: 0,
      people_served: 0,
    };

    return { ...metrics, goal, value: metrics[measure] };
  });
}

function GoalChart({
  rows,
  config,
  selectedOds,
}: {
  rows: GoalRow[];
  config: (typeof measures)[number];
  selectedOds: number | null;
}) {
  const wide = useMediaQuery("(min-width: 640px)");
  const leader = rows.reduce((best, row) => (row.value > best.value ? row : best), rows[0]);
  const totalTop = rows.reduce((sum, row) => sum + row.top_count, 0);
  const leaderText =
    config.value === "top_count"
      ? `ODS ${leader.goal.number}, ${leader.goal.name}, tem a maior afinidade em ${formatShare(leader.top_count, totalTop)} dos quizzes com afinidade definida.`
      : `Maior valor: ODS ${leader.goal.number}, ${leader.goal.name}, com ${config.format(leader.value)} ${config.noun}.`;

  return (
    <figure className="m-0 flex flex-col gap-3">
      <figcaption className="min-h-8 text-xs text-[var(--admin-muted)]">
        {leaderText}
        {selectedOds ? ` ODS ${selectedOds} em destaque pelo filtro.` : ""}
      </figcaption>
      <div style={{ height: CHART_HEIGHT }}>
        <BarChart
          responsive
          layout="vertical"
          data={rows}
          role="img"
          aria-label={`${config.label} por ODS. ${leaderText}`}
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          barCategoryGap={6}
          style={{ width: "100%", height: "100%" }}
        >
          <XAxis
            type="number"
            hide
            domain={[0, (max: number) => (max > 0 ? max * 1.18 : 1)]}
          />
          <YAxis
            type="category"
            dataKey="ods_number"
            width={wide ? AXIS_WIDE : AXIS_NARROW}
            tickLine={false}
            tickSize={0}
            tickMargin={0}
            axisLine={{ stroke: "var(--admin-control)" }}
            interval={0}
            tick={(props: YAxisTickContentProps) => (
              <GoalTick {...props} width={wide ? AXIS_WIDE : AXIS_NARROW} wide={wide} />
            )}
          />
          <Tooltip
            cursor={{ fill: "var(--admin-raised)" }}
            content={({ active, payload }) => (
              <GoalTooltip active={active} payload={payload} measure={config.value} />
            )}
          />
          <Bar
            dataKey="value"
            name={config.label}
            maxBarSize={14}
            radius={[0, 4, 4, 0]}
          >
            {rows.map((row) => (
              <Cell
                key={row.goal.number}
                fill={row.goal.color}
                fillOpacity={selectedOds && selectedOds !== row.goal.number ? 0.3 : 1}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              offset={6}
              formatter={(value) => (typeof value === "number" ? config.format(value) : value)}
              fill="var(--admin-text)"
              fontSize={11}
              className="tabular-nums"
            />
          </Bar>
        </BarChart>
      </div>
    </figure>
  );
}

function GoalTick({
  x,
  y,
  payload,
  width,
  wide,
}: YAxisTickContentProps & { width: number; wide: boolean }) {
  const goal = findGoal(Number(payload.value));

  if (!goal) {
    return null;
  }

  // With no tick line or margin, x is the axis line; the chip starts at the axis' left edge.
  const left = Number(x) - width + 2;
  const name = goal.name.length > 28 ? `${goal.name.slice(0, 27).trimEnd()}…` : goal.name;

  return (
    <g transform={`translate(${left},${Number(y)})`}>
      <title>{`ODS ${goal.number}: ${goal.name}`}</title>
      <rect x={0} y={-9} width={24} height={18} rx={3} fill={goal.color} />
      <text
        x={12}
        y={0}
        dy="0.35em"
        textAnchor="middle"
        fill={goal.textColor}
        fontSize={10}
        fontWeight={700}
      >
        {goal.number}
      </text>
      {wide ? (
        <text x={32} y={0} dy="0.35em" fill="var(--admin-text)" fontSize={11}>
          {name}
        </text>
      ) : null}
    </g>
  );
}

function GoalTooltip({
  active,
  payload,
  measure,
}: Pick<TooltipContentProps, "active" | "payload"> & { measure: Measure }) {
  const row = payload?.[0]?.payload as GoalRow | undefined;

  if (!active || !row) {
    return null;
  }

  return (
    <div className="max-w-64 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-xs shadow-lg">
      <p className="flex items-start gap-2 text-[var(--admin-text)]">
        <span
          aria-hidden="true"
          className="mt-0.5 h-0.5 w-3 shrink-0 translate-y-1.5 rounded-full"
          style={{ backgroundColor: row.goal.color }}
        />
        <span>
          <span className="font-semibold">ODS {row.goal.number}</span> · {row.goal.name}
        </span>
      </p>
      <dl className="mt-2 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
        {measures.map((item) => (
          <div key={item.value} className="contents">
            <dt
              className={
                item.value === measure ? "text-[var(--admin-text)]" : "text-[var(--admin-muted)]"
              }
            >
              {item.label}
            </dt>
            <dd
              className={`text-right tabular-nums ${
                item.value === measure
                  ? "font-semibold text-[var(--admin-text)]"
                  : "text-[var(--admin-muted)]"
              }`}
            >
              {item.format(row[item.value])}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function GoalTable({ rows }: { rows: GoalRow[] }) {
  const totalTop = rows.reduce((sum, row) => sum + row.top_count, 0);

  return (
    <div className="overflow-auto" style={{ height: BODY_HEIGHT }}>
      <table className="w-full min-w-[34rem] text-left text-xs">
        <caption className="sr-only">Indicadores por ODS</caption>
        <thead className="sticky top-0 bg-[var(--admin-surface)] text-[var(--admin-muted)]">
          <tr className="border-b border-[var(--admin-border)]">
            <th scope="col" className="py-1.5 pr-3 font-medium">
              ODS
            </th>
            <th scope="col" className="py-1.5 pr-3 text-right font-medium">
              Pontuação média
            </th>
            <th scope="col" className="py-1.5 pr-3 text-right font-medium">
              Maior afinidade
            </th>
            <th scope="col" className="py-1.5 pr-3 text-right font-medium">
              Iniciativas
            </th>
            <th scope="col" className="py-1.5 text-right font-medium">
              Pessoas atendidas
            </th>
          </tr>
        </thead>
        <tbody className="tabular-nums text-[var(--admin-text)]">
          {rows.map((row) => (
            <tr key={row.goal.number} className="border-b border-[var(--admin-border)] last:border-0">
              <th scope="row" className="py-1.5 pr-3 font-normal">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block size-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: row.goal.color }}
                  />
                  <span>
                    <span className="font-medium">{row.goal.number}</span> · {row.goal.name}
                  </span>
                </span>
              </th>
              <td className="py-1.5 pr-3 text-right">{formatDecimal(row.average_points)}</td>
              <td className="py-1.5 pr-3 text-right">
                {formatInteger(row.top_count)}{" "}
                <span className="text-[var(--admin-muted)]">
                  ({formatShare(row.top_count, totalTop)})
                </span>
              </td>
              <td className="py-1.5 pr-3 text-right">{formatInteger(row.initiatives)}</td>
              <td className="py-1.5 text-right">{formatInteger(row.people_served)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
