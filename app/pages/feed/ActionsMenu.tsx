"use client";

import {
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";
import { focusRing, surface } from "@/components/styles";
import { iconProps } from "./styles";

export type MenuAction = {
  label: string;
  onSelect: () => void;
  tone?: "danger";
};

const GAP = 4;
const EDGE = 8;

export function ActionsMenu({
  actions,
  buttonRef,
  label,
  size = "md",
}: {
  actions: MenuAction[];
  buttonRef?: RefObject<HTMLButtonElement | null>;
  label: string;
  size?: "sm" | "md";
}) {
  const id = useId();
  const ownButtonRef = useRef<HTMLButtonElement>(null);
  const button = buttonRef ?? ownButtonRef;
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  function show(index: number) {
    const menu = menuRef.current;

    if (!button.current || !menu) {
      return;
    }

    if (!open) {
      menu.showPopover();
      setOpen(true);
    }

    place(button.current, menu);
    menuItems(menu).at(index)?.focus({ preventScroll: true });
  }

  function hide(returnFocus: boolean) {
    if (returnFocus) {
      button.current?.focus();
    }

    menuRef.current?.hidePopover();
    setOpen(false);
  }

  const dismiss = useEffectEvent((event: PointerEvent) => {
    const target = event.target as Node;

    if (!menuRef.current?.contains(target) && !button.current?.contains(target)) {
      hide(false);
    }
  });

  const follow = useEffectEvent(() => {
    if (button.current && menuRef.current) {
      place(button.current, menuRef.current);
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
    <>
      <button
        ref={button}
        type="button"
        id={`${id}-button`}
        aria-label={label}
        title={label}
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
        className={`grid shrink-0 place-items-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-[var(--color-theme-toggle-hover)] hover:text-[var(--color-app-foreground)] aria-expanded:bg-[var(--color-theme-toggle-hover)] aria-expanded:text-[var(--color-app-foreground)] ${
          size === "sm" ? "-my-1 -mr-2 size-8" : "-my-1 -mr-2 size-10"
        } ${focusRing}`}
      >
        <svg {...iconProps} className="size-5">
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      </button>

      {/* A popover sits in the top layer, so the fixed header and card overflow never clip it. */}
      <div
        ref={menuRef}
        id={`${id}-menu`}
        popover="manual"
        role="menu"
        aria-labelledby={`${id}-button`}
        onKeyDown={onMenuKeyDown}
        className={`inset-auto m-0 w-max min-w-40 p-1 text-left text-[var(--color-app-foreground)] shadow-lg ${surface}`}
      >
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              hide(true);
              action.onSelect();
            }}
            className={`flex min-h-10 w-full items-center rounded-md px-3 text-left font-semibold hover:bg-[var(--color-theme-toggle-background)] focus:bg-[var(--color-theme-toggle-background)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] ${
              action.tone === "danger" ? "text-[var(--color-error)]" : ""
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </>
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
