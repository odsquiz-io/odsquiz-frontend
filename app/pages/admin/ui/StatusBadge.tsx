import type { ReactNode } from "react";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral:
    "border border-[var(--admin-border)] bg-[var(--admin-raised)] text-[var(--admin-muted)]",
  accent: "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]",
  success: "bg-[var(--admin-success-soft)] text-[var(--admin-success)]",
  warning: "bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]",
  danger: "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]",
};

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-xs font-medium ${tones[tone]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
