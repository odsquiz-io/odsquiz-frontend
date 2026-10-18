import type { ReactNode } from "react";
import { eyebrow } from "./styles";

export function SectionHeader({
  animated = true,
  children,
  id,
  label,
  title,
}: {
  animated?: boolean;
  children?: ReactNode;
  id: string;
  label: string;
  title: string;
}) {
  return (
    <div className={animated ? "build max-w-3xl" : "max-w-3xl"}>
      <p className={eyebrow}>{label}</p>
      <h2
        id={id}
        className="mt-4 text-4xl font-extrabold leading-none tracking-[-0.01em] [font-stretch:82%] sm:text-6xl"
      >
        {title}
      </h2>
      {children ? (
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-muted)]">
          {children}
        </p>
      ) : null}
    </div>
  );
}
