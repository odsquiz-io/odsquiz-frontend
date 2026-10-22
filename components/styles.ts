import type { CSSProperties } from "react";

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";

export const eyebrow =
  "text-sm font-bold uppercase tracking-[0.1em] text-[var(--color-link-hover)]";

export const surface =
  "rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)]";

export const loadIn =
  "motion-safe:animate-[build_1100ms_cubic-bezier(0.2,0.8,0.2,1)_both]";

export const control = `min-h-12 w-full rounded-md border bg-[var(--color-app-background)] px-4 text-base text-[var(--color-app-foreground)] transition-colors autofill:shadow-[inset_0_0_0_3rem_var(--color-app-background)] autofill:[-webkit-text-fill-color:var(--color-app-foreground)] ${focusRing}`;

export const controlBorder = (invalid: boolean) =>
  invalid
    ? "border-[var(--color-error)]"
    : "border-[var(--color-muted)] hover:border-[var(--color-app-foreground)] focus-visible:border-[var(--color-app-foreground)]";

export const selectChevron =
  "pointer-events-none absolute right-5 top-1/2 size-2 -translate-y-3/4 rotate-45 border-b-2 border-r-2 border-current";

export const primaryButton = `inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--color-app-foreground)] px-6 text-base font-bold text-[var(--color-app-background)] transition hover:opacity-85 ${focusRing}`;

export const dangerButton = `inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--color-error)] px-6 text-base font-bold text-[var(--color-app-background)] transition hover:opacity-85 ${focusRing}`;

export const secondaryButton = `inline-flex min-h-12 items-center justify-center rounded-md border-2 border-[var(--color-app-foreground)] px-6 text-base font-bold transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-app-background)] ${focusRing}`;

export const stagger = (index: number) => ({ "--i": index }) as CSSProperties;
