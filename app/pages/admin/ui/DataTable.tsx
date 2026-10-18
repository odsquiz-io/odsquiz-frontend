import type { ReactNode } from "react";
import { focusRing, panel } from "./styles";

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "start" | "end";
  className?: string;
  rowHeader?: boolean;
  sticky?: boolean;
};

export function DataTable<T>({
  busy = false,
  caption,
  columns,
  rowKey,
  rows,
}: {
  busy?: boolean;
  caption: string;
  columns: Column<T>[];
  rowKey: (row: T) => string;
  rows: T[];
}) {
  return (
    // Focusable so keyboard users can scroll a table wider than the screen.
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className={`relative overflow-x-auto ${panel} ${focusRing}`}
    >
      <table aria-busy={busy || undefined} className="w-full border-collapse text-sm tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--admin-raised)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`h-9 whitespace-nowrap px-3 text-xs font-medium text-[var(--admin-muted)] first:pl-4 last:pr-4 ${alignment(column)} ${column.sticky ? `${stickyEnd} md:bg-[var(--admin-raised)]` : ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={busy ? "opacity-60 motion-safe:transition-opacity" : undefined}>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-t border-[var(--admin-border)] bg-[var(--admin-surface)] hover:bg-[var(--admin-raised)]"
            >
              {columns.map((column) => {
                const className = `px-3 py-2.5 align-top font-normal first:pl-4 last:pr-4 ${alignment(column)} ${column.sticky ? `${stickyEnd} md:bg-inherit` : ""} ${column.className ?? ""}`;

                return column.rowHeader ? (
                  <th key={column.key} scope="row" className={className}>
                    {column.cell(row)}
                  </th>
                ) : (
                  <td key={column.key} className={className}>
                    {column.cell(row)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Keeps the actions in view while the rest of a wide table scrolls.
const stickyEnd = "md:sticky md:right-0 md:shadow-[-1px_0_0_var(--admin-border)]";

function alignment<T>(column: Column<T>) {
  return column.align === "end" ? "text-right" : "text-left";
}
