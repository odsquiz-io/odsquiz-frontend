export type Coordinates = {
  lat: number;
  lon: number;
};

export type CepAddress = {
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
  coordinates?: Coordinates;
};

export const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type AwesomeApiCepResponse = {
  cep?: string;
  state?: string;
  city?: string;
  district?: string;
  address?: string;
  lat?: string;
  lng?: string;
};

type BrasilApiCepResponse = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  location?: { coordinates?: { latitude?: number | string; longitude?: number | string } };
};

type NominatimSearchResult = { lat?: string; lon?: string };

export function formatCep(cep?: string) {
  return cep?.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

export function cityState({ city, state }: { city?: string; state?: string }) {
  return city && state ? `${city} - ${state}` : city;
}

export async function lookupCep(cep: string): Promise<CepAddress> {
  const normalizedCep = cep.replace(/\D/g, "");

  if (normalizedCep.length !== 8) {
    throw new Error("Informe um CEP com 8 números.");
  }

  const found =
    (await lookupAwesomeApiCep(normalizedCep)) ??
    (await lookupBrasilApiCep(normalizedCep));

  if (!found) {
    throw new Error("Não foi possível encontrar esse CEP.");
  }

  return found;
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

async function lookupAwesomeApiCep(cep: string): Promise<CepAddress | undefined> {
  const response = await fetch(`${getAwesomeApiCepBaseUrl()}/${cep}`).catch(
    () => undefined,
  );

  if (!response?.ok) {
    return undefined;
  }

  const payload = (await response.json().catch(() => undefined)) as
    | AwesomeApiCepResponse
    | undefined;

  if (!payload) {
    return undefined;
  }

  return {
    cep: payload.cep ?? cep,
    street: payload.address ?? "",
    district: payload.district ?? "",
    city: payload.city ?? "",
    state: payload.state ?? "",
    coordinates: coordinatesFrom(payload.lat, payload.lng),
  };
}

async function lookupBrasilApiCep(cep: string): Promise<CepAddress | undefined> {
  const response = await fetch(`${getBrasilApiCepBaseUrl()}/${cep}`).catch(
    () => undefined,
  );

  if (!response?.ok) {
    return undefined;
  }

  const payload = (await response.json().catch(() => undefined)) as
    | BrasilApiCepResponse
    | undefined;

  if (!payload) {
    return undefined;
  }

  return {
    cep: payload.cep ?? cep,
    street: payload.street ?? "",
    district: payload.neighborhood ?? "",
    city: payload.city ?? "",
    state: payload.state ?? "",
    coordinates: coordinatesFrom(
      payload.location?.coordinates?.latitude,
      payload.location?.coordinates?.longitude,
    ),
  };
}

function coordinatesFrom(
  rawLat: number | string | undefined,
  rawLon: number | string | undefined,
) {
  const lat = Number(rawLat);
  const lon = Number(rawLon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : undefined;
}

function getAwesomeApiCepBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_AWESOME_API_CEP_URL ??
    "https://cep.awesomeapi.com.br/json"
  ).replace(/\/$/, "");
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
