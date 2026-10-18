"use client";

import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { type SessionUser, useSession } from "@/components/SessionProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon } from "../ui/Icon";
import { iconButton } from "../ui/styles";
import { AccessScreen } from "./AccessScreen";
import { Brand } from "./Brand";
import { Navigation } from "./Navigation";

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut, status, user } = useSession();

  if (status === "loading") {
    return <AccessScreen state="loading" />;
  }

  if (!user) {
    return <AccessScreen state="signed-out" />;
  }

  if (user.role !== "admin") {
    return <AccessScreen state="restricted" />;
  }

  return (
    <div className="flex-1 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#admin-content"
        className="sr-only rounded-md bg-[var(--admin-accent)] px-3 py-2 text-sm font-medium text-[var(--admin-accent-ink)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50"
      >
        Pular para o conteúdo
      </a>

      <aside className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-[var(--admin-border)] bg-[var(--admin-surface)] lg:sticky lg:top-0 lg:h-svh lg:grid-cols-1 lg:grid-rows-[auto_1fr_auto] lg:items-stretch lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center px-4 lg:h-16 lg:px-5">
          <Brand />
        </div>
        <Navigation className="col-span-2 lg:col-span-1 lg:pt-2" />
        <Account
          user={user}
          onSignOut={signOut}
          className="col-start-2 row-start-1 lg:col-start-1 lg:row-start-3"
        />
      </aside>

      <main id="admin-content" tabIndex={-1} className="min-w-0 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-5">
          <Suspense>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}

function Account({
  className,
  onSignOut,
  user,
}: {
  className: string;
  onSignOut: () => void;
  user: SessionUser;
}) {
  return (
    <div
      className={`flex items-center gap-1 pr-2 lg:flex-col lg:items-stretch lg:gap-3 lg:border-t lg:border-[var(--admin-border)] lg:p-3 ${className}`}
    >
      <div className="hidden min-w-0 items-center gap-2.5 px-2 sm:flex sm:max-w-56 lg:max-w-none lg:px-1">
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--admin-accent-soft)] text-xs font-semibold text-[var(--admin-accent)]"
        >
          {initials(user.name)}
        </span>
        <p className="min-w-0 text-sm">
          <span className="sr-only">Conectado como </span>
          <span className="block truncate font-medium" title={user.name}>
            {user.name}
          </span>
          <span className="block truncate text-xs text-[var(--admin-muted)]" title={user.email}>
            {user.email}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/"
          title="Voltar ao site"
          className={`${iconButton} lg:flex lg:w-auto lg:flex-1 lg:justify-start lg:gap-2 lg:px-2.5 lg:text-sm`}
        >
          <Icon>
            <path d="m12 19-7-7 7-7M19 12H5" />
          </Icon>
          <span className="sr-only lg:not-sr-only">Voltar ao site</span>
        </Link>
        <ThemeToggle className={iconButton} />
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sair da conta"
          title="Sair da conta"
          className={iconButton}
        >
          <Icon>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </Icon>
        </button>
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`.toUpperCase();
}
