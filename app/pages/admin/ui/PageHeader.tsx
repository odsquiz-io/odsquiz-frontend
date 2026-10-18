import type { ReactNode } from "react";

export function PageHeader({
  actions,
  description,
  title,
}: {
  actions?: ReactNode;
  description?: ReactNode;
  title: string;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--admin-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-[var(--admin-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
