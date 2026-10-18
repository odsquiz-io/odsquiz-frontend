"use client";

import { buttonClass, panel } from "../ui/styles";
import { overviewFrom } from "./api";
import { formatDecimal, formatInteger, plural } from "./format";
import { useMetrics } from "./hooks";
import type { Overview } from "./types";

type Tile = { label: string; value: string; detail: string };

function periodTiles({ users, quizzes, initiatives }: Overview): Tile[] {
  return [
    { label: "Novos cadastros", value: formatInteger(users.new), detail: "contas criadas" },
    {
      label: "Quizzes respondidos",
      value: formatInteger(quizzes.submissions),
      detail: `por ${plural(quizzes.participants, "participante", "participantes")}`,
    },
    {
      label: "Pontuação média",
      value: quizzes.submissions > 0 ? formatDecimal(quizzes.average_points) : "—",
      detail: quizzes.submissions > 0 ? "por quiz respondido" : "sem quizzes no período",
    },
    {
      label: "Novas iniciativas",
      value: formatInteger(initiatives.new),
      detail: "cadastradas",
    },
  ];
}

function currentTiles({ users, initiatives }: Overview): Tile[] {
  return [
    {
      label: "Usuários",
      value: formatInteger(users.total),
      detail: `${plural(users.active, "ativo", "ativos")} · ${plural(users.suspended, "suspenso", "suspensos")} · ${plural(users.admins, "administrador", "administradores")}`,
    },
    {
      label: "Iniciativas",
      value: formatInteger(initiatives.total),
      detail: `${plural(initiatives.active, "ativa", "ativas")} · ${plural(initiatives.suspended, "suspensa", "suspensas")}`,
    },
    {
      label: "Pessoas atendidas",
      value: formatInteger(initiatives.people_served),
      detail: "pelas iniciativas ativas",
    },
  ];
}

export function KpiRow({ query, periodLabel }: { query: string; periodLabel: string }) {
  const state = useMetrics("overview", query, overviewFrom);

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className={`${panel} flex min-h-[8.5rem] flex-col items-center justify-center gap-3 p-4 text-center`}
      >
        <p className="text-sm text-[var(--admin-text)]">{state.message}</p>
        <button
          type="button"
          onClick={state.retry}
          className={buttonClass("secondary", "sm")}
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  const overview = state.status === "ready" ? state.data : null;
  const busy = state.status === "loading" || (state.status === "ready" && state.refreshing);

  return (
    <div
      aria-busy={busy}
      className={`grid gap-3 xl:grid-cols-[4fr_3fr] ${
        state.status === "ready" && state.refreshing ? "metrics-busy" : ""
      }`}
    >
      <TileGroup
        id="metrics-kpi-period"
        title="No período"
        note={periodLabel}
        tiles={overview ? periodTiles(overview) : null}
        count={4}
        className="grid-cols-2 md:grid-cols-4"
      />
      <TileGroup
        id="metrics-kpi-current"
        title="Situação atual"
        note="O período não se aplica"
        tiles={overview ? currentTiles(overview) : null}
        count={3}
        className="grid-cols-2 md:grid-cols-3 max-md:[&>div:last-of-type]:col-span-2"
      />
    </div>
  );
}

const gridClass =
  "grid gap-px overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-border)]";
const tileClass = "flex h-[6.5rem] flex-col bg-[var(--admin-surface)] px-4 py-3";

function TileGroup({
  id,
  title,
  note,
  tiles,
  count,
  className,
}: {
  id: string;
  title: string;
  note: string;
  tiles: Tile[] | null;
  count: number;
  className: string;
}) {
  return (
    <section aria-labelledby={id} className="min-w-0">
      <h2
        id={id}
        className="mb-1.5 flex flex-wrap items-baseline gap-x-2 font-[inherit] text-xs font-semibold text-[var(--admin-text)]"
      >
        {title}
        <span className="font-normal text-[var(--admin-muted)]">{note}</span>
      </h2>
      {tiles ? (
        <dl className={`${gridClass} ${className}`}>
          {tiles.map((tile) => (
            <div key={tile.label} className={tileClass}>
              <dt className="text-xs text-[var(--admin-muted)]">{tile.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                {tile.value}
              </dd>
              <dd className="mt-auto line-clamp-2 text-[0.6875rem] leading-4 text-[var(--admin-muted)]">
                {tile.detail}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div role="status" className={`${gridClass} ${className}`}>
          <span className="sr-only">Carregando indicadores…</span>
          {Array.from({ length: count }, (_, index) => (
            <div key={index} aria-hidden="true" className={tileClass}>
              <span className="metrics-skeleton h-3 w-2/3" />
              <span className="metrics-skeleton mt-2 h-6 w-1/2" />
              <span className="metrics-skeleton mt-auto h-2.5 w-3/4" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
