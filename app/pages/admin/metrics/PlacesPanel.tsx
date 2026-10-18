"use client";

import { useState } from "react";
import { focusRing } from "../ui/styles";
import { placesFrom } from "./api";
import { Segmented } from "./controls";
import { formatInteger } from "./format";
import { useMetrics } from "./hooks";
import { Panel } from "./Panel";
import type { PlaceMetrics } from "./types";

type Grouping = "city" | "state";
type SortKey = "users" | "submissions" | "initiatives";

const columns: { key: SortKey; label: string; scope: string }[] = [
  { key: "users", label: "Usuários", scope: "ativos hoje" },
  { key: "submissions", label: "Quizzes", scope: "no período" },
  { key: "initiatives", label: "Iniciativas", scope: "ativas hoje" },
];

const groupings: { value: Grouping; label: string }[] = [
  { value: "city", label: "Cidades" },
  { value: "state", label: "UFs" },
];

const TOP = 10;

export function PlacesPanel({
  query,
  onFilter,
  className,
}: {
  query: string;
  className?: string;
  onFilter: (place: { state: string; city: string }) => void;
}) {
  const [grouping, setGrouping] = useState<Grouping>("city");
  const [sortKey, setSortKey] = useState<SortKey>("users");
  const [expanded, setExpanded] = useState(false);
  const state = useMetrics("places", query, placesFrom);

  return (
    <Panel
      id="metrics-places"
      className={className}
      title="Por localidade"
      description="Usuários e iniciativas ativos hoje; quizzes respondidos no período."
      actions={
        <Segmented
          label="Agrupar por"
          value={grouping}
          options={groupings}
          onChange={setGrouping}
        />
      }
      state={state}
      height={480}
      isEmpty={(places) =>
        places.every((place) => !place.users && !place.submissions && !place.initiatives)
      }
      emptyMessage="Sem usuários, quizzes ou iniciativas com estes filtros."
    >
      {(places) => {
        const rows = sortRows(grouping === "state" ? byState(places) : places, sortKey);
        const visible = expanded ? rows : rows.slice(0, TOP);
        const max = Math.max(1, ...rows.map((row) => row[sortKey]));

        return (
          <div className="flex flex-1 flex-col">
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-xs">
                <caption className="sr-only">
                  {grouping === "city" ? "Cidades" : "UFs"} ordenadas por{" "}
                  {columns.find((column) => column.key === sortKey)?.label.toLowerCase()}
                </caption>
                <thead className="text-[var(--admin-muted)]">
                  <tr className="border-b border-[var(--admin-border)]">
                    <th scope="col" className="py-1.5 pr-3 font-medium">
                      {grouping === "city" ? "Cidade" : "UF"}
                    </th>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={sortKey === column.key ? "descending" : undefined}
                        className="w-[22%] py-1 pl-3 text-right font-medium"
                      >
                        <button
                          type="button"
                          onClick={() => setSortKey(column.key)}
                          className={`inline-flex flex-col items-end rounded px-1 py-0.5 hover:bg-[var(--admin-raised)] ${focusRing} ${
                            sortKey === column.key ? "text-[var(--admin-text)]" : ""
                          }`}
                        >
                          <span>
                            {column.label}
                            {sortKey === column.key ? <span aria-hidden="true"> ↓</span> : null}
                          </span>
                          <span className="text-[0.625rem] font-normal text-[var(--admin-muted)]">
                            {column.scope}
                          </span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="tabular-nums text-[var(--admin-text)]">
                  {visible.map((row) => (
                    <tr
                      key={`${row.state}|${row.city}`}
                      className="border-b border-[var(--admin-border)] last:border-0"
                    >
                      <th scope="row" className="py-2 pr-3 font-normal">
                        <PlaceName row={row} grouping={grouping} onFilter={onFilter} />
                      </th>
                      {columns.map((column) => (
                        <td key={column.key} className="py-2 pl-3 text-right align-middle">
                          <span className="block">{formatInteger(row[column.key])}</span>
                          {sortKey === column.key ? (
                            <span
                              aria-hidden="true"
                              className="mt-1 ml-auto block h-1 max-w-full rounded-full bg-[var(--mx-series)]"
                              style={{ width: `${(row[column.key] / max) * 100}%` }}
                            />
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length > TOP ? (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                className={`mt-3 self-start rounded-md px-2 py-1 text-xs font-medium text-[var(--admin-text)] underline-offset-2 hover:underline ${focusRing}`}
              >
                {expanded
                  ? "Mostrar só os 10 primeiros"
                  : `Mostrar todos (${formatInteger(rows.length)})`}
              </button>
            ) : null}
          </div>
        );
      }}
    </Panel>
  );
}

function PlaceName({
  row,
  grouping,
  onFilter,
}: {
  row: PlaceMetrics;
  grouping: Grouping;
  onFilter: (place: { state: string; city: string }) => void;
}) {
  const known = grouping === "state" ? Boolean(row.state) : Boolean(row.city && row.state);

  if (!known) {
    return (
      <span className="text-[var(--admin-muted)]">
        {grouping === "state" || !row.state ? "Sem localização" : `Cidade não informada · ${row.state}`}
      </span>
    );
  }

  const label = grouping === "state" ? row.state : `${row.city} - ${row.state}`;

  return (
    <button
      type="button"
      onClick={() => onFilter({ state: row.state, city: grouping === "state" ? "" : row.city })}
      aria-label={`Filtrar o painel por ${label}`}
      title={`Filtrar o painel por ${label}`}
      className={`rounded text-left underline-offset-2 hover:underline ${focusRing}`}
    >
      {grouping === "state" ? (
        row.state
      ) : (
        <>
          {row.city} <span className="text-[var(--admin-muted)]">{row.state}</span>
        </>
      )}
    </button>
  );
}

function byState(places: PlaceMetrics[]) {
  const totals = new Map<string, PlaceMetrics>();

  for (const place of places) {
    const current = totals.get(place.state) ?? {
      state: place.state,
      city: "",
      users: 0,
      submissions: 0,
      initiatives: 0,
    };

    current.users += place.users;
    current.submissions += place.submissions;
    current.initiatives += place.initiatives;
    totals.set(place.state, current);
  }

  return [...totals.values()];
}

function sortRows(rows: PlaceMetrics[], key: SortKey) {
  return [...rows].sort(
    (a, b) =>
      b[key] - a[key] ||
      b.users - a.users ||
      `${a.state}${a.city}`.localeCompare(`${b.state}${b.city}`, "pt-BR"),
  );
}
