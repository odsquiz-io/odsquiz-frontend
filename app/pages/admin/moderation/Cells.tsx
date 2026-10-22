import { type ReactNode, useId, useState } from "react";
import { formatDate, formatDateTime } from "../ui/format";
import type { Tone } from "../ui/StatusBadge";
import { focusRing } from "../ui/styles";

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

export function personName(person: { name: string; email: string }) {
  return person.name || person.email || "Conta removida";
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

export function Published({ createdAt, editedAt }: { createdAt: string; editedAt: string | null }) {
  return (
    <div>
      <DateTime value={createdAt} withTime />
      {editedAt ? (
        <p className="whitespace-nowrap text-xs">
          editado em <DateTime value={editedAt} withTime />
        </p>
      ) : null}
    </div>
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

// Clamps user-written text to three lines, with a toggle when it is likely to be cut.
export function LongText({ children }: { children: string }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const long = children.length > 180 || children.split("\n").length > 3;

  return (
    <div className="min-w-64 max-w-md">
      <p id={id} className={`whitespace-pre-line break-words ${expanded ? "" : "line-clamp-3"}`}>
        {children}
      </p>
      {long ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
          className={`mt-1 rounded text-xs font-medium text-[var(--admin-accent)] underline-offset-2 hover:underline ${focusRing}`}
        >
          {expanded ? "Mostrar menos" : "Mostrar tudo"}
        </button>
      ) : null}
    </div>
  );
}

export function Quote({ children, limit = 280 }: { children: string; limit?: number }) {
  const characters = Array.from(children);
  const text =
    characters.length > limit ? `${characters.slice(0, limit).join("").trimEnd()}…` : children;

  return (
    <blockquote className="mt-3 whitespace-pre-line break-words border-l-2 border-[var(--admin-control)] pl-3 text-[var(--admin-text)]">
      {text}
    </blockquote>
  );
}
