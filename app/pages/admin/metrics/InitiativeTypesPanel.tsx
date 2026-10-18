"use client";

import { typesFrom } from "./api";
import { formatInteger, formatShare } from "./format";
import { useMetrics } from "./hooks";
import { Panel } from "./Panel";
import type { InitiativeTypeMetrics } from "./types";

const columns: { key: "initiatives" | "people_served"; label: string }[] = [
  { key: "initiatives", label: "Iniciativas" },
  { key: "people_served", label: "Pessoas atendidas" },
];

export function InitiativeTypesPanel({
  query,
  className,
}: {
  query: string;
  className?: string;
}) {
  const state = useMetrics("initiative-types", query, typesFrom);

  return (
    <Panel
      id="metrics-types"
      className={className}
      title="Iniciativas por tipo"
      description="Iniciativas ativas hoje. O período não se aplica."
      state={state}
      height={220}
      isEmpty={(types) => types.every((type) => !type.initiatives)}
      emptyMessage="Nenhuma iniciativa ativa com estes filtros."
    >
      {(types) => <TypesTable types={types} />}
    </Panel>
  );
}

function TypesTable({ types }: { types: InitiativeTypeMetrics[] }) {
  const totals = {
    initiatives: types.reduce((sum, type) => sum + type.initiatives, 0),
    people_served: types.reduce((sum, type) => sum + type.people_served, 0),
  };
  const max = {
    initiatives: Math.max(1, ...types.map((type) => type.initiatives)),
    people_served: Math.max(1, ...types.map((type) => type.people_served)),
  };

  return (
    <table className="w-full text-left text-xs">
      <caption className="sr-only">Iniciativas ativas e pessoas atendidas por tipo</caption>
      <thead className="text-[var(--admin-muted)]">
        <tr className="border-b border-[var(--admin-border)]">
          <th scope="col" className="py-1.5 pr-3 font-medium">
            Tipo
          </th>
          {columns.map((column) => (
            <th key={column.key} scope="col" className="w-[34%] py-1.5 pl-3 text-right font-medium">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="tabular-nums text-[var(--admin-text)]">
        {types.map((type) => (
          <tr key={type.type} className="border-b border-[var(--admin-border)] last:border-0">
            <th scope="row" className="py-2.5 pr-3 font-normal">
              {type.type || <span className="text-[var(--admin-muted)]">Tipo não informado</span>}
            </th>
            {columns.map((column) => (
              <td key={column.key} className="py-2.5 pl-3 text-right">
                <span className="block">
                  {formatInteger(type[column.key])}{" "}
                  <span className="text-[var(--admin-muted)]">
                    ({formatShare(type[column.key], totals[column.key])})
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 ml-auto block h-1 rounded-full bg-[var(--mx-series)]"
                  style={{ width: `${(type[column.key] / max[column.key]) * 100}%` }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
