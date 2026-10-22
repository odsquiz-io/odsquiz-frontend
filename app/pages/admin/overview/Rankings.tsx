"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { findGoal } from "@/lib/ods";
import { goalsFrom, placesFrom } from "../metrics/api";
import { formatDecimal, formatInteger } from "../metrics/format";
import { useMetrics } from "../metrics/hooks";
import { Panel } from "../metrics/Panel";
import type { PlaceMetrics } from "../metrics/types";
import { Icon } from "../ui/Icon";
import { focusRing } from "../ui/styles";
import { analysisHref, type OverviewRange } from "./period";

const RANK_HEIGHT = 264;

export function GoalsRanking({
  query,
  range,
  className,
}: {
  query: string;
  range: OverviewRange;
  className?: string;
}) {
  const state = useMetrics("ods", query, goalsFrom);

  return (
    <Panel
      id="overview-ods"
      className={className}
      title="ODS: maior e menor pontuação"
      description="Pontuação média de cada ODS nos quizzes respondidos no período."
      state={state}
      height={RANK_HEIGHT}
      isEmpty={(goals) => goals.every((goal) => goal.average_points <= 0)}
      emptyMessage="Sem quizzes respondidos no período."
    >
      {(goals) => {
        // An ODS averaging 0 has no questions or only "prefer not to say" answers, so it has no data.
        const ranked = goals
          .filter((goal) => goal.average_points > 0)
          .sort((a, b) => b.average_points - a.average_points || a.ods_number - b.ods_number);
        const lowest = ranked.slice(3).slice(-3).reverse();

        const rows = (items: typeof ranked) =>
          items.map((item) => {
            const goal = findGoal(item.ods_number);

            return (
              <RankRow
                key={item.ods_number}
                href={analysisHref(range, { ods: item.ods_number })}
                marker={
                  <span
                    className="grid h-5 w-6 shrink-0 place-items-center rounded-[3px] text-[0.625rem] font-bold"
                    style={{ backgroundColor: goal?.color, color: goal?.textColor }}
                  >
                    <span className="sr-only">ODS </span>
                    {item.ods_number}
                  </span>
                }
                label={goal?.name ?? `ODS ${item.ods_number}`}
                value={formatDecimal(item.average_points)}
                unit="pontos em média"
                share={item.average_points / ranked[0].average_points}
              />
            );
          });

        return (
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <RankList title="Maiores pontuações" icon={<path d="M12 19V5M5 12l7-7 7 7" />}>
              {rows(ranked.slice(0, 3))}
            </RankList>
            {lowest.length ? (
              <RankList title="Menores pontuações" icon={<path d="M12 5v14M19 12l-7 7-7-7" />}>
                {rows(lowest)}
              </RankList>
            ) : null}
          </div>
        );
      }}
    </Panel>
  );
}

export function PlacesRanking({
  range,
  className,
}: {
  range: OverviewRange;
  className?: string;
}) {
  // Active users are counted as of today, so the period is left out and never refetches this.
  const state = useMetrics("places", "", placesFrom);
  const known = (places: PlaceMetrics[]) =>
    places.filter((place) => place.city && place.state && place.users > 0);

  return (
    <Panel
      id="overview-places"
      className={className}
      title="Onde estão"
      description="As 5 cidades com mais usuários ativos hoje."
      state={state}
      height={RANK_HEIGHT}
      isEmpty={(places) => known(places).length === 0}
      emptyMessage="Nenhum usuário ativo com cidade informada."
    >
      {(places) => {
        const top = known(places)
          .sort((a, b) => b.users - a.users || a.city.localeCompare(b.city, "pt-BR"))
          .slice(0, 5);

        return (
          <ol className="flex flex-col gap-1">
            {top.map((place) => (
              <RankRow
                key={`${place.state}|${place.city}`}
                href={analysisHref(range, { state: place.state, city: place.city })}
                label={
                  <>
                    {place.city} <span className="text-[var(--admin-muted)]">{place.state}</span>
                  </>
                }
                value={formatInteger(place.users)}
                unit={place.users === 1 ? "usuário ativo" : "usuários ativos"}
                share={place.users / top[0].users}
              />
            ))}
          </ol>
        );
      }}
    </Panel>
  );
}

function RankList({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--admin-muted)]">
        <Icon className="size-3.5">{icon}</Icon>
        {title}
      </h3>
      <ol className="flex flex-col gap-1">{children}</ol>
    </div>
  );
}

function RankRow({
  href,
  marker,
  label,
  value,
  unit,
  share,
}: {
  href: string;
  marker?: ReactNode;
  label: ReactNode;
  value: string;
  unit: string;
  share: number;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`-mx-2 flex items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-[var(--admin-raised)] motion-safe:transition-colors ${focusRing}`}
      >
        {marker}
        <span className="min-w-0 flex-1">
          <span className="block text-sm leading-5 text-[var(--admin-text)]">{label}</span>
          <span
            aria-hidden="true"
            className="mt-1.5 block h-1 rounded-full bg-[var(--mx-series)]"
            style={{ width: `${Math.max(share * 100, 2)}%` }}
          />
        </span>
        <span className="text-sm font-semibold leading-5 tabular-nums text-[var(--admin-text)]">
          {value}
          <span className="sr-only"> {unit}. Abrir em Análises</span>
        </span>
        <Icon className="mt-0.5 size-4 text-[var(--admin-muted)]">
          <path d="m9 18 6-6-6-6" />
        </Icon>
      </Link>
    </li>
  );
}
