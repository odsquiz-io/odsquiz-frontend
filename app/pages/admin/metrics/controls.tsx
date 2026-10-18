"use client";

import { useId, useSyncExternalStore } from "react";
import { buttonClass, fieldLabel } from "../ui/styles";

type Option<T extends string> = { value: T; label: string };

// Wraps instead of overflowing on narrow screens; "md" matches the h-9 filter fields.
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "sm",
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
}) {
  const name = useId();

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span id={`${name}label`} className={size === "md" ? fieldLabel : "sr-only"}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${name}label`}
        className="inline-flex w-fit max-w-full flex-wrap rounded-md border border-[var(--admin-control)] bg-[var(--admin-raised)] p-0.5"
      >
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className={`block cursor-pointer whitespace-nowrap rounded font-medium ${
              size === "md" ? "px-3 py-[5px] text-sm" : "px-2.5 py-[5px] text-xs"
            } text-[var(--admin-muted)] transition-colors hover:text-[var(--admin-text)] peer-checked:bg-[var(--admin-accent-soft)] peer-checked:text-[var(--admin-accent)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-[var(--admin-accent)]`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function TableToggle({
  showTable,
  onToggle,
}: {
  showTable: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={showTable}
      onClick={onToggle}
      className={`${buttonClass("secondary", "sm")} aria-pressed:border-[var(--admin-accent)] aria-pressed:bg-[var(--admin-accent-soft)] aria-pressed:text-[var(--admin-accent)]`}
    >
      Tabela
    </button>
  );
}

export function Swatch({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-2.5 shrink-0 rounded-[2px] ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);

      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
