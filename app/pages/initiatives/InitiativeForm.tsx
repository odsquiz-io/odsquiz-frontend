import dynamic from "next/dynamic";
import type { ChangeEvent, ReactNode, SyntheticEvent } from "react";
import { useState } from "react";
import { OdsBand } from "@/components/OdsBand";
import { focusRing, primaryButton, secondaryButton, surface } from "@/components/styles";
import { findGoal } from "@/lib/ods";
import { createInitiative, geocodeAddress, lookupAddressByCep } from "./api";
import { MapFrame, MapLoading } from "./MapFrame";
import type {
  CepLookupStatus,
  Coordinates,
  InitiativeFieldErrors,
  InitiativeFormField,
  InitiativeFormState,
  SubmitStatus,
} from "./types";
import { initialFormState, validateInitiativeForm } from "./validation";

const LocationMap = dynamic(
  () => import("./map/LocationMap").then((mod) => mod.LocationMap),
  { loading: MapLoading, ssr: false },
);

type FieldConfig = {
  autoComplete?: string;
  field: InitiativeFormField;
  hint: ReactNode;
  inputMode?: "numeric";
  kind?: "input" | "textarea" | "cep" | "select";
  label: string;
  max?: number;
  min?: number;
  options?: string[];
  type?: "email" | "number" | "text";
  width?: string;
};

const aboutFields: FieldConfig[] = [
  {
    autoComplete: "organization",
    field: "name",
    hint: "Nome pelo qual a iniciativa é conhecida.",
    label: "Nome",
  },
  {
    field: "type",
    hint: "Quem organiza a iniciativa.",
    kind: "select",
    label: "Tipo",
    options: ["Sociedade Civil", "Instituição Pública", "Instituição Privada"],
    width: "sm:max-w-xs",
  },
  {
    field: "actingArea",
    hint: "Nome do bairro, cidade ou região. Ex.: Centro, Nova Friburgo - RJ.",
    label: "Área de atuação",
  },
  {
    field: "impact",
    hint: "Quantidade aproximada de pessoas atendidas pela iniciativa.",
    inputMode: "numeric",
    label: "Impacto",
    min: 0,
    type: "number",
    width: "max-w-48",
  },
  {
    field: "mainODS",
    hint: (
      <>
        Número de 1 a 17 do Objetivo de Desenvolvimento Sustentável da ONU em
        que a iniciativa mais atua. Consulte a{" "}
        <a
          href="https://brasil.un.org/pt-br/sdgs"
          target="_blank"
          rel="noreferrer"
          className={`font-bold text-[var(--color-app-foreground)] underline underline-offset-4 ${focusRing}`}
        >
          lista oficial
          <span className="sr-only"> (abre em nova guia)</span>
        </a>
        .
      </>
    ),
    inputMode: "numeric",
    label: "ODS principal",
    max: 17,
    min: 1,
    type: "number",
    width: "max-w-28",
  },
];

const locationFields: FieldConfig[] = [
  {
    autoComplete: "postal-code",
    field: "cep",
    hint: "Digite os 8 números e clique em Buscar para preencher o endereço e o mapa.",
    inputMode: "numeric",
    kind: "cep",
    label: "CEP",
    width: "sm:max-w-48",
  },
  {
    autoComplete: "street-address",
    field: "address",
    hint: "Preenchido ao buscar o CEP. Acrescente o número e o complemento.",
    kind: "textarea",
    label: "Endereço",
  },
];

const contactFields: FieldConfig[] = [
  {
    autoComplete: "email",
    field: "emailOwner",
    hint: "Contato de quem responde pela iniciativa. Fica visível na página dela.",
    label: "Email do responsável",
    type: "email",
  },
];

export function InitiativeForm({
  onCreated,
  token,
}: {
  onCreated: () => void;
  token: string;
}) {
  const [form, setForm] = useState<InitiativeFormState>(initialFormState);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [fieldErrors, setFieldErrors] = useState<InitiativeFieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [cepLookupStatus, setCepLookupStatus] =
    useState<CepLookupStatus>("idle");
  const [geoMessage, setGeoMessage] = useState("");
  const [message, setMessage] = useState("");

  function updateField(field: InitiativeFormField, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));

    if (field === "cep") {
      setCoordinates(null);
      setCepLookupStatus("idle");
      setGeoMessage("");
    }

    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  async function handleCepLookup() {
    setMessage("");
    setGeoMessage("");
    setCoordinates(null);
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
      setCepLookupStatus(nextCoordinates ? "success" : "error");
      setGeoMessage(
        nextCoordinates
          ? "Confira o marcador no mapa e arraste-o até o local exato, se necessário."
          : "Endereço encontrado, mas não foi possível localizá-lo no mapa.",
      );
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

    const validationErrors = validateInitiativeForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    if (!coordinates) {
      setFieldErrors({ cep: "Busque o CEP para marcar a iniciativa no mapa." });
      return;
    }

    setStatus("submitting");
    setFieldErrors({});

    try {
      await createInitiative(form, coordinates, token);
      setStatus("success");
      setForm(initialFormState);
      setCoordinates(null);
      setCepLookupStatus("idle");
      setGeoMessage("");
      setMessage("Iniciativa cadastrada com sucesso.");
      onCreated();
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Não foi possível conectar ao serviço de iniciativas."
          : error instanceof Error
            ? error.message
            : "Algo deu errado. Tente novamente.",
      );
    } finally {
      setStatus((currentStatus) =>
        currentStatus === "submitting" ? "idle" : currentStatus,
      );
    }
  }

  return (
    <form className={`overflow-hidden ${surface}`} noValidate onSubmit={handleSubmit}>
      <OdsBand className="h-1.5" />

      <div className="divide-y divide-[var(--color-header-border)] px-6 sm:px-8">
        <FieldGroup legend="Sobre a iniciativa" number={1}>
          {aboutFields.map(renderField)}
        </FieldGroup>

        <FieldGroup legend="Localização" number={2}>
          {locationFields.map(renderField)}
          {coordinates ? (
            <MapFrame className="h-64 sm:h-80">
              <LocationMap coordinates={coordinates} onChange={setCoordinates} />
            </MapFrame>
          ) : null}
        </FieldGroup>

        <FieldGroup legend="Contato" number={3}>
          {contactFields.map(renderField)}
        </FieldGroup>

        <div className="py-8">
          <p
            className={
              message
                ? `mb-6 font-bold ${
                    status === "success"
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-error)]"
                  }`
                : undefined
            }
            role="status"
          >
            {message}
          </p>
          <button
            type="submit"
            disabled={status === "submitting"}
            className={`w-full sm:w-auto ${primaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {status === "submitting" ? "Salvando..." : "Cadastrar iniciativa"}
          </button>
        </div>
      </div>
    </form>
  );

  function renderField(field: FieldConfig) {
    const id = `initiative-${field.field}`;

    return (
      <Field
        key={field.field}
        error={fieldErrors[field.field]}
        hint={field.hint}
        id={id}
        label={field.label}
      >
        {renderControl(field, id)}
      </Field>
    );
  }

  function renderControl(field: FieldConfig, id: string) {
    const error = Boolean(fieldErrors[field.field]);
    const sharedProps = {
      id,
      required: true,
      value: form[field.field],
      "aria-invalid": error,
      "aria-describedby": error ? `${id}-hint ${id}-error` : `${id}-hint`,
      onChange: (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
      ) => updateField(field.field, event.target.value),
    };

    if (field.kind === "select") {
      return (
        <div className={`relative ${field.width ?? ""}`}>
          <select {...sharedProps} className={`${controlClass(error)} appearance-none pr-12`}>
            <option value="" disabled>
              Selecione
            </option>
            {field.options?.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-1/2 size-2 -translate-y-3/4 rotate-45 border-b-2 border-r-2 border-current"
          />
        </div>
      );
    }

    if (field.kind === "textarea") {
      return (
        <textarea
          {...sharedProps}
          autoComplete={field.autoComplete}
          className={`${controlClass(error)} min-h-28 py-3`}
        />
      );
    }

    const input = (
      <input
        {...sharedProps}
        autoComplete={field.autoComplete}
        inputMode={field.inputMode}
        max={field.max}
        min={field.min}
        step={field.type === "number" ? "1" : undefined}
        type={field.type ?? "text"}
        className={`${controlClass(error)} ${field.width ?? ""}`}
      />
    );

    if (field.field === "mainODS") {
      const goal = findGoal(Number(form.mainODS));

      return (
        <div className="flex flex-wrap items-center gap-3">
          {input}
          <span aria-live="polite">
            {goal ? (
              <span
                className="inline-flex min-h-12 items-center gap-3 rounded-md px-3 py-1"
                style={{ backgroundColor: goal.color, color: goal.textColor }}
              >
                <span
                  aria-hidden="true"
                  className="font-display text-3xl font-extrabold leading-none [font-stretch:75%]"
                >
                  {String(goal.number).padStart(2, "0")}
                </span>
                <span className="text-sm font-bold leading-snug">{goal.name}</span>
              </span>
            ) : null}
          </span>
        </div>
      );
    }

    if (field.kind !== "cep") {
      return input;
    }

    return (
      <>
        <div className="flex flex-col gap-3 sm:flex-row">
          {input}
          <button
            type="button"
            disabled={cepLookupStatus === "loading"}
            onClick={handleCepLookup}
            className={`shrink-0 ${secondaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {cepLookupStatus === "loading" ? "Buscando..." : "Buscar"}
          </button>
        </div>
        <p
          className={
            geoMessage
              ? `mt-3 text-sm font-medium ${
                  cepLookupStatus === "success"
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-error)]"
                }`
              : undefined
          }
          role="status"
        >
          {geoMessage}
        </p>
      </>
    );
  }
}

function FieldGroup({
  children,
  legend,
  number,
}: {
  children: ReactNode;
  legend: string;
  number: number;
}) {
  return (
    <div className="py-8">
      <fieldset className="min-w-0">
        <legend>
          <span className="flex items-baseline gap-3 font-display text-2xl font-extrabold [font-stretch:85%]">
            <span
              aria-hidden="true"
              className="text-3xl leading-none text-[var(--color-muted)] [font-stretch:75%]"
            >
              {String(number).padStart(2, "0")}
            </span>
            {legend}
          </span>
        </legend>
        <div className="mt-6 grid gap-7">{children}</div>
      </fieldset>
    </div>
  );
}

function Field({
  children,
  error,
  hint,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  hint: ReactNode;
  id: string;
  label: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-bold">
        {label}
        <span aria-hidden="true" className="text-[var(--color-muted)]">
          {" "}
          *
        </span>
      </label>
      <p id={`${id}-hint`} className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
        {hint}
      </p>
      <div className="mt-3">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm font-bold text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function controlClass(hasError: boolean) {
  return `min-h-12 w-full rounded-md border bg-[var(--color-app-background)] px-4 text-base text-[var(--color-app-foreground)] transition ${focusRing} ${
    hasError
      ? "border-[var(--color-error)]"
      : "border-[var(--color-muted)] hover:border-[var(--color-app-foreground)]"
  }`;
}
