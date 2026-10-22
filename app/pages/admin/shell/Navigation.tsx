"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "../ui/Icon";

const items: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/admin",
    label: "Visão geral",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M8 17v-5M13 17V8M18 17v-8" />
      </>
    ),
  },
  {
    href: "/admin/analysis",
    label: "Análises",
    icon: (
      <>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </>
    ),
  },
  {
    href: "/admin/users",
    label: "Usuários",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    href: "/admin/initiatives",
    label: "Iniciativas",
    icon: (
      <>
        <path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    href: "/admin/actions",
    label: "Auditoria",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
  },
];

function isCurrent(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Painel administrativo" className={className}>
      <ul className="relative flex gap-1 overflow-x-auto px-3 pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className={`flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-[var(--admin-muted)] hover:bg-[var(--admin-raised)] hover:text-[var(--admin-text)] aria-[current=page]:bg-[var(--admin-accent-soft)] aria-[current=page]:font-medium aria-[current=page]:text-[var(--admin-accent)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--admin-accent)] motion-safe:transition-colors`}
            >
              <Icon>{item.icon}</Icon>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
