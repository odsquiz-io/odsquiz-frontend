import type { ReactNode } from "react";
import { formatDate, formatDateTime } from "../ui/format";
import type { Tone } from "../ui/StatusBadge";

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
    return <span className="text-[var(--admin-muted)]">{active}</span>;
  }

  return (
    <div className="max-w-48">
      <Marker tone="danger">{suspended}</Marker>
      <p className="truncate text-xs text-[var(--admin-muted)]" title={reason ?? undefined}>
        desde <DateTime value={suspendedAt} />
        {reason ? ` · ${reason}` : null}
      </p>
    </div>
  );
}

const dots: Record<Tone, string> = {
  neutral: "bg-[var(--admin-muted)]",
  accent: "bg-[var(--admin-accent)]",
  success: "bg-[var(--admin-success)]",
  warning: "bg-[var(--admin-warning)]",
  danger: "bg-[var(--admin-danger)]",
};

export function Marker({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${dots[tone]}`} />
      {children}
    </span>
  );
}

export function Text({ children }: { children?: string | null }) {
  return children || none;
}
