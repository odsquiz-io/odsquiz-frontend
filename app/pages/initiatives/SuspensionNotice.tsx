import { formatDate } from "../profile/format";
import type { Initiative } from "./types";

export function SuspensionNotice({
  className = "",
  initiative,
}: {
  className?: string;
  initiative: Initiative;
}) {
  if (!initiative.suspended_at) {
    return null;
  }

  const date = formatDate(initiative.suspended_at, { dateStyle: "long" });

  return (
    <div className={`border-l-4 border-[var(--color-error)] py-1 pl-3 ${className}`}>
      <p className="font-bold text-[var(--color-error)]">
        Suspensa pela moderação{date ? ` em ${date}` : ""}
      </p>
      <p className="mt-1 wrap-anywhere">
        <span className="text-[var(--color-muted)]">Motivo: </span>
        {initiative.suspension_reason || "não informado."}
      </p>
      <p className="mt-1 text-[var(--color-muted)]">
        Enquanto estiver suspensa, ela não aparece no mapa nem na lista de
        iniciativas.
      </p>
    </div>
  );
}
