import { focusRing } from "@/components/styles";

export const smallPrimaryButton = `inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-background)] transition hover:opacity-85 ${focusRing}`;

export const smallSecondaryButton = `inline-flex min-h-10 items-center justify-center rounded-md border-2 border-[var(--color-app-foreground)] px-4 text-sm font-bold transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-app-background)] ${focusRing}`;

export const quietButton = `inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-[var(--color-muted)] transition hover:bg-[var(--color-theme-toggle-background)] hover:text-[var(--color-app-foreground)] ${focusRing}`;

export const pendingButton = "aria-disabled:cursor-wait aria-disabled:opacity-70";

export const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;
