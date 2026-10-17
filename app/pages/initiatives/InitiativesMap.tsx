import { Icon, type LatLngTuple } from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { InitiativeLinks } from "./InitiativeLinks";
import type { Coordinates, Initiative } from "./types";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

type LocatedInitiative = Initiative & Coordinates;

const brazilCenter: LatLngTuple = [-14.235, -51.9253];

const mapClassName =
  "isolate h-full w-full rounded-lg border border-[var(--color-header-border)] shadow-2xl shadow-black/20";

Icon.Default.imagePath = "/leaflet/";

export function InitiativesMap({ initiatives }: { initiatives: Initiative[] }) {
  const located = useMemo(() => initiatives.filter(isLocated), [initiatives]);

  return (
    <MapContainer center={brazilCenter} zoom={4} className={mapClassName}>
      <OpenStreetMapTiles />
      <FitBounds initiatives={located} />
      <MarkerClusterGroup>
        {located.map((initiative) => (
          <Marker key={initiative.id} position={[initiative.lat, initiative.lon]}>
            <Popup>
              <strong>{initiative.name}</strong>
              <br />
              {initiative.address}
              <InitiativeLinks id={initiative.id} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

export function LocationMap({
  coordinates,
  onChange,
}: {
  coordinates: Coordinates;
  onChange?: (coordinates: Coordinates) => void;
}) {
  const position: LatLngTuple = [coordinates.lat, coordinates.lon];

  return (
    <MapContainer center={position} zoom={16} className={mapClassName}>
      <OpenStreetMapTiles />
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
    </MapContainer>
  );
}

function OpenStreetMapTiles() {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  );
}

function FitBounds({ initiatives }: { initiatives: LocatedInitiative[] }) {
  const map = useMap();

  useEffect(() => {
    if (initiatives.length > 0) {
      map.fitBounds(
        initiatives.map(({ lat, lon }): LatLngTuple => [lat, lon]),
        { maxZoom: 15, padding: [32, 32] },
      );
    }
  }, [initiatives, map]);

  return null;
}

function isLocated(initiative: Initiative): initiative is LocatedInitiative {
  return Boolean(initiative.lat && initiative.lon);
}
