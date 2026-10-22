import { focusRing } from "@/components/styles";

export const panelTitle =
  "text-3xl font-extrabold leading-none tracking-[-0.01em] [font-stretch:82%] sm:text-4xl";

export const panelIntro = "mt-3 max-w-3xl leading-relaxed text-[var(--color-muted)]";

export const rowButton = `inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border-2 border-[var(--color-app-foreground)] px-4 text-sm font-bold transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-app-background)] ${focusRing}`;

export const busyButton =
  "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-wait aria-disabled:opacity-60";
