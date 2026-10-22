import { useEffect, useEffectEvent, useState } from "react";
import { fetchComments, fetchFeed, fetchInitiativePosts } from "./api";
import { useFailure } from "./hooks";
import type { Comment, Page, Post } from "./types";

type Item = { id: string; created_at: string };

type Order = "newest" | "oldest";

type Loaded<T> = { key: string; items: T[]; cursor: string | null; error: string };

type More = { key: string; pending: boolean; error: string };

export type Pages<T> = {
  status: "loading" | "error" | "ready";
  items: T[];
  error: string;
  hasMore: boolean;
  loadingMore: boolean;
  moreError: string;
  retry: () => void;
  loadMore: () => Promise<T[]>;
  add: (item: T) => void;
  change: (id: string, update: (item: T) => T) => void;
  remove: (id: string) => void;
};

export function usePostPages(token: string, initiativeId?: string) {
  return usePages<Post>({
    key: `${token}|${initiativeId ?? ""}`,
    load: (cursor) =>
      initiativeId
        ? fetchInitiativePosts(token, initiativeId, cursor)
        : fetchFeed(token, cursor),
    fallback: "Não foi possível carregar as atividades.",
    order: "newest",
  });
}

export function useCommentPages(token: string, postId: string) {
  return usePages<Comment>({
    key: `${token}|${postId}`,
    load: (cursor) => fetchComments(token, postId, cursor),
    fallback: "Não foi possível carregar os comentários.",
    order: "oldest",
  });
}

function usePages<T extends Item>({
  fallback,
  key,
  load,
  order,
}: {
  fallback: string;
  key: string;
  load: (cursor?: string) => Promise<Page<T>>;
  order: Order;
}): Pages<T> {
  const fail = useFailure();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded<T>>();
  const [more, setMore] = useState<More>();
  const requestKey = `${key}#${attempt}`;
  const current = loaded?.key === requestKey ? loaded : undefined;
  const loadingMore = more?.key === requestKey && more.pending;

  const loadFirst = useEffectEvent(async (): Promise<Loaded<T>> => {
    try {
      const page = await load();

      return {
        key: requestKey,
        items: arrange([], page.items, order),
        cursor: page.next_cursor,
        error: "",
      };
    } catch (error) {
      return { key: requestKey, items: [], cursor: null, error: fail(error, fallback) };
    }
  });

  useEffect(() => {
    let isCurrent = true;

    void loadFirst().then((next) => {
      if (isCurrent) {
        setLoaded(next);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [requestKey]);

  async function loadMore() {
    const cursor = current?.cursor;

    if (!cursor || loadingMore) {
      return [];
    }

    const at = requestKey;
    setMore({ key: at, pending: true, error: "" });

    try {
      const page = await load(cursor);

      setLoaded((state) =>
        state?.key === at
          ? { ...state, items: arrange(state.items, page.items, order), cursor: page.next_cursor }
          : state,
      );
      setMore({ key: at, pending: false, error: "" });

      return page.items;
    } catch (error) {
      setMore({
        key: at,
        pending: false,
        error: fail(error, "Não foi possível carregar mais. Tente de novo."),
      });

      return [];
    }
  }

  function update(change: (items: T[]) => T[]) {
    setLoaded((state) => state && { ...state, items: change(state.items) });
  }

  return {
    status: !current ? "loading" : current.error ? "error" : "ready",
    items: current?.items ?? [],
    error: current?.error ?? "",
    hasMore: Boolean(current?.cursor),
    loadingMore,
    moreError: more?.key === requestKey ? more.error : "",
    retry: () => setAttempt((count) => count + 1),
    loadMore,
    add: (item) => update((items) => arrange(items, [item], order)),
    change: (id, next) =>
      update((items) => items.map((existing) => (existing.id === id ? next(existing) : existing))),
    remove: (id) => update((items) => items.filter((existing) => existing.id !== id)),
  };
}

// Merges by id and keeps the API order, so items added locally never land out of place.
function arrange<T extends Item>(items: T[], incoming: T[], order: Order) {
  const ids = new Set(incoming.map((item) => item.id));
  const direction = order === "newest" ? -1 : 1;

  return [...items.filter((item) => !ids.has(item.id)), ...incoming].sort(
    (a, b) =>
      direction * (time(a.created_at) - time(b.created_at) || a.id.localeCompare(b.id)),
  );
}

function time(value: string) {
  return Date.parse(value) || 0;
}
