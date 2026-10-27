import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "@/components/styles";

export function ManageHint({
  children,
  href,
  label,
}: {
  children: ReactNode;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-6 text-[var(--color-muted)]">
      {children}{" "}
      <Link
        href={href}
        className={`font-bold text-[var(--color-app-foreground)] underline underline-offset-4 transition hover:text-[var(--color-link-hover)] ${focusRing}`}
      >
        {label}
      </Link>
      .
    </p>
  );
}
