export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]";

export const panel =
  "rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]";

export const fieldLabel = "text-xs font-medium text-[var(--admin-muted)]";

const control = `w-full rounded-md border border-[var(--admin-control)] bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] hover:border-[var(--admin-text)] ${focusRing}`;

export const field = `h-9 ${control}`;

export const textField = `resize-y py-2 leading-relaxed ${control}`;

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--admin-accent)] text-[var(--admin-accent-ink)] hover:opacity-90",
  secondary:
    "border border-[var(--admin-control)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-raised)] disabled:bg-[var(--admin-surface)]",
  danger: "bg-[var(--admin-danger)] text-[var(--admin-danger-ink)] hover:opacity-90",
  ghost:
    "text-[var(--admin-muted)] hover:bg-[var(--admin-raised)] hover:text-[var(--admin-text)] disabled:bg-transparent disabled:text-[var(--admin-muted)]",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: "md" | "sm" = "md") {
  const sizing = size === "sm" ? "h-8 gap-1.5 px-2.5 text-xs" : "h-9 gap-2 px-3.5 text-sm";

  return `inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium motion-safe:transition disabled:cursor-not-allowed disabled:opacity-50 ${sizing} ${buttonVariants[variant]} ${focusRing}`;
}

export const iconButton = `grid size-9 shrink-0 place-items-center rounded-md text-[var(--admin-muted)] hover:bg-[var(--admin-raised)] hover:text-[var(--admin-text)] motion-safe:transition-colors ${focusRing}`;
