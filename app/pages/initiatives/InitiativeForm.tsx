import type { ReactNode, SyntheticEvent } from "react";
import { useState } from "react";
import {
  buildGeocodingQuery,
  createInitiative,
  geocodeAddress,
  lookupAddressByCep,
} from "./api";
import type {
  CepLookupStatus,
  Coordinates,
  InitiativeFieldErrors,
  InitiativeFormField,
  InitiativeFormState,
  SubmitStatus,
} from "./types";
import { initialFormState, validateInitiativeForm } from "./validation";

type FieldConfig = {
  autoComplete?: string;
  className?: string;
  field: InitiativeFormField;
  inputMode?: "numeric";
  kind?: "input" | "textarea" | "cep";
  label: string;
  max?: number;
  min?: number;
  type?: "email" | "number" | "text";
};

const fields: FieldConfig[] = [
  { autoComplete: "organization", field: "name", label: "Nome" },
  {
    autoComplete: "email",
    field: "emailOwner",
    label: "Email do responsável",
    type: "email",
  },
  {
    autoComplete: "street-address",
    className: "md:col-span-2",
    field: "address",
    kind: "textarea",
    label: "Endereço",
  },
  {
    autoComplete: "postal-code",
    field: "cep",
    inputMode: "numeric",
    kind: "cep",
    label: "CEP",
  },
  { field: "actingArea", label: "Área de atuação" },
  { field: "type", label: "Tipo" },
  {
    field: "impact",
    inputMode: "numeric",
    label: "Impacto",
    min: 0,
    type: "number",
  },
  {
    field: "mainODS",
    inputMode: "numeric",
    label: "ODS principal",
    max: 17,
    min: 1,
    type: "number",
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

    if (field === "address" || field === "cep") {
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
          ? "Endereço e coordenadas encontrados pelo CEP."
          : "Endereço encontrado, mas não foi possível obter as coordenadas. Ajuste o endereço e tente cadastrar novamente.",
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

    setStatus("submitting");
    setFieldErrors({});

    try {
      const nextCoordinates =
        coordinates ?? (await geocodeAddress(buildGeocodingQuery(form)));

      if (!nextCoordinates) {
        setFieldErrors({
          address:
            "Não foi possível obter as coordenadas pelo CEP/endereço. Confira os dados e tente novamente.",
        });
        setGeoMessage("");
        return;
      }

      await createInitiative(form, nextCoordinates, token);
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
    <form
      className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 shadow-2xl shadow-black/20 sm:p-6"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.field}
            className={field.className}
            error={fieldErrors[field.field]}
            label={field.label}
            name={field.field}
          >
            {renderControl(field)}
          </Field>
        ))}

        {geoMessage ? (
          <p
            className={`text-sm font-medium md:col-span-2 ${
              cepLookupStatus === "success" ? "text-emerald-400" : "text-red-400"
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
  );

  function renderControl(field: FieldConfig) {
    const error = Boolean(fieldErrors[field.field]);
    const sharedProps = {
      required: true,
      value: form[field.field],
      "aria-invalid": error,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => updateField(field.field, event.target.value),
    };

    if (field.kind === "textarea") {
      return (
        <textarea
          {...sharedProps}
          autoComplete={field.autoComplete}
          className={fieldClass(error, "textarea")}
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
        className={fieldClass(error)}
      />
    );

    if (field.kind !== "cep") {
      return input;
    }

    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        {input}
        <button
          type="button"
          disabled={cepLookupStatus === "loading"}
          onClick={handleCepLookup}
          className="h-11 shrink-0 rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cepLookupStatus === "loading" ? "Buscando..." : "Buscar"}
        </button>
      </div>
    );
  }
}

function Field({
  children,
  className = "",
  error,
  label,
  name,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  label: string;
  name: InitiativeFormField;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-[var(--color-app-foreground)]">
        {label}
        <span aria-hidden="true"> *</span>
      </span>
      {children}
      {error ? (
        <p className="mt-2 text-sm font-medium text-red-400" id={`${name}-error`}>
          {error}
        </p>
      ) : null}
    </label>
  );
}

function fieldClass(hasError: boolean, variant: "input" | "textarea" = "input") {
  const size = variant === "textarea" ? "min-h-24 px-3 py-2" : "h-11 px-3";

  return `${size} w-full rounded-md border bg-[var(--color-app-background)] text-[var(--color-app-foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-link-hover)] focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
    hasError ? "border-red-400" : "border-[var(--color-header-border)]"
  }`;
}
