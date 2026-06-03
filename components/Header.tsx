import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import headerLogo from "../public/ods-quiz-wordmark-transparent.png";

const navItems = [
  { label: "Home", href: "#" },
  { label: "Termômetro", href: "#" },
  { label: "Iniciativas", href: "#" },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 w-full px-[var(--size-header-padding-x)] pt-[var(--size-header-offset)]">
      <nav className="mx-auto flex h-[var(--size-header-nav-height)] max-w-[var(--size-header-nav-max-width)] items-center justify-between rounded-[var(--size-header-nav-radius)] border border-[var(--color-header-border)] bg-[var(--color-header-background)] px-[var(--size-header-nav-padding-x)]">
        <Link href="/" className="flex items-center" aria-label="ODSQuiz home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-[var(--size-header-link-gap)] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[length:var(--size-header-link-text)] font-semibold text-[var(--color-app-foreground)] transition hover:text-[var(--color-link-hover)]"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="#"
            className="text-[length:var(--size-header-link-text)] font-semibold text-[var(--color-app-foreground)] transition hover:text-[var(--color-link-hover)]"
          >
            Log in <span aria-hidden="true"></span>
          </Link>
        </div>

        <ThemeToggle />
      </nav>
    </header>
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
