"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useAuthToken } from "@/lib/auth";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { AdminApiError } from "./api";
import type { PageState } from "./usePage";

export type Moderation<T> = {
  title: string;
  confirmLabel: string;
  tone?: "danger";
  reason?: { label: string; hint: string };
  describe: (item: T) => ReactNode;
  done: (item: T) => string;
  run: (token: string, item: T, reason: string) => Promise<T>;
};

export function useModeration<T extends { id: string }, A extends string>(
  list: PageState<T>,
  moderations: Record<A, Moderation<T>>,
) {
  const token = useAuthToken();
  const [pending, setPending] = useState<{ item: T; action: A }>();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(""), 8000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  function start(item: T, action: A) {
    setNotice("");
    setPending({ item, action });
  }

  async function confirm(item: T, moderation: Moderation<T>, reason: string) {
    if (!token) {
      throw new Error("Sua sessão expirou. Saia e entre de novo para continuar.");
    }

    try {
      const updated = await moderation.run(token, item, reason);
      list.replaceItem(updated);
      setNotice(moderation.done(updated));
      setPending(undefined);
    } catch (error) {
      // Conflicts and missing targets mean the row changed elsewhere.
      if (error instanceof AdminApiError && (error.status === 404 || error.status === 409)) {
        list.reload();
      }

      throw error;
    }
  }

  const moderation = pending ? moderations[pending.action] : undefined;

  const dialog =
    pending && moderation ? (
      <ConfirmDialog
        title={moderation.title}
        confirmLabel={moderation.confirmLabel}
        tone={moderation.tone}
        reason={moderation.reason}
        onConfirm={(reason) => confirm(pending.item, moderation, reason)}
        onClose={() => setPending(undefined)}
      >
        {moderation.describe(pending.item)}
      </ConfirmDialog>
    ) : null;

  return { dialog, notice, start };
}
