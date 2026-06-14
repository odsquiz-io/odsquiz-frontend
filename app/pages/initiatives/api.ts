import type { Coordinates, Initiative, InitiativeFormState } from "./types";

type JwtPayload = Partial<Record<"sub" | "id" | "user_id" | "userId" | "owner", unknown>>;

type BrasilApiCepResponse = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  location?: { coordinates?: { latitude?: number | string; longitude?: number | string } };
};

type NominatimSearchResult = { lat?: string; lon?: string };

const missingApiMessage = "O serviço de iniciativas não está configurado.";

export function getStoredAuthToken() {
  return window.localStorage.getItem("odsquiz-auth-token");
}

export function getServerAuthToken() {
  return null;
}

export function subscribeToAuthToken(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export async function fetchInitiatives(token: string) {
  const payload = await request(
    `${getInitiativesApiBaseUrl()}/getAllOnes`,
    { headers: authHeader(token) },
    "Não foi possível carregar as iniciativas.",
  );

  return initiativesFrom(payload);
}

export async function createInitiative(
  form: InitiativeFormState,
  coordinates: Coordinates,
  token: string,
) {
  await request(
    `${getInitiativesApiBaseUrl()}/createOne`,
    {
      method: "POST",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        ...ownerFromToken(token),
        address: form.address.trim(),
        cep: form.cep.trim(),
        email_owner: form.emailOwner.trim(),
        acting_area: form.actingArea.trim(),
        impact: Number(form.impact),
        type: form.type.trim(),
        main_ods: Number(form.mainODS),
        lat: coordinates.lat,
        lon: coordinates.lon,
      }),
    },
    "Não foi possível cadastrar a iniciativa.",
  );
}

export async function lookupAddressByCep(cep: string) {
  const normalizedCep = cep.replace(/\D/g, "");

  if (normalizedCep.length !== 8) {
    throw new Error("Informe um CEP com 8 números.");
  }

  const response = await fetch(`${getBrasilApiCepBaseUrl()}/${normalizedCep}`);

  if (!response.ok) {
    throw new Error("Não foi possível encontrar esse CEP.");
  }

  const payload = (await response.json()) as BrasilApiCepResponse;
  const address = joinAddress(payload.street, payload.neighborhood, cityState(payload));

  return {
    address,
    cep: payload.cep ?? normalizedCep,
    coordinates: coordinatesFrom(
      payload.location?.coordinates?.latitude,
      payload.location?.coordinates?.longitude,
    ),
    geocodingQuery: joinAddress(
      address,
      payload.cep ?? normalizedCep,
      payload.city,
      payload.state,
      "Brasil",
    ),
  };
}

export async function geocodeAddress(query: string) {
  const params = new URLSearchParams({ format: "json", limit: "1", q: query });
  const response = await fetch(`${getNominatimSearchUrl()}?${params}`);

  if (!response.ok) {
    return undefined;
  }

  const [firstResult] = (await response.json()) as NominatimSearchResult[];
  return coordinatesFrom(firstResult?.lat, firstResult?.lon);
}

export function buildGeocodingQuery(form: InitiativeFormState) {
  return joinAddress(form.address.trim(), form.cep.trim(), "Brasil");
}

async function request(url: string, init: RequestInit, fallbackMessage: string) {
  const response = await fetch(url, init);
  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(apiMessage(payload, fallbackMessage));
  }

  return payload;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function apiMessage(payload: unknown, fallback: string) {
  return isRecord(payload) && typeof payload.message === "string"
    ? payload.message
    : isRecord(payload) && typeof payload.error === "string"
      ? payload.error
      : fallback;
}

function getInitiativesApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_INITIATIVES_API_URL?.replace(/\/$/, "");

  if (!url) {
    throw new Error(missingApiMessage);
  }

  return url;
}

function getBrasilApiCepBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BRASIL_API_CEP_URL ??
    "https://brasilapi.com.br/api/cep/v2"
  ).replace(/\/$/, "");
}

function getNominatimSearchUrl() {
  return (
    process.env.NEXT_PUBLIC_NOMINATIM_SEARCH_URL ??
    "https://nominatim.openstreetmap.org/search"
  ).replace(/\/$/, "");
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function ownerFromToken(token: string) {
  const payload = readJwtPayload(token);
  const owner =
    payload?.owner ?? payload?.sub ?? payload?.id ?? payload?.user_id ?? payload?.userId;

  return typeof owner === "string" ? { owner } : {};
}

function readJwtPayload(token: string): JwtPayload | undefined {
  const [, encodedPayload] = token.split(".");

  try {
    return encodedPayload
      ? (JSON.parse(
          window.atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")),
        ) as JwtPayload)
      : undefined;
  } catch {
    return undefined;
  }
}

function initiativesFrom(payload: unknown): Initiative[] {
  if (Array.isArray(payload)) {
    return payload as Initiative[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  const list = [
    payload.initiatives,
    payload.data,
    payload.items,
    payload.results,
  ].find(Array.isArray);

  return Array.isArray(list) ? (list as Initiative[]) : [];
}

function coordinatesFrom(
  rawLat: number | string | undefined,
  rawLon: number | string | undefined,
) {
  const lat = Number(rawLat);
  const lon = Number(rawLon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : undefined;
}

function joinAddress(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(", ");
}

function cityState(payload: BrasilApiCepResponse) {
  return payload.city && payload.state
    ? `${payload.city} - ${payload.state}`
    : payload.city;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
