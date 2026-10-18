"use client";

const storageKey = "odsquiz-theme";

function toggleTheme() {
  const root = document.documentElement;
  const theme = root.dataset.theme === "light" ? "dark" : "light";

  root.dataset.theme = theme;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");

  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Storage can be blocked; the choice still holds until the next page load.
  }
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Alternar tema"
      title="Alternar tema"
      onClick={toggleTheme}
      className={className}
    >
      <svg
        {...iconProps}
        className="size-4.5 [:root[data-theme=light]_&]:hidden"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      <svg
        {...iconProps}
        className="hidden size-4.5 [:root[data-theme=light]_&]:block"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
