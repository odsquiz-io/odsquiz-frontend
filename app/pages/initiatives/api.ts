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
      body: JSON.stringify(initiativePayload(form, coordinates, place)),
    },
    "Não foi possível cadastrar a iniciativa.",
  );
}

export async function updateInitiative(
  id: string,
  form: InitiativeFormState,
  coordinates: Coordinates,
  place: Place,
  token: string,
) {
  return (await request(
    `/api/initiatives/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        ...initiativePayload(form, coordinates, place),
        description: form.description.trim(),
      }),
    },
    "Não foi possível salvar as alterações.",
  )) as Initiative;
}

function initiativePayload(
  form: InitiativeFormState,
  coordinates: Coordinates,
  place: Place,
) {
  return {
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
  };
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

export async function request(url: string, init: RequestInit, fallbackMessage: string) {
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

export class RequestError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

const codeMessages: Record<string, string> = {
  initiative_not_found: "Não encontramos esta iniciativa.",
  forbidden: "Só a pessoa responsável pela iniciativa pode fazer isso.",
  invalid_image: "Use uma imagem PNG, JPG ou WebP.",
  image_too_large: "A imagem passa de 2 MB. Escolha uma imagem menor.",
  logo_not_found: "Esta iniciativa não tem logo.",
  storage_unavailable:
    "O envio de imagens está indisponível no momento. Tente de novo mais tarde.",
  user_not_found:
    "Não encontramos uma conta com esse e-mail. A pessoa precisa se cadastrar no ODS Quiz antes de receber o convite.",
  cannot_invite_self: "Você já é a pessoa responsável por esta iniciativa.",
  already_member: "Essa pessoa já participa da iniciativa ou já tem um convite pendente.",
  target_suspended: "Essa conta está suspensa e não pode receber convites.",
  membership_not_found: "Essa participação não existe mais.",
  invitation_not_found: "Este convite não está mais disponível.",
};

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

  const code = isRecord(payload) && typeof payload.code === "string" ? payload.code : undefined;

  if (code && code in codeMessages) {
    return new RequestError(codeMessages[code], code);
  }

  return new RequestError(fallback, code);
}

export function authHeader(token: string) {
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
