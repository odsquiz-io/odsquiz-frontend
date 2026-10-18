import type { ReactNode } from "react";
import { OdsBand } from "@/components/OdsBand";
import { surface } from "@/components/styles";

const mapFocusRing =
  "has-[.leaflet-container:focus-visible]:outline-2 has-[.leaflet-container:focus-visible]:outline-offset-2 has-[.leaflet-container:focus-visible]:outline-[var(--color-focus-ring)]";

export function MapFrame({
  band = false,
  children,
  className = "",
}: {
  band?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden ${surface} ${mapFocusRing} ${className}`}
    >
      {band ? (
        <OdsBand className="h-1.5 shrink-0 origin-left motion-safe:animate-[draw_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]" />
      ) : null}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function MapLoading() {
  return (
    <p className="grid h-full place-items-center text-sm text-[var(--color-muted)]">
      Carregando mapa...
    </p>
  );
}
