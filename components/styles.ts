import type { CSSProperties } from "react";

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";

export const eyebrow =
  "text-sm font-bold uppercase tracking-[0.1em] text-[var(--color-link-hover)]";

export const surface =
  "rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)]";

export const loadIn =
  "motion-safe:animate-[build_1100ms_cubic-bezier(0.2,0.8,0.2,1)_both]";

export const primaryButton = `inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--color-app-foreground)] px-6 text-base font-bold text-[var(--color-app-background)] transition hover:opacity-85 ${focusRing}`;

export const secondaryButton = `inline-flex min-h-12 items-center justify-center rounded-md border-2 border-[var(--color-app-foreground)] px-6 text-base font-bold transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-app-background)] ${focusRing}`;

export const stagger = (index: number) => ({ "--i": index }) as CSSProperties;
