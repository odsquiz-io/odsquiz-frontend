import type { ChangeEvent, ReactNode, SyntheticEvent } from "react";
import { useState } from "react";
import { flushSync } from "react-dom";
import { OdsBand } from "@/components/OdsBand";
import type { SessionUser } from "@/components/SessionProvider";
import {
  control,
  controlBorder,
  primaryButton,
  secondaryButton,
  selectChevron,
  surface,
} from "@/components/styles";
import { type Coordinates, formatCep, lookupCep, states } from "@/lib/cep";
import { updateAccount } from "./api";

type AccountField = "name" | "cep" | "address" | "city" | "state";

type AccountValues = Record<AccountField, string>;

type AccountFieldErrors = Partial<Record<AccountField, string>>;

const hints: Partial<Record<AccountField, string>> = {
  cep: "Digite os 8 números e clique em Buscar para preencher o endereço, a cidade e o estado.",
};

const disabledButton = "disabled:cursor-not-allowed disabled:opacity-60";

function focusOnMount(node: HTMLElement | null) {
  node?.focus();
}

function validate(form: AccountValues) {
  const errors: AccountFieldErrors = {};

  if (!form.name.trim()) {
    errors.name = "Informe seu nome.";
  }

  if (form.cep.trim() && !/^\d{5}-?\d{3}$/.test(form.cep.trim())) {
    errors.cep = "O CEP precisa ter 8 números.";
  }

  if (form.state && !states.includes(form.state)) {
    errors.state = "Escolha um estado da lista.";
  }

  return errors;
}

export function AccountForm({
  onCancel,
  onSaved,
  token,
  user,
}: {
  onCancel: () => void;
  onSaved: (user: SessionUser) => void;
  token: string;
  user: SessionUser;
}) {
  const [form, setForm] = useState<AccountValues>({
    name: user.name,
    cep: formatCep(user.cep) ?? "",
    address: user.address,
    city: user.city,
    state: user.state,
  });
  const [coordinates, setCoordinates] = useState<Coordinates>();
  const [errors, setErrors] = useState<AccountFieldErrors>({});
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function clearError(field: AccountField) {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function update(field: AccountField, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    clearError(field);

    if (field === "cep") {
      setCoordinates(undefined);
    }
  }

  async function handleLookup() {
    setLookupMessage("");
    setLookingUp(true);

    try {
      const found = await lookupCep(form.cep);

      setForm((currentForm) => ({
        ...currentForm,
        cep: formatCep(found.cep) ?? currentForm.cep,
        address:
          [found.street, found.district].filter(Boolean).join(", ") || currentForm.address,
        city: found.city || currentForm.city,
        state: found.state || currentForm.state,
      }));
      setCoordinates(found.coordinates);
      clearError("cep");
      setLookupMessage("CEP encontrado. Confira o endereço, a cidade e o estado.");
    } catch (error) {
      const lookupError =
        error instanceof Error ? error.message : "Não foi possível buscar esse CEP.";

      setErrors((currentErrors) => ({ ...currentErrors, cep: lookupError }));
      setLookupMessage(lookupError);
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setMessage("");

    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      // Commits the errors first so the focused field already announces its message.
      flushSync(() => setErrors(validationErrors));
      event.currentTarget
        .querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const updatedUser = await updateAccount(
        {
          name: form.name.trim(),
          address: form.address.trim(),
          cep: form.cep.replace(/\D/g, ""),
          city: form.city.trim(),
          state: form.state,
          lat: coordinates?.lat ?? user.lat,
          lon: coordinates?.lon ?? user.lon,
        },
        token,
      );

      onSaved(updatedUser);
    } catch (error) {
      setSaving(false);
      setMessage(
        error instanceof TypeError
          ? "Não foi possível conectar ao serviço de contas. Tente de novo."
          : error instanceof Error
            ? error.message
            : "Algo deu errado. Tente de novo.",
      );
    }
  }

  function controlProps(field: AccountField, className = "") {
    const id = `account-${field}`;
    const error = errors[field];
    const describedBy = [hints[field] ? `${id}-hint` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ");

    return {
      id,
      name: field,
      value: form[field],
      "aria-invalid": Boolean(error),
      "aria-describedby": describedBy || undefined,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        update(field, event.target.value),
      className: `${control} ${controlBorder(Boolean(error))} ${className}`,
    };
  }

  return (
    <form className={`overflow-hidden ${surface}`} noValidate onSubmit={handleSubmit}>
      <OdsBand className="h-1.5" />

      <div className="p-6 sm:p-8">
        <div className="grid gap-5">
          <Field error={errors.name} field="name" label="Nome">
            <input
              {...controlProps("name")}
              ref={focusOnMount}
              required
              type="text"
              autoComplete="name"
            />
          </Field>

          <div>
            <p className="text-sm font-bold">E-mail</p>
            <p className="mt-2 wrap-anywhere">{user.email}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              O e-mail da conta não pode ser alterado.
            </p>
          </div>

          <Field error={errors.cep} field="cep" label="CEP">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                {...controlProps("cep", "sm:max-w-48")}
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleLookup();
                  }
                }}
              />
              <button
                type="button"
                disabled={lookingUp}
                onClick={handleLookup}
                className={`shrink-0 ${secondaryButton} ${disabledButton}`}
              >
                {lookingUp ? "Buscando..." : "Buscar"}
              </button>
            </div>
            <p role="status" className="sr-only">
              {lookupMessage}
            </p>
          </Field>

          <Field error={errors.address} field="address" label="Endereço">
            <input {...controlProps("address")} type="text" autoComplete="street-address" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
            <Field error={errors.city} field="city" label="Cidade">
              <input {...controlProps("city")} type="text" autoComplete="address-level2" />
            </Field>

            <Field error={errors.state} field="state" label="Estado">
              <div className="relative">
                <select
                  {...controlProps("state", "appearance-none pr-12")}
                  autoComplete="address-level1"
                >
                  <option value="">Selecione</option>
                  {states.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className={selectChevron}
                />
              </div>
            </Field>
          </div>
        </div>

        <div aria-live="polite">
          {message ? (
            <p className="mt-6 border-l-4 border-[var(--color-error)] py-1 pl-3 text-sm font-semibold text-[var(--color-error)]">
              {message}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className={`${primaryButton} ${disabledButton}`}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className={`${secondaryButton} ${disabledButton}`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  field,
  label,
}: {
  children: ReactNode;
  error?: string;
  field: AccountField;
  label: string;
}) {
  const id = `account-${field}`;
  const hint = hints[field];

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-[var(--color-muted)]">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
