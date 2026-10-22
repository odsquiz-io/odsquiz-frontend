// After a row leaves a list, moves focus to the row that took its place, the one
// before it, or the fallback when the list is empty, so keyboard users keep their place.
export function focusAfterRemoval(
  list: HTMLElement | null,
  index: number,
  fallback: HTMLElement | null,
) {
  const rows = list
    ? Array.from(list.querySelectorAll<HTMLElement>("[data-row-focus]"))
    : [];

  (rows[Math.min(index, rows.length - 1)] ?? fallback)?.focus();
}
