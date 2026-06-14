"use client";

import Link from "next/link";
import type { ReactNode, SyntheticEvent } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Header } from "@/components/Header";

type InitiativeFormField =
  | "name"
  | "address"
  | "cep"
  | "emailOwner"
  | "actingArea"
  | "impact"
  | "type"
  | "mainODS";

type InitiativeFieldErrors = Partial<Record<InitiativeFormField, string>>;

type InitiativeFormState = {
  name: string;
  address: string;
  cep: string;
  emailOwner: string;
  actingArea: string;
  impact: string;
  type: string;
  mainODS: string;
};

type JwtPayload = {
  sub?: unknown;
  id?: unknown;
  user_id?: unknown;
  userId?: unknown;
  owner?: unknown;
};

type Coordinates = {
  lat: number;
  lon: number;
};

type BrasilApiCepResponse = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  location?: {
    coordinates?: {
      latitude?: number | string;
      longitude?: number | string;
    };
  };
};

type NominatimSearchResult = {
  lat?: string;
  lon?: string;
};

type Initiative = {
  id?: string;
  name?: string;
  owner?: string;
  address?: string;
  cep?: string;
  email_owner?: string;
  acting_area?: string;
  impact?: number;
  type?: string;
  points?: number;
  main_ods?: number;
  lat?: number;
  lon?: number;
  created_at?: string;
  updated_at?: string;
};

const initialFormState: InitiativeFormState = {
  name: "",
  address: "",
  cep: "",
  emailOwner: "",
  actingArea: "",
  impact: "",
  type: "",
  mainODS: "",
};

function getInitiativesApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_INITIATIVES_API_URL;

  if (!apiUrl) {
    return undefined;
  }

  return apiUrl.replace(/\/$/, "");
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

function readJwtPayload(token: string): JwtPayload | undefined {
  const [, encodedPayload] = token.split(".");

  if (!encodedPayload) {
    return undefined;
  }

  try {
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64)) as JwtPayload;
    return payload;
  } catch {
    return undefined;
  }
}

function getOwnerFromToken(token: string) {
  const payload = readJwtPayload(token);
  const owner =
    payload?.owner ?? payload?.sub ?? payload?.id ?? payload?.user_id ?? payload?.userId;

  return typeof owner === "string" ? owner : undefined;
}

function subscribeToAuthToken(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredAuthToken() {
  return window.localStorage.getItem("odsquiz-auth-token");
}

function getServerAuthToken() {
  return null;
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getApiMessage(payload: unknown, fallback: string) {
  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }

  return fallback;
}

function getInitiativesFromPayload(payload: unknown): Initiative[] {
  if (Array.isArray(payload)) {
    return payload as Initiative[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  const possibleLists = [
    payload.initiatives,
    payload.data,
    payload.items,
    payload.results,
  ];

  const list = possibleLists.find(Array.isArray);
  return Array.isArray(list) ? (list as Initiative[]) : [];
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDigits(value: string) {
  return value.replace(/\D/g, "");
}

function parseCoordinate(value: number | string | undefined) {
  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : undefined;
}

function formatAddressFromCep(payload: BrasilApiCepResponse) {
  return [
    payload.street,
    payload.neighborhood,
    payload.city && payload.state ? `${payload.city} - ${payload.state}` : payload.city,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildGeocodingQuery(form: InitiativeFormState) {
  return [form.address.trim(), form.cep.trim(), "Brasil"]
    .filter(Boolean)
    .join(", ");
}

async function geocodeAddress(query: string): Promise<Coordinates | undefined> {
  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    q: query,
  });
  const response = await fetch(
    `${getNominatimSearchUrl()}?${params.toString()}`,
  );

  if (!response.ok) {
    return undefined;
  }

  const payload = (await response.json()) as NominatimSearchResult[];
  const firstResult = payload[0];
  const lat = parseCoordinate(firstResult?.lat);
  const lon = parseCoordinate(firstResult?.lon);

  if (lat === undefined || lon === undefined) {
    return undefined;
  }

  return { lat, lon };
}

async function lookupAddressByCep(cep: string) {
  const normalizedCep = getDigits(cep);

  if (normalizedCep.length !== 8) {
    throw new Error("Informe um CEP com 8 números.");
  }

  const response = await fetch(`${getBrasilApiCepBaseUrl()}/${normalizedCep}`);

  if (!response.ok) {
    throw new Error("Não foi possível encontrar esse CEP.");
  }

  const payload = (await response.json()) as BrasilApiCepResponse;
  const lat = parseCoordinate(payload.location?.coordinates?.latitude);
  const lon = parseCoordinate(payload.location?.coordinates?.longitude);
  const coordinates =
    lat === undefined || lon === undefined ? undefined : { lat, lon };
  const address = formatAddressFromCep(payload);

  return {
    address,
    cep: payload.cep ?? normalizedCep,
    coordinates,
    geocodingQuery: [
      address,
      payload.cep ?? normalizedCep,
      payload.city,
      payload.state,
      "Brasil",
    ]
      .filter(Boolean)
      .join(", "),
  };
}

function validateInitiativeForm(form: InitiativeFormState) {
  const errors: InitiativeFieldErrors = {};
  const impact = Number(form.impact);
  const mainODS = Number(form.mainODS);

  if (!form.name.trim()) {
    errors.name = "Informe o nome da iniciativa.";
  }

  if (!form.address.trim()) {
    errors.address = "Informe o endereço.";
  }

  if (!form.cep.trim()) {
    errors.cep = "Informe o CEP.";
  }

  if (!form.emailOwner.trim()) {
    errors.emailOwner = "Informe o email do responsável.";
  } else if (!isValidEmail(form.emailOwner.trim())) {
    errors.emailOwner = "Informe um email válido.";
  }

  if (!form.actingArea.trim()) {
    errors.actingArea = "Informe a área de atuação.";
  }

  if (!form.impact.trim()) {
    errors.impact = "Informe o impacto.";
  } else if (!Number.isInteger(impact) || impact < 0) {
    errors.impact = "Use um número inteiro igual ou maior que zero.";
  }

  if (!form.type.trim()) {
    errors.type = "Informe o tipo.";
  }

  if (!form.mainODS.trim()) {
    errors.mainODS = "Informe o ODS principal.";
  } else if (!Number.isInteger(mainODS) || mainODS < 1 || mainODS > 17) {
    errors.mainODS = "Use um número entre 1 e 17.";
  }

  return errors;
}

function getFieldClass(hasError: boolean) {
  return `h-11 w-full rounded-md border bg-[var(--color-app-background)] px-3 text-[var(--color-app-foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-link-hover)] focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
    hasError ? "border-red-400" : "border-[var(--color-header-border)]"
  }`;
}

function getTextAreaClass(hasError: boolean) {
  return `min-h-24 w-full rounded-md border bg-[var(--color-app-background)] px-3 py-2 text-[var(--color-app-foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-link-hover)] focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
    hasError ? "border-red-400" : "border-[var(--color-header-border)]"
  }`;
}

export default function Initiatives() {
  const [form, setForm] = useState<InitiativeFormState>(initialFormState);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const token = useSyncExternalStore(
    subscribeToAuthToken,
    getStoredAuthToken,
    getServerAuthToken,
  );
  const [fieldErrors, setFieldErrors] = useState<InitiativeFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [listStatus, setListStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [listMessage, setListMessage] = useState("");
  const [listReloadKey, setListReloadKey] = useState(0);
  const [cepLookupStatus, setCepLookupStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [geoMessage, setGeoMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;

    async function loadInitiatives() {
      const apiBaseUrl = getInitiativesApiBaseUrl();

      if (!apiBaseUrl) {
        if (isCurrent) {
          setListStatus("error");
          setListMessage("O serviço de iniciativas não está configurado.");
        }
        return;
      }

      if (isCurrent) {
        setListStatus("loading");
        setListMessage("");
      }

      try {
        const response = await fetch(`${apiBaseUrl}/getAllOnes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = await readResponse(response);

        if (!isCurrent) {
          return;
        }

        if (!response.ok) {
          setListStatus("error");
          setListMessage(
            getApiMessage(payload, "Não foi possível carregar as iniciativas."),
          );
          return;
        }

        setInitiatives(getInitiativesFromPayload(payload));
        setListStatus("idle");
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setListStatus("error");
        setListMessage(
          error instanceof TypeError
            ? "Não foi possível conectar ao serviço de iniciativas."
            : error instanceof Error
              ? error.message
              : "Algo deu errado ao carregar as iniciativas.",
        );
      }
    }

    loadInitiatives();

    return () => {
      isCurrent = false;
    };
  }, [listReloadKey, token]);

  function updateField(field: InitiativeFormField, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));

    if (field === "address" || field === "cep") {
      setCoordinates(null);
      setCepLookupStatus("idle");
      setGeoMessage("");
    }

    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  async function handleCepLookup() {
    setMessage("");
    setGeoMessage("");
    setCepLookupStatus("loading");

    try {
      const lookupResult = await lookupAddressByCep(form.cep);
      const nextCoordinates =
        lookupResult.coordinates ??
        (lookupResult.geocodingQuery
          ? await geocodeAddress(lookupResult.geocodingQuery)
          : undefined);

      setForm((currentForm) => ({
        ...currentForm,
        address: lookupResult.address || currentForm.address,
        cep: lookupResult.cep,
      }));
      setCoordinates(nextCoordinates ?? null);
      setFieldErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors.cep;
        delete nextErrors.address;
        return nextErrors;
      });

      if (!nextCoordinates) {
        setCepLookupStatus("error");
        setGeoMessage(
          "Endereço encontrado, mas não foi possível obter as coordenadas. Ajuste o endereço e tente cadastrar novamente.",
        );
        return;
      }

      setCepLookupStatus("success");
      setGeoMessage("Endereço e coordenadas encontrados pelo CEP.");
    } catch (error) {
      setCoordinates(null);
      setCepLookupStatus("error");
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        cep:
          error instanceof Error
            ? error.message
            : "Não foi possível buscar esse CEP.",
      }));
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Faça login para cadastrar uma iniciativa.");
      return;
    }

    const validationErrors = validateInitiativeForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    const apiBaseUrl = getInitiativesApiBaseUrl();

    if (!apiBaseUrl) {
      setMessage("O serviço de iniciativas não está configurado.");
      return;
    }

    setStatus("submitting");
    setFieldErrors({});

    const nextCoordinates =
      coordinates ?? (await geocodeAddress(buildGeocodingQuery(form)));

    if (!nextCoordinates) {
      setStatus("idle");
      setFieldErrors({
        address:
          "Não foi possível obter as coordenadas pelo CEP/endereço. Confira os dados e tente novamente.",
      });
      setGeoMessage("");
      return;
    }

    setCoordinates(nextCoordinates);

    const owner = getOwnerFromToken(token);
    const payload = {
      name: form.name.trim(),
      ...(owner ? { owner } : {}),
      address: form.address.trim(),
      cep: form.cep.trim(),
      email_owner: form.emailOwner.trim(),
      acting_area: form.actingArea.trim(),
      impact: Number(form.impact),
      type: form.type.trim(),
      main_ods: Number(form.mainODS),
      lat: nextCoordinates.lat,
      lon: nextCoordinates.lon,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/createOne`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responsePayload = await readResponse(response);

      if (!response.ok) {
        setStatus("idle");
        setMessage(
          getApiMessage(responsePayload, "Não foi possível cadastrar a iniciativa."),
        );
        return;
      }

      setStatus("success");
      setForm(initialFormState);
      setCoordinates(null);
      setCepLookupStatus("idle");
      setGeoMessage("");
      setMessage("Iniciativa cadastrada com sucesso.");
      setListReloadKey((currentKey) => currentKey + 1);
    } catch (error) {
      setStatus("idle");
      setMessage(
        error instanceof TypeError
          ? "Não foi possível conectar ao serviço de iniciativas."
          : error instanceof Error
            ? error.message
            : "Algo deu errado. Tente novamente.",
      );
    }
  }

  return (
    <main className="relative min-h-screen bg-[var(--color-app-background)] transition-colors">
      <Header />

      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-link-hover)]">
            ODS Quiz
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--color-app-foreground)]">
            Iniciativas
          </h1>
        </div>

        {!token ? (
          <div className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 text-[var(--color-app-foreground)] shadow-2xl shadow-black/20">
            <h2 className="text-xl font-bold">Login necessário</h2>
            <p className="mt-2 text-sm">
              Entre na sua conta para cadastrar uma nova iniciativa.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex min-h-11 items-center rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)]"
            >
              Fazer login
            </Link>
          </div>
        ) : (
          <>
            <form
              className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 shadow-2xl shadow-black/20 sm:p-6"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  error={fieldErrors.name}
                  label="Nome"
                  name="name"
                  required
                >
                  <input
                    required
                    type="text"
                    autoComplete="organization"
                    value={form.name}
                    aria-invalid={Boolean(fieldErrors.name)}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={getFieldClass(Boolean(fieldErrors.name))}
                  />
                </Field>

                <Field
                  error={fieldErrors.emailOwner}
                  label="Email do responsável"
                  name="emailOwner"
                  required
                >
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={form.emailOwner}
                    aria-invalid={Boolean(fieldErrors.emailOwner)}
                    onChange={(event) =>
                      updateField("emailOwner", event.target.value)
                    }
                    className={getFieldClass(Boolean(fieldErrors.emailOwner))}
                  />
                </Field>

                <Field
                  className="md:col-span-2"
                  error={fieldErrors.address}
                  label="Endereço"
                  name="address"
                  required
                >
                  <textarea
                    required
                    autoComplete="street-address"
                    value={form.address}
                    aria-invalid={Boolean(fieldErrors.address)}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    className={getTextAreaClass(Boolean(fieldErrors.address))}
                  />
                </Field>

                <Field error={fieldErrors.cep} label="CEP" name="cep" required>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={form.cep}
                      aria-invalid={Boolean(fieldErrors.cep)}
                      onChange={(event) => updateField("cep", event.target.value)}
                      className={getFieldClass(Boolean(fieldErrors.cep))}
                    />
                    <button
                      type="button"
                      disabled={cepLookupStatus === "loading"}
                      onClick={handleCepLookup}
                      className="h-11 shrink-0 rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cepLookupStatus === "loading" ? "Buscando..." : "Buscar"}
                    </button>
                  </div>
                </Field>

                <Field
                  error={fieldErrors.actingArea}
                  label="Área de atuação"
                  name="actingArea"
                  required
                >
                  <input
                    required
                    type="text"
                    value={form.actingArea}
                    aria-invalid={Boolean(fieldErrors.actingArea)}
                    onChange={(event) =>
                      updateField("actingArea", event.target.value)
                    }
                    className={getFieldClass(Boolean(fieldErrors.actingArea))}
                  />
                </Field>

                <Field error={fieldErrors.type} label="Tipo" name="type" required>
                  <input
                    required
                    type="text"
                    value={form.type}
                    aria-invalid={Boolean(fieldErrors.type)}
                    onChange={(event) => updateField("type", event.target.value)}
                    className={getFieldClass(Boolean(fieldErrors.type))}
                  />
                </Field>

                <Field
                  error={fieldErrors.impact}
                  label="Impacto"
                  name="impact"
                  required
                >
                  <input
                    required
                    min="0"
                    step="1"
                    type="number"
                    inputMode="numeric"
                    value={form.impact}
                    aria-invalid={Boolean(fieldErrors.impact)}
                    onChange={(event) => updateField("impact", event.target.value)}
                    className={getFieldClass(Boolean(fieldErrors.impact))}
                  />
                </Field>

                <Field
                  error={fieldErrors.mainODS}
                  label="ODS principal"
                  name="mainODS"
                  required
                >
                  <input
                    required
                    min="1"
                    max="17"
                    step="1"
                    type="number"
                    inputMode="numeric"
                    value={form.mainODS}
                    aria-invalid={Boolean(fieldErrors.mainODS)}
                    onChange={(event) =>
                      updateField("mainODS", event.target.value)
                    }
                    className={getFieldClass(Boolean(fieldErrors.mainODS))}
                  />
                </Field>

                {geoMessage ? (
                  <p
                    className={`text-sm font-medium md:col-span-2 ${
                      cepLookupStatus === "success"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                    role="status"
                  >
                    {geoMessage}
                  </p>
                ) : null}
              </div>

              {message ? (
                <p
                  className={`mt-5 text-sm font-medium ${
                    status === "success" ? "text-emerald-400" : "text-red-400"
                  }`}
                  role="status"
                >
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-6 h-11 w-full rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {status === "submitting" ? "Salvando..." : "Cadastrar iniciativa"}
              </button>
            </form>

            <InitiativesList
              initiatives={initiatives}
              message={listMessage}
              status={listStatus}
              onRefresh={() => setListReloadKey((currentKey) => currentKey + 1)}
            />
          </>
        )}
      </section>
    </main>
  );
}

function InitiativesList({
  initiatives,
  message,
  onRefresh,
  status,
}: {
  initiatives: Initiative[];
  message: string;
  onRefresh: () => void;
  status: "idle" | "loading" | "error";
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-extrabold text-[var(--color-app-foreground)]">
          Todas as iniciativas
        </h2>
        <button
          type="button"
          disabled={status === "loading"}
          onClick={onRefresh}
          className="h-10 rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {status === "error" ? (
        <p className="rounded-lg border border-red-400 bg-[var(--color-header-background)] p-4 text-sm font-medium text-red-400">
          {message}
        </p>
      ) : null}

      {status === "loading" && initiatives.length === 0 ? (
        <p className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-4 text-sm font-medium text-[var(--color-app-foreground)]">
          Carregando iniciativas...
        </p>
      ) : null}

      {status !== "loading" && initiatives.length === 0 && status !== "error" ? (
        <p className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-4 text-sm font-medium text-[var(--color-app-foreground)]">
          Nenhuma iniciativa cadastrada ainda.
        </p>
      ) : null}

      {initiatives.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {initiatives.map((initiative, index) => (
            <article
              key={initiative.id ?? `${initiative.name}-${index}`}
              className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 text-[var(--color-app-foreground)] shadow-2xl shadow-black/10"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    {initiative.name || "Iniciativa sem nome"}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-link-hover)]">
                    {initiative.type || "Tipo não informado"}
                  </p>
                </div>
                {typeof initiative.main_ods === "number" ? (
                  <span className="inline-flex h-9 items-center rounded-md border border-[var(--color-header-border)] px-3 text-sm font-bold">
                    ODS {initiative.main_ods}
                  </span>
                ) : null}
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                <InfoItem label="Área" value={initiative.acting_area} />
                <InfoItem label="Endereço" value={initiative.address} />
                <InfoItem label="CEP" value={initiative.cep} />
                <InfoItem label="Responsável" value={initiative.email_owner} />
                <InfoItem
                  label="Impacto"
                  value={
                    typeof initiative.impact === "number"
                      ? String(initiative.impact)
                      : undefined
                  }
                />
                <InfoItem
                  label="Pontos"
                  value={
                    typeof initiative.points === "number"
                      ? String(initiative.points)
                      : undefined
                  }
                />
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="font-bold">{label}</dt>
      <dd className="mt-1 break-words">{value}</dd>
    </div>
  );
}

function Field({
  children,
  className = "",
  error,
  label,
  name,
  required,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  label: string;
  name: InitiativeFormField;
  required?: boolean;
}) {
  const errorId = `${name}-error`;

  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-[var(--color-app-foreground)]">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {children}
      {error ? (
        <p className="mt-2 text-sm font-medium text-red-400" id={errorId}>
          {error}
        </p>
      ) : null}
    </label>
  );
}
