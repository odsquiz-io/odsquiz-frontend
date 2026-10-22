"use client";

import Link from "next/link";
import { formatInteger } from "../metrics/format";
import type { MetricsState } from "../metrics/hooks";
import { Panel } from "../metrics/Panel";
import type { Overview } from "../metrics/types";
import { type AdminAction, listPath } from "../moderation/api";
import { type PageState, usePage } from "../moderation/usePage";
import { formatDateTime } from "../ui/format";
import { Icon } from "../ui/Icon";
import { buttonClass, focusRing } from "../ui/styles";
import { TREND_HEIGHT } from "./TrendPanel";

const verbs: Record<string, string> = {
  suspend_user: "suspendeu a conta de",
  reactivate_user: "reativou a conta de",
  promote_user: "deu acesso de administrador a",
  demote_user: "removeu o acesso de administrador de",
  suspend_initiative: "suspendeu a iniciativa",
  reactivate_initiative: "reativou a iniciativa",
};

export function AttentionPanel({
  overview,
  className,
}: {
  overview: MetricsState<Overview>;
  className?: string;
}) {
  const actions = usePage<AdminAction>(listPath("actions", { page_size: 3 }));

  return (
    <Panel
      id="overview-attention"
      className={className}
      title="Precisa de atenção"
      state={overview}
      height={TREND_HEIGHT}
    >
      {({ users, initiatives }) => (
        <div className="flex flex-1 flex-col gap-4">
          {users.suspended || initiatives.suspended ? (
            <ul>
              {users.suspended ? (
                <Suspended
                  href="/admin/users?status=suspended"
                  count={users.suspended}
                  nouns={["usuário suspenso", "usuários suspensos"]}
                />
              ) : null}
              {initiatives.suspended ? (
                <Suspended
                  href="/admin/initiatives?status=suspended"
                  count={initiatives.suspended}
                  nouns={["iniciativa suspensa", "iniciativas suspensas"]}
                />
              ) : null}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
              <Icon className="size-4 text-[var(--admin-success)]">
                <path d="M20 6 9 17l-5-5" />
              </Icon>
              Tudo em ordem: nenhuma conta ou iniciativa suspensa.
            </p>
          )}

          <RecentActions list={actions} />
        </div>
      )}
    </Panel>
  );
}

function Suspended({
  href,
  count,
  nouns: [one, many],
}: {
  href: string;
  count: number;
  nouns: [string, string];
}) {
  return (
    <li>
      <Link
        href={href}
        className={`-mx-2 flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-raised)] motion-safe:transition-colors ${focusRing}`}
      >
        <Icon className="size-4 text-[var(--admin-warning)]">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </Icon>
        <span className="flex-1">
          <span className="font-semibold">{formatInteger(count)}</span> {count === 1 ? one : many}
        </span>
        <Icon className="size-4 text-[var(--admin-muted)]">
          <path d="m9 18 6-6-6-6" />
        </Icon>
      </Link>
    </li>
  );
}

function RecentActions({ list }: { list: PageState<AdminAction> }) {
  const actions = list.page?.items;

  return (
    <section
      aria-labelledby="overview-actions-title"
      className="mt-auto border-t border-[var(--admin-border)] pt-3"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3
          id="overview-actions-title"
          className="text-xs font-medium text-[var(--admin-muted)]"
        >
          Últimas ações de moderação
        </h3>
        <Link
          href="/admin/actions"
          className={`rounded text-xs font-medium text-[var(--admin-accent)] underline-offset-2 hover:underline ${focusRing}`}
        >
          Ver auditoria <span aria-hidden="true">→</span>
        </Link>
      </div>

      {list.error ? (
        <div role="alert" className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-sm text-[var(--admin-muted)]">{list.error}</p>
          <button type="button" onClick={list.reload} className={buttonClass("secondary", "sm")}>
            Tentar de novo
          </button>
        </div>
      ) : !actions ? (
        <div role="status" className="mt-2 flex flex-col gap-3 py-1">
          <span className="sr-only">Carregando ações…</span>
          {Array.from({ length: 3 }, (_, index) => (
            <span key={index} aria-hidden="true" className="flex flex-col gap-1.5">
              <span className="metrics-skeleton h-3 w-5/6" />
              <span className="metrics-skeleton h-2.5 w-1/3" />
            </span>
          ))}
        </div>
      ) : actions.length ? (
        <ol aria-busy={list.loading} className="mt-1">
          {actions.map((action) => (
            <li key={action.id} className="py-1">
              <p className="line-clamp-2 text-sm text-[var(--admin-muted)]">
                <span className="font-medium text-[var(--admin-text)]">
                  {action.admin.name || action.admin.email}
                </span>{" "}
                {verbs[action.action] ?? action.action}{" "}
                <span className="font-medium text-[var(--admin-text)]">
                  {action.target_label ?? "registro removido"}
                </span>
              </p>
              <time
                dateTime={action.created_at}
                className="block text-[0.6875rem] leading-4 text-[var(--admin-muted)]"
              >
                {formatDateTime(action.created_at)}
              </time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-[var(--admin-muted)]">
          Nenhuma ação de moderação registrada ainda.
        </p>
      )}
    </section>
  );
}
