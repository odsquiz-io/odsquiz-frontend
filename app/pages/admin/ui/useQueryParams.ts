"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type QueryChanges = Record<string, string | number | undefined>;

export function useQueryParams() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const hrefWith = useCallback(
    (changes: QueryChanges) => {
      const next = new URLSearchParams(params.toString());

      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      const query = next.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [params, pathname],
  );

  const setParams = useCallback(
    (changes: QueryChanges, { replace = false } = {}) => {
      const href = hrefWith(changes);

      if (replace) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [hrefWith, router],
  );

  return { params, hrefWith, setParams };
}

type Params = Pick<URLSearchParams, "get">;

export function readOption<T extends string>(
  params: Params,
  key: string,
  options: readonly T[],
): T | "" {
  const value = params.get(key) ?? "";
  return (options as readonly string[]).includes(value) ? (value as T) : "";
}

export function readPage(params: Params) {
  const page = Number(params.get("page"));
  return Number.isInteger(page) && page > 1 ? page : 1;
}
