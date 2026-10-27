"use client";

import { useCallback, useId, useState } from "react";
import { focusRing } from "@/components/styles";

const clamps = {
  4: "line-clamp-4",
  6: "line-clamp-6",
  8: "line-clamp-8",
};

export function ExpandableText({
  className = "",
  lines = 6,
  text,
}: {
  className?: string;
  lines?: keyof typeof clamps;
  text: string;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  // Measured before paint and on resize, so the toggle only shows when text is cut.
  const measure = useCallback((node: HTMLParagraphElement | null) => {
    if (!node) {
      return;
    }

    const check = () => setOverflowing(node.scrollHeight > node.clientHeight + 1);
    const observer = new ResizeObserver(check);

    check();
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={className}>
      <p
        key={text}
        id={id}
        ref={expanded ? undefined : measure}
        className={`whitespace-pre-wrap leading-relaxed wrap-anywhere ${expanded ? "" : clamps[lines]}`}
      >
        {text}
      </p>
      {expanded || overflowing ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
          className={`mt-1 inline-flex min-h-6 items-center text-sm font-bold text-[var(--color-muted)] underline-offset-4 transition hover:text-[var(--color-app-foreground)] hover:underline ${focusRing}`}
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      ) : null}
    </div>
  );
}
