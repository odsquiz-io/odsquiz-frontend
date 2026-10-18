"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, ReactNode, SyntheticEvent } from "react";
import { useState } from "react";
import { flushSync } from "react-dom";
import { OdsBand } from "@/components/OdsBand";
import {
  control,
  controlBorder,
  focusRing,
  primaryButton,
  secondaryButton,
  selectChevron,
  surface,
} from "@/components/styles";
import { storeAuthToken } from "@/lib/auth";
import type { Coordinates } from "@/lib/cep";
import { lookupCep, states } from "@/lib/cep";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

type AuthField = "name" | "email" | "password" | "cep" | "address" | "city" | "state";

type AuthFieldErrors = Partial<Record<AuthField, string>>;

type ApiErrorCode =
  | "account_suspended"
  | "email_already_exists"
  | "internal_error"
  | "invalid_credentials"
  | "invalid_request"
  | "user_not_found";

type AuthResponse = {
  token?: string;
  access_token?: string;
  message?: string;
};

type ApiErrorPayload = {
  code?: unknown;
  error?: unknown;
};

type ApiErrorResult = {
  fieldErrors?: AuthFieldErrors;
  message: string;
};

const duplicateEmailMessage = "Já existe uma conta com este e-mail.";
const invalidCredentialsMessage = "E-mail ou senha incorretos.";
const unavailableMessage =
  "O serviço de contas está indisponível no momento. Tente de novo em instantes.";

function invalidRequestMessage(mode: AuthMode) {
  return mode === "signup"
    ? "Confira os dados do cadastro e tente de novo."
    : "Confira seu e-mail e sua senha e tente de novo.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getApiErrorCode(payload: unknown): ApiErrorCode | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const { code } = payload as ApiErrorPayload;

  if (
    code === "account_suspended" ||
    code === "email_already_exists" ||
    code === "internal_error" ||
    code === "invalid_credentials" ||
    code === "invalid_request" ||
    code === "user_not_found"
  ) {
    return code;
  }

  return undefined;
}

function getFallbackErrorMessage(status: number, mode: AuthMode) {
  if (status === 400 || status === 422) {
    return invalidRequestMessage(mode);
  }

  if (status === 401 || status === 403 || (status === 404 && mode === "login")) {
    return invalidCredentialsMessage;
  }

  if (status === 409 && mode === "signup") {
    return duplicateEmailMessage;
  }

  if (status === 429) {
    return "Muitas tentativas seguidas. Espere um pouco e tente de novo.";
  }

  if (status >= 500) {
    return unavailableMessage;
  }

  return "Não foi possível concluir o seu pedido. Tente de novo.";
}

function getApiErrorResult(
  response: Response,
  payload: unknown,
  mode: AuthMode,
): ApiErrorResult {
  const code = getApiErrorCode(payload);

  if (code === "account_suspended") {
    return {
      message:
        "Esta conta foi suspensa pela moderação do ODS Quiz e não pode entrar no momento.",
    };
  }

  if (code === "email_already_exists") {
    return {
      fieldErrors: mode === "signup" ? { email: duplicateEmailMessage } : undefined,
      message:
        mode === "signup" ? "Corrija os campos destacados." : duplicateEmailMessage,
    };
  }

  if (code === "invalid_credentials") {
    return { message: invalidCredentialsMessage };
  }

  if (code === "invalid_request") {
    return { message: invalidRequestMessage(mode) };
  }

  if (code === "user_not_found") {
    return { message: "Não encontramos essa conta." };
  }

  if (code === "internal_error") {
    return { message: unavailableMessage };
  }

  return { message: getFallbackErrorMessage(response.status, mode) };
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

function validateAuthForm({
  address,
  cepDigits,
  city,
  email,
  isSignup,
  name,
  password,
  state,
}: {
  address: string;
  cepDigits: string;
  city: string;
  email: string;
  isSignup: boolean;
  name: string;
  password: string;
  state: string;
}) {
  const errors: AuthFieldErrors = {};
  const trimmedEmail = email.trim();

  if (isSignup && !name.trim()) {
    errors.name = "Informe seu nome.";
  }

  if (!trimmedEmail) {
    errors.email = "Informe seu e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Digite um e-mail válido, como nome@exemplo.com.";
  }

  if (!password) {
    errors.password = "Informe sua senha.";
  } else if (password.length < 5) {
    errors.password = "A senha precisa ter pelo menos 5 caracteres.";
  }

  if (isSignup && cepDigits.length !== 8) {
    errors.cep = "Informe um CEP com 8 números.";
  }

  if (isSignup && !address.trim()) {
    errors.address = "Informe seu endereço.";
  }

  if (isSignup && !city.trim()) {
    errors.city = "Informe sua cidade.";
  }

  if (isSignup && !state) {
    errors.state = "Selecione seu estado.";
  }

  return errors;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates>();
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  const [cepMessage, setCepMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  const endpoint = isSignup ? "/signup" : "/login";
  const alternateHref = isSignup ? "/login" : "/signup";
  const alternateText = isSignup ? "Já tem conta?" : "Ainda não tem conta?";
  const alternateAction = isSignup ? "Entre" : "Cadastre-se";

  function clearFieldError(field: AuthField) {
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
    setCepMessage("");
    setCoordinates(undefined);
    setIsLookingUpCep(true);

    try {
      const found = await lookupCep(cep);
      const street = [found.street, found.district].filter(Boolean).join(", ");

      setAddress((currentAddress) => street || currentAddress);
      setCity((currentCity) => found.city || currentCity);
      setState((currentState) => found.state || currentState);
      setCoordinates(found.coordinates);
      clearFieldError("cep");
      clearFieldError("address");
      clearFieldError("city");
      clearFieldError("state");
      setCepMessage(
        street
          ? "Endereço encontrado. Confira e acrescente o número."
          : "Cidade encontrada. Preencha a rua, o número e o bairro.",
      );
    } catch (error) {
      flushSync(() =>
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          cep: error instanceof Error ? error.message : "Não foi possível buscar esse CEP.",
        })),
      );
      document.getElementById("auth-cep")?.focus();
    } finally {
      setIsLookingUpCep(false);
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setMessage("");

    const cepDigits = cep.replace(/\D/g, "");
    const validationErrors = validateAuthForm({
      address,
      cepDigits,
      city,
      email,
      isSignup,
      name,
      password,
      state,
    });

    if (Object.keys(validationErrors).length > 0) {
      // Commits the errors first so the focused field already announces its message.
      flushSync(() => setFieldErrors(validationErrors));
      event.currentTarget
        .querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }

    setFieldErrors({});
    setStatus("submitting");

    const body = isSignup
      ? { name, email, password, address, cep: cepDigits, city, state, ...coordinates }
      : { email, password };

    try {
      const response = await fetch(`/api/auth${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await readResponse(response);

      if (!response.ok) {
        const apiError = getApiErrorResult(response, payload, mode);

        setStatus("idle");
        setFieldErrors(apiError.fieldErrors ?? {});
        setMessage(apiError.message);
        return;
      }

      const authPayload = payload as AuthResponse;
      const token = authPayload.token ?? authPayload.access_token;

      if (token) {
        storeAuthToken(token);
      }

      setStatus("success");
      setMessage(
        authPayload.message ??
          (isSignup
            ? "Conta criada! Agora é só entrar."
            : "Tudo certo, você entrou na sua conta."),
      );

      window.setTimeout(() => {
        router.push(isSignup ? "/login" : "/");
      }, 700);
    } catch (error) {
      setStatus("idle");
      setMessage(
        error instanceof TypeError
          ? "Não foi possível conectar ao serviço de contas. Tente de novo."
          : error instanceof Error
            ? error.message
            : "Algo deu errado. Tente de novo.",
      );
    }
  }

  return (
    <div className={`overflow-hidden ${surface}`}>
      <OdsBand className="h-1.5" />

      <form className="p-6 sm:p-8" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-5">
          {isSignup ? (
            <Field
              autoComplete="name"
              error={fieldErrors.name}
              field="name"
              label="Nome"
              type="text"
              value={name}
              onChange={(value) => {
                setName(value);
                clearFieldError("name");
              }}
            />
          ) : null}

          <Field
            autoComplete="email"
            error={fieldErrors.email}
            field="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              clearFieldError("email");
            }}
          />

          <Field
            autoComplete={isSignup ? "new-password" : "current-password"}
            error={fieldErrors.password}
            field="password"
            hint={isSignup ? "Use pelo menos 5 caracteres." : undefined}
            label="Senha"
            minLength={5}
            type="password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              clearFieldError("password");
            }}
          />

          {isSignup ? (
            <>
              <Field
                action={
                  <button
                    type="button"
                    disabled={isLookingUpCep}
                    onClick={handleCepLookup}
                    className={`shrink-0 ${secondaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {isLookingUpCep ? "Buscando…" : "Buscar"}
                  </button>
                }
                autoComplete="postal-code"
                error={fieldErrors.cep}
                field="cep"
                hint="Digite os 8 números e clique em Buscar para preencher o endereço, a cidade e o estado."
                inputMode="numeric"
                label="CEP"
                type="text"
                value={cep}
                onChange={(value) => {
                  setCep(value);
                  setCoordinates(undefined);
                  setCepMessage("");
                  clearFieldError("cep");
                }}
              >
                <p
                  role="status"
                  className={
                    cepMessage
                      ? "mt-2 text-sm font-semibold text-[var(--color-success)]"
                      : undefined
                  }
                >
                  {cepMessage}
                </p>
              </Field>

              <Field
                autoComplete="street-address"
                error={fieldErrors.address}
                field="address"
                hint="Depois de buscar o CEP, acrescente o número e, se houver, o complemento."
                label="Endereço"
                type="text"
                value={address}
                onChange={(value) => {
                  setAddress(value);
                  clearFieldError("address");
                }}
              />

              <Field
                autoComplete="address-level2"
                error={fieldErrors.city}
                field="city"
                label="Cidade"
                type="text"
                value={city}
                onChange={(value) => {
                  setCity(value);
                  clearFieldError("city");
                }}
              />

              <Field
                autoComplete="address-level1"
                error={fieldErrors.state}
                field="state"
                label="Estado"
                options={states}
                value={state}
                onChange={(value) => {
                  setState(value);
                  clearFieldError("state");
                }}
              />
            </>
          ) : null}
        </div>

        <div aria-live="polite">
          {message ? (
            <p
              className={`mt-6 border-l-4 py-1 pl-3 text-sm font-semibold ${
                status === "success"
                  ? "border-[var(--color-success)] text-[var(--color-success)]"
                  : "border-[var(--color-error)] text-[var(--color-error)]"
              }`}
            >
              {message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className={`mt-6 w-full ${primaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {status === "submitting"
            ? isSignup
              ? "Criando conta…"
              : "Entrando…"
            : isSignup
              ? "Criar conta"
              : "Entrar"}
        </button>
      </form>

      <p className="border-t border-[var(--color-header-border)] px-6 py-5 text-[var(--color-muted)] sm:px-8">
        {alternateText}{" "}
        <Link
          href={alternateHref}
          className={`font-bold text-[var(--color-app-foreground)] underline underline-offset-4 transition hover:text-[var(--color-link-hover)] ${focusRing}`}
        >
          {alternateAction}
        </Link>
      </p>
    </div>
  );
}

function Field({
  action,
  autoComplete,
  children,
  error,
  field,
  hint,
  inputMode,
  label,
  minLength,
  onChange,
  options,
  type,
  value,
}: {
  action?: ReactNode;
  autoComplete: string;
  children?: ReactNode;
  error?: string;
  field: AuthField;
  hint?: string;
  inputMode?: "numeric";
  label: string;
  minLength?: number;
  onChange: (value: string) => void;
  options?: string[];
  type?: "email" | "password" | "text";
  value: string;
}) {
  const id = `auth-${field}`;
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
    .filter(Boolean)
    .join(" ");
  const controlProps = {
    required: true,
    id,
    name: field,
    autoComplete,
    value,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy || undefined,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(event.target.value),
  };
  const controlClassName = `${control} ${controlBorder(Boolean(error))}`;

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
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        {options ? (
          <div className="relative w-full">
            <select {...controlProps} className={`${controlClassName} appearance-none pr-12`}>
              <option value="" disabled>
                Selecione
              </option>
              {options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className={selectChevron}
            />
          </div>
        ) : (
          <input
            {...controlProps}
            type={type}
            inputMode={inputMode}
            minLength={minLength}
            className={controlClassName}
          />
        )}
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
