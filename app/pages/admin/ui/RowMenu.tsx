"use client";

import { type KeyboardEvent, useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { focusRing, panel } from "./styles";

export type RowMenuItem = {
  label: string;
  onSelect: () => void;
  tone?: "danger";
  disabledReason?: string;
};

const GAP = 4;
const EDGE = 8;

export function RowMenu({ items, label }: { items: RowMenuItem[]; label: string }) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  function show(index: number) {
    const button = buttonRef.current;
    const menu = menuRef.current;

    if (!button || !menu) {
      return;
    }

    if (!open) {
      menu.showPopover();
      setOpen(true);
    }

    place(button, menu);
    menuItems(menu).at(index)?.focus({ preventScroll: true });
  }

  function hide(returnFocus: boolean) {
    if (returnFocus) {
      buttonRef.current?.focus();
    }

    menuRef.current?.hidePopover();
    setOpen(false);
  }

  const dismiss = useEffectEvent((event: PointerEvent) => {
    const target = event.target as Node;

    if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
      hide(false);
    }
  });

  const follow = useEffectEvent(() => {
    if (buttonRef.current && menuRef.current) {
      place(buttonRef.current, menuRef.current);
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const options = { capture: true, passive: true };

    document.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("scroll", follow, options);
    window.addEventListener("resize", follow);

    return () => {
      document.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("scroll", follow, options);
      window.removeEventListener("resize", follow);
    };
  }, [open]);

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      hide(true);
      return;
    }

    // Focus goes back to the button first, so the browser tabs on from there.
    if (event.key === "Tab") {
      hide(true);
      return;
    }

    const items = menuItems(event.currentTarget);
    const next = nextIndex(event.key, items.indexOf(event.target as HTMLElement), items.length);

    if (next !== undefined) {
      event.preventDefault();
      items[next]?.focus();
    }
  }

  return (
    <div className="flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        id={`${id}-button`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => (open ? hide(true) : show(0))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            show(event.key === "ArrowDown" ? 0 : -1);
          }
        }}
        className={`-my-1.5 grid size-8 shrink-0 place-items-center rounded-md text-[var(--admin-muted)] hover:bg-[var(--admin-border)] hover:text-[var(--admin-text)] aria-expanded:bg-[var(--admin-border)] aria-expanded:text-[var(--admin-text)] motion-safe:transition-colors ${focusRing}`}
      >
        <Icon>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </Icon>
      </button>

      {/* A popover sits in the top layer, so the table's scroll container and sticky cells never clip it. */}
      <div
        ref={menuRef}
        id={`${id}-menu`}
        popover="manual"
        role="menu"
        aria-labelledby={`${id}-button`}
        onKeyDown={onMenuKeyDown}
        className={`inset-auto m-0 w-max min-w-44 max-w-[min(18rem,calc(100vw-1rem))] p-1 text-left text-sm text-[var(--admin-text)] shadow-lg ${panel}`}
      >
        {items.map((item, index) => {
          const disabled = Boolean(item.disabledReason);
          const labelId = `${id}-label-${index}`;
          const reasonId = `${id}-reason-${index}`;

          return (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-disabled={disabled || undefined}
              aria-labelledby={labelId}
              aria-describedby={disabled ? reasonId : undefined}
              onClick={() => {
                if (!disabled) {
                  hide(true);
                  item.onSelect();
                }
              }}
              className="flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left hover:bg-[var(--admin-accent-soft)] focus:bg-[var(--admin-accent-soft)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--admin-accent)] aria-disabled:cursor-not-allowed"
            >
              <span
                id={labelId}
                className={
                  disabled
                    ? "text-[var(--admin-muted)]"
                    : item.tone === "danger"
                      ? "text-[var(--admin-danger)]"
                      : undefined
                }
              >
                {item.label}
              </span>
              {disabled ? (
                <span id={reasonId} className="text-xs text-[var(--admin-muted)]">
                  {item.disabledReason}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function menuItems(menu: HTMLElement) {
  return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

function nextIndex(key: string, current: number, count: number) {
  switch (key) {
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowUp":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
  }
}

function place(button: HTMLElement, menu: HTMLElement) {
  const anchor = button.getBoundingClientRect();
  const below = anchor.bottom + GAP;
  const above = anchor.top - GAP - menu.offsetHeight;
  const fitsBelow = below + menu.offsetHeight <= window.innerHeight - EDGE;

  menu.style.top = `${fitsBelow || above < EDGE ? below : above}px`;
  menu.style.left = `${Math.max(EDGE, anchor.right - menu.offsetWidth)}px`;
}
