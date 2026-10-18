import { Icon, type LatLngTuple } from "leaflet";
import type { ReactNode } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

Icon.Default.imagePath = "/leaflet/";

export function BaseMap({
  center,
  children,
  zoom,
}: {
  center: LatLngTuple;
  children: ReactNode;
  zoom: number;
}) {
  // "!" is needed because leaflet.css is not in a cascade layer.
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="isolate h-full w-full bg-[var(--color-header-background)]! font-sans!"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
