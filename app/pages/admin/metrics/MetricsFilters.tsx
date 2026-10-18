"use client";

import { useEffect, useEffectEvent, useId, useState } from "react";
import { states } from "@/lib/cep";
import { odsGoals } from "@/lib/ods";
import { FilterBar, SelectFilter, type Option } from "../ui/Filters";
import { buttonClass, field, fieldLabel } from "../ui/styles";
import type { QueryChanges } from "../ui/useQueryParams";
import { placesFrom } from "./api";
import { Segmented } from "./controls";
import { hasRefinements, initiativeTypes, rangeOptions, type MetricsFilters as Filters } from "./filters";
import { formatPeriod } from "./format";
import { useMetrics } from "./hooks";

const stateOptions = states.map((state) => ({ value: state, label: state }));
const goalOptions = odsGoals.map((goal) => ({
  value: String(goal.number),
  label: `${goal.number} · ${goal.name}`,
}));

export function MetricsFilters({
  filters,
  today,
  onChange,
}: {
  filters: Filters;
  today: string;
  onChange: (changes: QueryChanges) => void;
}) {
  // Every known place, regardless of the other filters, feeds the city list.
  const places = useMetrics("places", "", placesFrom);
  const cityOptions = citiesFor(places.status === "ready" ? places.data : [], filters);
  const typeOptions = [...new Set([...initiativeTypes, filters.type].filter(Boolean))].map(
    (type) => ({ value: type, label: type }),
  );

  return (
    <div className="flex flex-col gap-2">
      <FilterBar label="Filtros do painel">
        <Segmented
          label="Período"
          size="md"
          value={filters.range}
          options={rangeOptions}
          onChange={(range) =>
            onChange(
              range === "custom"
                ? { range, from: filters.from, to: filters.to, interval: undefined }
                : {
                    range: range === "30d" ? undefined : range,
                    from: undefined,
                    to: undefined,
                    interval: undefined,
                  },
            )
          }
        />

        {filters.range === "custom" ? (
          <>
            <DateField
              label="De"
              value={filters.from}
              max={filters.to || today}
              onCommit={(from) => onChange({ from, interval: undefined })}
            />
            <DateField
              label="Até"
              value={filters.to}
              min={filters.from}
              max={today}
              onCommit={(to) => onChange({ to, interval: undefined })}
            />
          </>
        ) : null}

        <SelectFilter
          label="UF"
          allLabel="Todas"
          value={filters.state}
          options={stateOptions}
          onChange={(state) => onChange({ state, city: undefined })}
          className="sm:w-24"
        />
        <SelectFilter
          label="Cidade"
          allLabel="Todas"
          value={filters.city ? `${filters.state}|${filters.city}` : ""}
          options={cityOptions}
          onChange={(value) => {
            const split = value.indexOf("|");

            onChange(
              split < 0
                ? { city: undefined }
                : { state: value.slice(0, split), city: value.slice(split + 1) },
            );
          }}
          className="sm:w-52"
        />
        <SelectFilter
          label="ODS"
          allLabel="Todos"
          value={filters.ods ? String(filters.ods) : ""}
          options={goalOptions}
          onChange={(ods) => onChange({ ods, question: undefined })}
          className="sm:w-64"
        />
        <SelectFilter
          label="Tipo de iniciativa"
          allLabel="Todos"
          value={filters.type}
          options={typeOptions}
          onChange={(type) => onChange({ type })}
          className="sm:w-48"
        />

        {hasRefinements(filters) ? (
          <button
            type="button"
            onClick={() =>
              onChange({ state: undefined, city: undefined, ods: undefined, type: undefined })
            }
            className={buttonClass("ghost")}
          >
            Limpar filtros
          </button>
        ) : null}
      </FilterBar>

      <p className="text-xs text-[var(--admin-muted)]">
        Período: {formatPeriod(filters.from, filters.to)}, no horário de Brasília.
        {filters.ods || filters.type
          ? " ODS e tipo filtram só as iniciativas; o ODS também limita as perguntas do quiz."
          : ""}
      </p>
    </div>
  );
}

function citiesFor(
  places: { state: string; city: string }[],
  { state, city }: Filters,
): Option[] {
  const options = new Map<string, Option>();

  for (const place of places) {
    if (place.city && place.state && (!state || place.state === state)) {
      options.set(`${place.state}|${place.city}`, {
        value: `${place.state}|${place.city}`,
        label: state ? place.city : `${place.city} - ${place.state}`,
      });
    }
  }

  // A city that came from a shared link stays selectable even if it has no data yet.
  if (city && !options.has(`${state}|${city}`)) {
    options.set(`${state}|${city}`, {
      value: `${state}|${city}`,
      label: city,
    });
  }

  return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

// Typing a date fires a change per segment (year 0002, 0020...); commit only a settled value.
function DateField({
  label,
  value,
  min,
  max,
  onCommit,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onCommit: (value: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);

  if (value !== seen) {
    setSeen(value);
    setDraft(value);
  }

  const commit = useEffectEvent((next: string) => onCommit(next));

  useEffect(() => {
    if (draft === value || (draft && draft < "2000-01-01")) {
      return;
    }

    const timer = window.setTimeout(() => commit(draft), 500);

    return () => window.clearTimeout(timer);
  }, [draft, value]);

  return (
    <div className="flex w-full flex-col gap-1 sm:w-40">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={draft}
        min={min || undefined}
        max={max}
        onChange={(event) => setDraft(event.target.value)}
        className={field}
      />
    </div>
  );
}
