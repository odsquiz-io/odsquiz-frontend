"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import headerLogo from "../public/ods-quiz-wordmark-transparent.png";
import { OdsBand } from "./OdsBand";
import { useSession } from "./SessionProvider";
import { eyebrow, focusRing, primaryButton } from "./styles";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Quiz", href: "/quiz" },
  { label: "Iniciativas", href: "/initiatives" },
];

const iconButton = `grid size-10 shrink-0 place-items-center rounded-[var(--size-theme-toggle-radius)] border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] transition hover:border-[var(--color-link-hover)] hover:bg-[var(--color-theme-toggle-hover)] ${focusRing}`;

const barLink = `relative py-2 text-[length:var(--size-header-link-text)] font-semibold transition hover:text-[var(--color-link-hover)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-current aria-[current=page]:after:scale-x-100 motion-safe:after:transition-transform motion-safe:after:duration-300 ${focusRing}`;

const menuItemMotion =
  "motion-safe:animate-[slide_300ms_cubic-bezier(0.2,0.8,0.2,1)_both]";

function isCurrent(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
  // Tied to the pathname so any navigation closes the menu, including back/forward.
  const [menuPathname, setMenuPathname] = useState<string | null>(null);

  if (menuPathname !== null && menuPathname !== pathname) {
    setMenuPathname(null);
  }

  const isMenuOpen = menuPathname === pathname;
  const closeMenu = () => setMenuPathname(null);

  return (
    <header className="absolute inset-x-0 top-0 z-20 w-full px-[var(--size-header-padding-x)] pt-[var(--size-header-offset)]">
      <nav
        aria-label="Principal"
        onKeyDown={(event) => {
          if (event.key === "Escape" && isMenuOpen) {
            closeMenu();
            menuButton.current?.focus();
          }
        }}
        className="relative mx-auto max-w-[var(--size-header-nav-max-width)] overflow-hidden rounded-[var(--size-header-nav-radius)] border border-[var(--color-header-border)] bg-[var(--color-header-background)] px-[var(--size-header-nav-padding-x)] text-[var(--color-app-foreground)]"
      >
        <OdsBand className="absolute inset-x-0 top-0 h-1" />

        <div className="flex min-h-[var(--size-header-nav-height)] items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">
          <Link
            href="/"
            aria-label="ODS Quiz, página inicial"
            onClick={closeMenu}
            className={`flex min-w-0 items-center justify-self-start rounded-sm ${focusRing}`}
          >
            <Logo />
          </Link>

          <ul className="hidden items-center gap-[var(--size-header-link-gap)] md:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className={barLink}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2 justify-self-end">
            <div className="hidden md:flex">
              <AuthArea pathname={pathname} />
            </div>
            <ThemeToggle className={iconButton} />
            <button
              ref={menuButton}
              type="button"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuPathname(isMenuOpen ? null : pathname)}
              className={`${iconButton} md:hidden`}
            >
              <span className="flex h-4 w-5 flex-col justify-between" aria-hidden="true">
                <span
                  className={`h-0.5 w-full rounded-full bg-current motion-safe:transition ${
                    isMenuOpen ? "translate-y-[0.44rem] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-full rounded-full bg-current motion-safe:transition ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-full rounded-full bg-current motion-safe:transition ${
                    isMenuOpen ? "-translate-y-[0.44rem] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          hidden={!isMenuOpen}
          className="border-t border-[var(--color-header-border)] pb-4 md:hidden"
        >
          <ul>
            {navItems.map((item, index) => {
              const current = isCurrent(pathname, item.href);

              return (
                <li
                  key={item.href}
                  className={`border-b border-[var(--color-header-border)] ${menuItemMotion}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={current ? "page" : undefined}
                    className={`grid grid-cols-[2rem_1fr] items-baseline-last py-4 transition hover:text-[var(--color-link-hover)] ${focusRing}`}
                  >
                    <span
                      aria-hidden="true"
                      className="font-display text-sm font-extrabold tabular-nums text-[var(--color-muted)]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      {current ? (
                        <span aria-hidden="true" className={`mb-1.5 block ${eyebrow}`}>
                          Você está aqui
                        </span>
                      ) : null}
                      <span className="block font-display text-3xl font-extrabold leading-none tracking-[-0.01em] [font-stretch:85%]">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div
            className={`mt-4 ${menuItemMotion}`}
            style={{ animationDelay: `${navItems.length * 50}ms` }}
          >
            <AuthArea pathname={pathname} onNavigate={closeMenu} inMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}

function AuthArea({
  inMenu = false,
  onNavigate,
  pathname,
}: {
  inMenu?: boolean;
  onNavigate?: () => void;
  pathname: string;
}) {
  const { status, user, signOut } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        aria-current={pathname === "/login" ? "page" : undefined}
        className={inMenu ? `w-full ${primaryButton}` : barLink}
      >
        Faça seu login
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span
        title={user.name}
        className="min-w-0 truncate text-[length:var(--size-header-link-text)] font-semibold md:max-w-[8rem] lg:max-w-[12rem]"
      >
        Olá, {user.name}!
      </span>

      <button
        type="button"
        onClick={() => {
          signOut();
          onNavigate?.();
        }}
        aria-label="Sair da conta"
        title="Sair da conta"
        className={iconButton}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4.5"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}

function Logo() {
  return (
    <Image
      src={headerLogo}
      alt="ODS Quiz"
      preload
      sizes="96px"
      className="h-[var(--size-header-logo-height)] w-[var(--size-header-logo-width)] object-contain [filter:var(--filter-header-logo)]"
    />
  );
}
