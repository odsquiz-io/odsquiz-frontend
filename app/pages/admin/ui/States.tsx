import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { buttonClass, panel } from "./styles";

const stateBox = `${panel} flex min-h-48 flex-col items-center justify-center gap-2 px-6 py-10 text-center`;

export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin ${className}`}
    />
  );
}

export function LoadingState({
  className = "",
  label = "Carregando...",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" className={`${stateBox} text-sm text-[var(--admin-muted)] ${className}`}>
      <Spinner className="size-5" />
      {label}
    </div>
  );
}

export function EmptyState({
  action,
  children,
  className = "",
  title,
}: {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <div className={`${stateBox} ${className}`}>
      <Icon className="size-6 text-[var(--admin-muted)]">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </Icon>
      <p className="font-medium">{title}</p>
      {children ? (
        <p className="max-w-md text-sm text-[var(--admin-muted)]">{children}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  className = "",
  message,
  onRetry,
  title,
}: {
  className?: string;
  message: string;
  onRetry?: () => void;
  title: string;
}) {
  return (
    <div role="alert" className={`${stateBox} ${className}`}>
      <Icon className="size-6 text-[var(--admin-danger)]">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </Icon>
      <p className="font-medium">{title}</p>
      <p className="max-w-md text-sm text-[var(--admin-muted)]">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={`mt-2 ${buttonClass()}`}>
          Tentar de novo
        </button>
      ) : null}
    </div>
  );
}

// Fixed so it never shifts the layout; the live region stays mounted so every new message is announced.
export function StatusMessage({ children }: { children?: ReactNode }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6"
    >
      {children ? (
        <p className="flex max-w-md items-center gap-2 rounded-md bg-[var(--admin-text)] px-3.5 py-2.5 text-sm text-[var(--admin-canvas)] shadow-lg">
          <Icon>
            <path d="M20 6 9 17l-5-5" />
          </Icon>
          {children}
        </p>
      ) : null}
    </div>
  );
}
