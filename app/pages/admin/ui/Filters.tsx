"use client";

import { type ReactNode, useEffect, useEffectEvent, useId, useState } from "react";
import { Icon } from "./Icon";
import { field, fieldLabel } from "./styles";

export type Option = { value: string; label: string };

export function FilterBar({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="search" aria-label={label} className="flex flex-wrap items-end gap-3">
      {children}
    </div>
  );
}

export function SearchInput({
  className = "sm:w-72",
  label,
  maxLength = 255,
  onSearch,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  maxLength?: number;
  onSearch: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [sent, setSent] = useState(value);
  const [seen, setSeen] = useState(value);

  // A value that did not come from typing here (back/forward, cleared filters) replaces the draft.
  if (value !== seen) {
    setSeen(value);

    if (value !== sent) {
      setSent(value);
      setDraft(value);
    }
  }

  const commit = useEffectEvent((next: string) => {
    setSent(next);
    onSearch(next);
  });

  useEffect(() => {
    const next = draft.trim();

    if (next === sent) {
      return;
    }

    const timer = window.setTimeout(() => commit(next), 400);

    return () => window.clearTimeout(timer);
  }, [draft, sent]);

  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-muted)]">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </Icon>
        <input
          id={id}
          type="search"
          value={draft}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            const next = draft.trim();

            if (event.key === "Enter" && next !== sent) {
              setSent(next);
              onSearch(next);
            }
          }}
          className={`${field} pl-8`}
        />
      </div>
    </div>
  );
}

export function SelectFilter({
  allLabel = "Todos",
  className = "sm:w-44",
  label,
  onChange,
  options,
  value,
}: {
  allLabel?: string;
  className?: string;
  label: string;
  onChange: (value: string) => void;
  options: Option[];
  value: string;
}) {
  const id = useId();

  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${field} appearance-none truncate pr-8`}
        >
          <option value="">{allLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-muted)]">
          <path d="m6 9 6 6 6-6" />
        </Icon>
      </div>
    </div>
  );
}

export function SegmentedControl({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Option[];
  value: string;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <span id={id} className={fieldLabel}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="inline-flex h-9 w-fit rounded-md border border-[var(--admin-control)] bg-[var(--admin-raised)] p-0.5"
      >
        {options.map((option) => (
          <label key={option.value} className="relative flex">
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={`flex cursor-pointer items-center whitespace-nowrap rounded px-3 text-sm text-[var(--admin-muted)] hover:text-[var(--admin-text)] peer-checked:bg-[var(--admin-accent-soft)] peer-checked:font-medium peer-checked:text-[var(--admin-accent)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-[var(--admin-accent)] motion-safe:transition-colors`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
