import type { LatLngTuple } from "leaflet";
import { Marker } from "react-leaflet";
import type { Coordinates } from "../types";
import { BaseMap } from "./BaseMap";

export function LocationMap({
  coordinates,
  onChange,
}: {
  coordinates: Coordinates;
  onChange?: (coordinates: Coordinates) => void;
}) {
  const position: LatLngTuple = [coordinates.lat, coordinates.lon];

  return (
    <BaseMap center={position} zoom={16}>
      <Marker
        draggable={Boolean(onChange)}
        position={position}
        eventHandlers={{
          dragend: (event) => {
            const { lat, lng } = event.target.getLatLng();
            onChange?.({ lat, lon: lng });
          },
        }}
      />
    </BaseMap>
  );
}
