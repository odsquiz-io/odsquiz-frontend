"use client";

import "../metrics/metrics.css";
import Link from "next/link";
import { overviewFrom } from "../metrics/api";
import { Segmented } from "../metrics/controls";
import { useDashboardParams, useMetrics } from "../metrics/hooks";
import { PageHeader } from "../ui/PageHeader";
import { focusRing } from "../ui/styles";
import { AttentionPanel } from "./AttentionPanel";
import { KpiCards } from "./KpiCards";
import { analysisHref, overviewPeriod, overviewRanges } from "./period";
import { GoalsRanking, PlacesRanking } from "./Rankings";
import { TrendPanel } from "./TrendPanel";

export function Overview() {
  const { filters, view, today, setParams } = useDashboardParams();
  const period = overviewPeriod(filters.range, today);
  const current = useMetrics("overview", period.query, overviewFrom);
  const previous = useMetrics("overview", period.previousQuery, overviewFrom);

  return (
    <div className="metrics flex flex-col gap-5">
      <PageHeader
        title="Visão geral"
        description={`Últimos ${period.length}, comparado aos ${period.length} anteriores.`}
        actions={
          <Segmented
            label="Período"
            size="md"
            value={period.range}
            options={overviewRanges}
            onChange={(range) =>
              setParams({
                range: range === "30d" ? undefined : range,
                from: undefined,
                to: undefined,
                interval: undefined,
              })
            }
          />
        }
      />

      <KpiCards
        current={current}
        previous={previous}
        metric={view.metric}
        length={period.length}
        onSelect={(metric) =>
          setParams({ metric: metric === "signups" ? undefined : metric }, { replace: true })
        }
      />

      <div className="grid gap-5 xl:grid-cols-12">
        <TrendPanel
          query={period.query}
          metric={view.metric}
          interval={period.interval}
          className="xl:col-span-8"
        />
        <AttentionPanel overview={current} className="xl:col-span-4" />
        <GoalsRanking query={period.query} range={period.range} className="xl:col-span-8" />
        <PlacesRanking range={period.range} className="xl:col-span-4" />
      </div>

      <Link
        href={analysisHref(period.range, view.metric === "signups" ? {} : { metric: view.metric })}
        className={`self-end rounded text-sm font-medium text-[var(--admin-accent)] underline-offset-2 hover:underline ${focusRing}`}
      >
        Ver análise completa <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
