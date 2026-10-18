import type { ReactNode } from "react";
import { eyebrow } from "./styles";

export function PageHeader({
  actions,
  children,
  label,
  media,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  label: string;
  media?: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className={eyebrow}>{label}</p>
        <div className="mt-4 flex items-start gap-5 sm:gap-6">
          {media}
          <div className="min-w-0">
            <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.02em] [font-stretch:80%]">
              {title}
            </h1>
            {children ? (
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-muted)]">
                {children}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
