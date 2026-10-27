import { initials } from "./format";

const sizes = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
};

// Decorative: the person's name is always written next to it.
export function PersonAvatar({
  name,
  size = "sm",
}: {
  name?: string;
  size?: keyof typeof sizes;
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] font-bold text-[var(--color-muted)] ${sizes[size]}`}
    >
      {initials(name)}
    </span>
  );
}
