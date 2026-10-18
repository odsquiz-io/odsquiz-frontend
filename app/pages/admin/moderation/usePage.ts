"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthToken } from "@/lib/auth";
import { fetchPage, type Page } from "./api";

type Loaded<T> = { key: string; page?: Page<T>; error?: string };

export type PageState<T> = {
  page?: Page<T>;
  error?: string;
  loading: boolean;
  reload: () => void;
  replaceItem: (item: T) => void;
};

// Keeps the previous page on screen while the next one loads, so the table never jumps.
export function usePage<T extends { id: string }>(path: string): PageState<T> {
  const token = useAuthToken();
  const [reloads, setReloads] = useState(0);
  const [loaded, setLoaded] = useState<Loaded<T>>();
  const key = `${token}|${path}|${reloads}`;

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    fetchPage<T>(token, path, controller.signal)
      .then((page) => setLoaded({ key, page }))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoaded({
            key,
            error: error instanceof Error ? error.message : "Não foi possível carregar os dados.",
          });
        }
      });

    return () => controller.abort();
  }, [key, path, token]);

  const reload = useCallback(() => setReloads((count) => count + 1), []);

  const replaceItem = useCallback((item: T) => {
    setLoaded((current) =>
      current?.page
        ? {
            ...current,
            page: {
              ...current.page,
              items: current.page.items.map((row) => (row.id === item.id ? item : row)),
            },
          }
        : current,
    );
  }, []);

  return {
    page: loaded?.error ? undefined : loaded?.page,
    error: loaded?.key === key ? loaded.error : undefined,
    loading: loaded?.key !== key,
    reload,
    replaceItem,
  };
}
