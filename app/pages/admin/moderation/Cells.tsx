import type { ReactNode } from "react";
import { formatDate, formatDateTime } from "../ui/format";
import { StatusBadge } from "../ui/StatusBadge";

export const none = <span className="text-[var(--admin-muted)]">—</span>;

export function Identity({
  badge,
  detail,
  title,
}: {
  badge?: ReactNode;
  detail?: string;
  title: string;
}) {
  return (
    <div className="min-w-36 max-w-48">
      <p className="flex items-center gap-2">
        <span className="truncate font-medium" title={title}>
          {title}
        </span>
        {badge}
      </p>
      {detail ? (
        <p className="truncate text-xs text-[var(--admin-muted)]" title={detail}>
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export function Emphasis({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-[var(--admin-text)]">{children}</strong>;
}

export function Place({ city, state }: { city: string | null; state: string | null }) {
  const place = [city, state].filter(Boolean).join(" - ");
  return place ? <span className="whitespace-nowrap">{place}</span> : none;
}

export function DateTime({ value, withTime = false }: { value: string; withTime?: boolean }) {
  return (
    <time dateTime={value} className="whitespace-nowrap">
      {withTime ? formatDateTime(value) : formatDate(value)}
    </time>
  );
}

export function Status({
  labels: [active, suspended],
  reason,
  suspendedAt,
}: {
  labels: [string, string];
  reason: string | null;
  suspendedAt: string | null;
}) {
  if (!suspendedAt) {
    return <StatusBadge tone="success">{active}</StatusBadge>;
  }

  return (
    <div className="min-w-32 max-w-56">
      <StatusBadge tone="danger">{suspended}</StatusBadge>
      <p className="mt-1 line-clamp-2 text-xs text-[var(--admin-muted)]" title={reason ?? undefined}>
        <DateTime value={suspendedAt} />
        {reason ? ` · ${reason}` : null}
      </p>
    </div>
  );
}

export function Text({ children }: { children?: string | null }) {
  return children || none;
}
