import type { LatLngTuple } from "leaflet";
import { useEffect, useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { InitiativeLinks } from "../InitiativeLinks";
import type { Coordinates, Initiative } from "../types";
import { BaseMap } from "./BaseMap";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

type LocatedInitiative = Initiative & Coordinates;

const brazilCenter: LatLngTuple = [-14.235, -51.9253];

export function InitiativesMap({ initiatives }: { initiatives: Initiative[] }) {
  const located = useMemo(() => initiatives.filter(isLocated), [initiatives]);

  return (
    <BaseMap center={brazilCenter} zoom={4}>
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
    </BaseMap>
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
