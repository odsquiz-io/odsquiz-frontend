import type { LatLngTuple } from "leaflet";
import { useEffect, useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { findGoal } from "@/lib/ods";
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
        {located.map((initiative) => {
          const goal = findGoal(initiative.main_ods);

          return (
            <Marker key={initiative.id} position={[initiative.lat, initiative.lon]}>
              <Popup>
                {goal ? (
                  <span
                    className="mb-2 block w-fit rounded-[3px] px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: goal.color, color: goal.textColor }}
                  >
                    ODS {goal.number} <span aria-hidden="true">·</span> {goal.name}
                  </span>
                ) : null}
                <strong>{initiative.name}</strong>
                <br />
                {initiative.address}
                <InitiativeLinks id={initiative.id} />
              </Popup>
            </Marker>
          );
        })}
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
