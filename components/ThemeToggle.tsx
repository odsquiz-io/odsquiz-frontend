"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const storageKey = "odsquiz-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
}

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(storageKey);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const toggleTheme = () => {
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      aria-label="Toggle color mode"
      title="Toggle color mode"
      onClick={toggleTheme}
      className="grid h-[2.5rem] w-[2.5rem] place-items-center rounded-[var(--size-theme-toggle-radius)] border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] text-[1.125rem] text-[var(--color-app-foreground)] transition hover:border-[var(--color-link-hover)] hover:bg-[var(--color-theme-toggle-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-background)]"
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {theme === "dark" ? "☀" : "☾"}
      </span>
    </button>
  );
}
