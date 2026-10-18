"use client";

import type { ReactNode } from "react";
import { buttonClass, panel } from "../ui/styles";
import type { MetricsState } from "./hooks";

type PanelProps<T> = {
  id: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  state: MetricsState<T>;
  // Every state renders at least this tall, so loading never shifts the layout.
  height: number;
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  className?: string;
  children: (data: T) => ReactNode;
};

export function Panel<T>({
  id,
  title,
  description,
  actions,
  state,
  height,
  isEmpty,
  emptyMessage = "Sem dados no período.",
  className = "",
  children,
}: PanelProps<T>) {
  const refreshing = state.status === "ready" && state.refreshing;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={`${panel} flex min-w-0 flex-col ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-[var(--admin-border)] px-4 py-3">
        <div className="min-w-0">
          <h2
            id={`${id}-title`}
            className="font-[inherit] text-sm font-semibold text-[var(--admin-text)]"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-[var(--admin-muted)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>

      <div
        aria-busy={state.status === "loading" || refreshing}
        className={`relative flex flex-1 flex-col p-4 ${refreshing ? "metrics-busy" : ""}`}
        style={{ minHeight: height }}
      >
        {state.status === "loading" ? (
          <PanelSkeleton />
        ) : state.status === "error" ? (
          <div
            role="alert"
            className="flex flex-1 flex-col items-center justify-center gap-3 text-center"
          >
            <p className="max-w-sm text-sm text-[var(--admin-text)]">{state.message}</p>
            <button
              type="button"
              onClick={state.retry}
              className={buttonClass("secondary", "sm")}
            >
              Tentar de novo
            </button>
          </div>
        ) : isEmpty?.(state.data) ? (
          <div className="flex flex-1 items-center justify-center text-center">
            <p className="text-sm text-[var(--admin-muted)]">{emptyMessage}</p>
          </div>
        ) : (
          children(state.data)
        )}
      </div>
    </section>
  );
}

function PanelSkeleton() {
  return (
    <div role="status" className="flex flex-1 flex-col justify-end gap-3">
      <span className="sr-only">Carregando dados…</span>
      <span aria-hidden="true" className="metrics-skeleton h-3 w-1/3" />
      <span aria-hidden="true" className="metrics-skeleton w-full flex-1" />
    </div>
  );
}
