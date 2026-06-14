"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import headerLogo from "../public/ods-quiz-wordmark-transparent.png";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Termômetro", href: "#" },
  { label: "Iniciativas", href: "/iniciativas" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-20 w-full px-[var(--size-header-padding-x)] pt-[var(--size-header-offset)]">
      <nav className="mx-auto max-w-[var(--size-header-nav-max-width)] rounded-[var(--size-header-nav-radius)] border border-[var(--color-header-border)] bg-[var(--color-header-background)] px-[var(--size-header-nav-padding-x)]">
        <div className="flex min-h-[var(--size-header-nav-height)] items-center justify-between gap-3">
          <Link
            href="/"
            className="flex min-w-0 items-center"
            aria-label="ODSQuiz home"
            onClick={() => setIsMenuOpen(false)}
          >
            <Logo />
          </Link>

          <div className="hidden items-center gap-[var(--size-header-link-gap)] md:flex">
            <NavLinks />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
              className="grid h-[2.5rem] w-[2.5rem] place-items-center rounded-[var(--size-theme-toggle-radius)] border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] transition hover:border-[var(--color-link-hover)] hover:bg-[var(--color-theme-toggle-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-background)] md:hidden"
            >
              <span className="flex h-4 w-5 flex-col justify-between" aria-hidden="true">
                <span
                  className={`h-0.5 w-full rounded-full bg-[var(--color-app-foreground)] transition ${
                    isMenuOpen ? "translate-y-[0.44rem] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-full rounded-full bg-[var(--color-app-foreground)] transition ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-full rounded-full bg-[var(--color-app-foreground)] transition ${
                    isMenuOpen ? "-translate-y-[0.44rem] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div
            className="border-t border-[var(--color-header-border)] py-3 md:hidden"
            id="mobile-navigation"
          >
            <div className="flex flex-col">
              <NavLinks onNavigate={() => setIsMenuOpen(false)} />
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          className="rounded-md px-2 py-3 text-[length:var(--size-header-link-text)] font-semibold text-[var(--color-app-foreground)] transition hover:text-[var(--color-link-hover)] md:px-0 md:py-0"
        >
          {item.label}
        </Link>
      ))}

      <Link
        href="/login"
        onClick={onNavigate}
        className="rounded-md px-2 py-3 text-[length:var(--size-header-link-text)] font-semibold text-[var(--color-app-foreground)] transition hover:text-[var(--color-link-hover)] md:px-0 md:py-0"
      >
        Login
      </Link>
    </>
  );
}

function Logo() {
  return (
    <Image
      src={headerLogo}
      alt="ODS Quiz"
      priority
      className="h-[var(--size-header-logo-height)] w-[var(--size-header-logo-width)] object-contain [filter:var(--filter-header-logo)]"
    />
  );
}
