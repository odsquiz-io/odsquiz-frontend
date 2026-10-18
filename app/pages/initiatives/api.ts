import { AccountSuspendedError, isAccountSuspended } from "@/components/SessionProvider";
import { cityState, lookupCep, states } from "@/lib/cep";
import type { Coordinates, Initiative, InitiativeFormState, Place } from "./types";

export async function fetchInitiatives(token: string) {
  const payload = await request(
    "/api/initiatives",
    { headers: authHeader(token) },
    "Não foi possível carregar as iniciativas.",
  );

  return initiativesFrom(payload);
}

export async function fetchMyInitiatives(token: string) {
  const payload = await request(
    "/api/initiatives/mine",
    { headers: authHeader(token) },
    "Não foi possível carregar suas iniciativas.",
  );

  return initiativesFrom(payload);
}

export async function fetchInitiative(token: string, id: string) {
  return (await request(
    `/api/initiatives/${encodeURIComponent(id)}`,
    { headers: authHeader(token) },
    "Não foi possível carregar a iniciativa.",
  )) as Initiative;
}

export async function createInitiative(
  form: InitiativeFormState,
  coordinates: Coordinates,
  place: Place,
  token: string,
) {
  await request(
    "/api/initiatives",
    {
      method: "POST",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        address: form.address.trim(),
        cep: form.cep.trim(),
        city: place.city,
        state: place.state,
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
  const found = await lookupCep(cep);
  const address = joinAddress(found.street, found.district, cityState(found));

  return {
    address,
    cep: found.cep,
    coordinates: found.coordinates,
    place: {
      city: found.city,
      state: states.includes(found.state) ? found.state : "",
    },
    geocodingQuery: joinAddress(address, found.cep, "Brasil"),
  };
}

async function request(url: string, init: RequestInit, fallbackMessage: string) {
  const response = await fetch(url, init);
  const payload = await readPayload(response);

  if (!response.ok) {
    throw errorFrom(response.status, payload, fallbackMessage);
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

// Chosen by status or code: the API replies with codes or English text, never with page copy.
function errorFrom(status: number, payload: unknown, fallback: string) {
  if (isAccountSuspended(payload)) {
    return new AccountSuspendedError(
      "Sua conta está suspensa, por isso não é possível cadastrar nem alterar iniciativas.",
    );
  }

  if (status === 401) {
    return new Error("Sua sessão expirou. Entre de novo para continuar.");
  }

  if (isRecord(payload) && payload.code === "initiative_not_found") {
    return new Error("Não encontramos esta iniciativa.");
  }

  return new Error(fallback);
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
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

function joinAddress(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(", ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
