import Link from "next/link";
import type { ReactNode } from "react";
import { formatNumber } from "./format";
import { Icon } from "./Icon";
import { buttonClass } from "./styles";

export function Pagination({
  hrefFor,
  onPageChange,
  page,
  pageSize,
  total,
}: {
  hrefFor?: (page: number) => string;
  onPageChange?: (page: number) => void;
  page: number;
  pageSize: number;
  total: number;
}) {
  if (total === 0) {
    return null;
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = Math.min(total, (page - 1) * pageSize + 1);
  const last = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--admin-muted)]"
    >
      <p className="tabular-nums">
        {formatNumber(first)}–{formatNumber(last)} de {formatNumber(total)}
      </p>
      <div className="flex items-center gap-2">
        <PageLink
          label="Página anterior"
          target={page > 1 ? page - 1 : undefined}
          hrefFor={hrefFor}
          onPageChange={onPageChange}
        >
          <Icon>
            <path d="m15 18-6-6 6-6" />
          </Icon>
          Anterior
        </PageLink>
        <p className="px-1 tabular-nums">
          Página {formatNumber(page)} de {formatNumber(pages)}
        </p>
        <PageLink
          label="Próxima página"
          target={page < pages ? page + 1 : undefined}
          hrefFor={hrefFor}
          onPageChange={onPageChange}
        >
          Próxima
          <Icon>
            <path d="m9 18 6-6-6-6" />
          </Icon>
        </PageLink>
      </div>
    </nav>
  );
}

function PageLink({
  children,
  hrefFor,
  label,
  onPageChange,
  target,
}: {
  children: ReactNode;
  hrefFor?: (page: number) => string;
  label: string;
  onPageChange?: (page: number) => void;
  target?: number;
}) {
  const className = buttonClass("secondary", "sm");

  if (target !== undefined && hrefFor) {
    return (
      <Link href={hrefFor(target)} aria-label={label} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      disabled={target === undefined}
      onClick={() => target !== undefined && onPageChange?.(target)}
      className={className}
    >
      {children}
    </button>
  );
}
