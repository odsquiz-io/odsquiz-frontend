"use client";

import "./metrics.css";
import { PageHeader } from "../ui/PageHeader";
import { filtersQuery } from "./filters";
import { formatPeriod } from "./format";
import { useDashboardParams } from "./hooks";
import { InitiativeTypesPanel } from "./InitiativeTypesPanel";
import { KpiRow } from "./KpiRow";
import { MetricsFilters } from "./MetricsFilters";
import { OdsPanel } from "./OdsPanel";
import { PlacesPanel } from "./PlacesPanel";
import { QuestionsPanel } from "./QuestionsPanel";
import { TimeSeriesPanel } from "./TimeSeriesPanel";

export function MetricsDashboard() {
  const { filters, view, today, setParams } = useDashboardParams();
  const query = filtersQuery(filters);

  return (
    <div className="metrics flex flex-col gap-5">
      <PageHeader
        title="Análises"
        description="Cadastros, quizzes e iniciativas em detalhe. Os filtros valem para toda a página e ficam no endereço, prontos para compartilhar."
      />

      <MetricsFilters filters={filters} today={today} onChange={setParams} />

      <KpiRow query={query} periodLabel={formatPeriod(filters.from, filters.to)} />

      <div className="grid gap-5 xl:grid-cols-12">
        <TimeSeriesPanel
          query={query}
          view={view}
          onViewChange={(changes) => setParams(changes, { replace: true })}
          className="xl:col-span-8"
        />
        <InitiativeTypesPanel query={query} className="xl:col-span-4" />
        <OdsPanel query={query} selectedOds={filters.ods} className="xl:col-span-6" />
        <PlacesPanel
          query={query}
          onFilter={({ state, city }) => setParams({ state, city })}
          className="xl:col-span-6"
        />
        <QuestionsPanel
          query={query}
          filteredByOds={Boolean(filters.ods)}
          selected={view.question}
          onSelect={(question) => setParams({ question }, { replace: true })}
          className="xl:col-span-12"
        />
      </div>
    </div>
  );
}
