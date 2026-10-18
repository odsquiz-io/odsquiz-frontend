"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthToken } from "@/lib/auth";
import { useQueryParams } from "../ui/useQueryParams";
import { fetchMetrics, MetricsError, type MetricsEndpoint } from "./api";
import { parseFilters, parseView, todayInSaoPaulo } from "./filters";

export function useDashboardParams() {
  const { params, setParams } = useQueryParams();
  const [today] = useState(todayInSaoPaulo);

  const filters = useMemo(() => parseFilters(params, today), [params, today]);
  const view = useMemo(() => parseView(params, filters, today), [params, filters, today]);

  return { filters, view, today, setParams };
}

export type MetricsState<T> =
  | { status: "loading" }
  | { status: "error"; message: string; retry: () => void }
  | { status: "ready"; data: T; refreshing: boolean };

type Snapshot<T> = { key: string; data?: T; error?: string };

export function useMetrics<T>(
  endpoint: MetricsEndpoint,
  query: string,
  parse: (payload: unknown) => T,
): MetricsState<T> {
  const token = useAuthToken();
  const [attempt, setAttempt] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot<T>>();
  const key = `${endpoint}?${query}#${attempt}`;

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    fetchMetrics(endpoint, query, token, controller.signal)
      .then((payload) => setSnapshot({ key, data: parse(payload) }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setSnapshot((previous) => ({
          key,
          data: previous?.data,
          error:
            error instanceof MetricsError
              ? error.message
              : "Não foi possível exibir estes dados. Tente de novo.",
        }));
      });

    return () => controller.abort();
  }, [endpoint, key, parse, query, token]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  if (snapshot?.key === key && snapshot.error) {
    return { status: "error", message: snapshot.error, retry };
  }

  if (snapshot?.data !== undefined) {
    // Holds the previous render while a new slice loads, so nothing jumps.
    return { status: "ready", data: snapshot.data, refreshing: snapshot.key !== key };
  }

  return { status: "loading" };
}
