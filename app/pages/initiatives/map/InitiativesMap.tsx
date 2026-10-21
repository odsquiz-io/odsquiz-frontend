import { latLng, latLngBounds, type LatLngTuple } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useSession } from "@/components/SessionProvider";
import { geocodeAddress } from "@/lib/cep";
import { findGoal } from "@/lib/ods";
import { InitiativeLinks } from "../InitiativeLinks";
import type { Coordinates, Initiative } from "../types";
import { BaseMap } from "./BaseMap";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

type LocatedInitiative = Initiative & Coordinates;

// undefined while the user's place is still being resolved, null when it is unknown.
type Home = LatLngTuple | null | undefined;

const brazilCenter: LatLngTuple = [-14.235, -51.9253];
const regionRadius = 20_000;

export function InitiativesMap({ initiatives }: { initiatives: Initiative[] }) {
  const located = useMemo(() => initiatives.filter(isLocated), [initiatives]);
  const home = useHome();

  return (
    <BaseMap center={brazilCenter} zoom={4}>
      <FitBounds home={home} initiatives={located} />
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

function useHome(): Home {
  const { status, user } = useSession();
  const lat = user?.lat ?? 0;
  const lon = user?.lon ?? 0;
  // A CEP lookup without coordinates is saved as 0, 0.
  const saved = useMemo<LatLngTuple | null>(
    () => (lat !== 0 || lon !== 0 ? [lat, lon] : null),
    [lat, lon],
  );
  const query = !saved && user?.city && user.state ? `${user.city}, ${user.state}, Brasil` : null;
  const [geocoded, setGeocoded] = useState<{ query: string; home: LatLngTuple | null }>();

  useEffect(() => {
    if (!query) {
      return;
    }

    let isCurrent = true;

    geocodeAddress(query)
      .catch(() => undefined)
      .then((coordinates) => {
        if (isCurrent) {
          setGeocoded({ query, home: coordinates ? [coordinates.lat, coordinates.lon] : null });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [query]);

  if (status === "loading") {
    return undefined;
  }

  if (saved || !query) {
    return saved;
  }

  return geocoded?.query === query ? geocoded.home : undefined;
}

function FitBounds({ home, initiatives }: { home: Home; initiatives: LocatedInitiative[] }) {
  const map = useMap();

  useEffect(() => {
    const points = initiatives.map(({ lat, lon }) => latLng(lat, lon));

    if (home) {
      const origin = latLng(home);
      const [nearest] = points.sort((a, b) => origin.distanceTo(a) - origin.distanceTo(b));

      if (!nearest) {
        map.setView(origin, 12);
      } else if (origin.distanceTo(nearest) <= regionRadius) {
        map.setView(nearest, 14);
      } else {
        map.fitBounds(latLngBounds([origin, nearest]), { padding: [32, 32] });
      }
    } else if (home === null && points.length > 0) {
      map.fitBounds(latLngBounds(points), { maxZoom: 15, padding: [32, 32] });
    }
  }, [home, initiatives, map]);

  return null;
}

function isLocated(initiative: Initiative): initiative is LocatedInitiative {
  return Boolean(initiative.lat && initiative.lon);
}
