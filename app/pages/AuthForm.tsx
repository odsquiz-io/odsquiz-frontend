"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SyntheticEvent } from "react";
import { useState } from "react";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

type AuthField = "name" | "email" | "password" | "address";

type AuthFieldErrors = Partial<Record<AuthField, string>>;

type ApiErrorCode =
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

function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return undefined;
  }

  return apiUrl.replace(/\/$/, "");
}

const duplicateEmailMessage = "A user already exists with that email.";
const invalidCredentialsMessage = "Invalid email or password.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getApiErrorCode(payload: unknown): ApiErrorCode | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const { code } = payload as ApiErrorPayload;

  if (
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
    return mode === "signup"
      ? "Please check your signup information and try again."
      : "Please check your email and password and try again.";
  }

  if (status === 401 || status === 403 || (status === 404 && mode === "login")) {
    return invalidCredentialsMessage;
  }

  if (status === 409 && mode === "signup") {
    return duplicateEmailMessage;
  }

  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "The authentication service is unavailable. Please try again soon.";
  }

  return "We could not process your request. Please try again.";
}

function getApiErrorResult(
  response: Response,
  payload: unknown,
  mode: AuthMode,
): ApiErrorResult {
  const code = getApiErrorCode(payload);

  if (code === "email_already_exists") {
    return {
      fieldErrors: mode === "signup" ? { email: duplicateEmailMessage } : undefined,
      message:
        mode === "signup"
          ? "Please fix the highlighted fields."
          : duplicateEmailMessage,
    };
  }

  if (code === "invalid_credentials") {
    return { message: invalidCredentialsMessage };
  }

  if (code === "invalid_request") {
    return {
      message:
        mode === "signup"
          ? "Please check your signup information and try again."
          : "Please check your email and password and try again.",
    };
  }

  if (code === "user_not_found") {
    return { message: "The requested user could not be found." };
  }

  if (code === "internal_error") {
    return {
      message: "The authentication service is unavailable. Please try again soon.",
    };
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
  email,
  isSignup,
  name,
  password,
}: {
  address: string;
  email: string;
  isSignup: boolean;
  name: string;
  password: string;
}) {
  const errors: AuthFieldErrors = {};
  const trimmedEmail = email.trim();

  if (isSignup && !name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!trimmedEmail) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Please enter a valid email.";
  }

  if (!password) {
    errors.password = "Please enter your password.";
  } else if (password.length < 5) {
    errors.password = "Password must be at least 5 characters.";
  }

  if (isSignup && !address.trim()) {
    errors.address = "Please enter your address.";
  }

  return errors;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  const title = isSignup ? "Crie sua conta" : "Login";
  const endpoint = isSignup ? "/signup" : "/login";
  const alternateHref = isSignup ? "/login" : "/signup";
  const alternateText = isSignup
    ? "Already have an account?"
    : "Need an account?";
  const alternateAction = isSignup ? "Login" : "Sign up";

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

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setMessage("");

    const validationErrors = validateAuthForm({
      address,
      email,
      isSignup,
      name,
      password,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setStatus("submitting");

    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      setStatus("idle");
      setMessage("The authentication service is not configured.");
      return;
    }

    const body = isSignup
      ? { name, email, password, address }
      : { email, password };

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
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
        window.localStorage.setItem("odsquiz-auth-token", token);
      }

      setStatus("success");
      setMessage(
        authPayload.message ??
          (isSignup ? "Account created successfully." : "Logged in successfully."),
      );

      window.setTimeout(() => {
        router.push(isSignup ? "/login" : "/");
      }, 700);
    } catch (error) {
      setStatus("idle");
      setMessage(
        error instanceof TypeError
          ? "Could not connect to the authentication service. Please try again."
          : error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <section className="flex min-h-screen items-start justify-center px-3 pb-10 pt-28 sm:px-6 sm:py-32">
      <div className="w-full max-w-[28rem] rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 shadow-2xl shadow-black/20 sm:p-8">
        <div className="mb-6 sm:mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-link-hover)]">
            ODS Quiz
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[var(--color-app-foreground)] sm:text-3xl">
            {title}
          </h1>
        </div>

        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          {isSignup ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-app-foreground)]">
                Name
              </span>
              <input
                required
                type="text"
                autoComplete="name"
                value={name}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
                className={`h-11 w-full rounded-md border bg-[var(--color-app-background)] px-3 text-[var(--color-app-foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-link-hover)] focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
                  fieldErrors.name
                    ? "border-red-400"
                    : "border-[var(--color-header-border)]"
                }`}
              />
              {fieldErrors.name ? (
                <p className="mt-2 text-sm font-medium text-red-400" id="name-error">
                  {fieldErrors.name}
                </p>
              ) : null}
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-app-foreground)]">
              Email
            </span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              className={`h-11 w-full rounded-md border bg-[var(--color-app-background)] px-3 text-[var(--color-app-foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-link-hover)] focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
                fieldErrors.email
                  ? "border-red-400"
                  : "border-[var(--color-header-border)]"
              }`}
            />
            {fieldErrors.email ? (
              <p className="mt-2 text-sm font-medium text-red-400" id="email-error">
                {fieldErrors.email}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-app-foreground)]">
              Password
            </span>
            <input
              required
              minLength={5}
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              className={`h-11 w-full rounded-md border bg-[var(--color-app-background)] px-3 text-[var(--color-app-foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-link-hover)] focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
                fieldErrors.password
                  ? "border-red-400"
                  : "border-[var(--color-header-border)]"
              }`}
            />
            {fieldErrors.password ? (
              <p
                className="mt-2 text-sm font-medium text-red-400"
                id="password-error"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </label>

          {isSignup ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-app-foreground)]">
                Address
              </span>
              <input
                required
                type="text"
                autoComplete="street-address"
                value={address}
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={fieldErrors.address ? "address-error" : undefined}
                onChange={(event) => {
                  setAddress(event.target.value);
                  clearFieldError("address");
                }}
                className={`h-11 w-full rounded-md border bg-[var(--color-app-background)] px-3 text-[var(--color-app-foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-link-hover)] focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
                  fieldErrors.address
                    ? "border-red-400"
                    : "border-[var(--color-header-border)]"
                }`}
              />
              {fieldErrors.address ? (
                <p
                  className="mt-2 text-sm font-medium text-red-400"
                  id="address-error"
                >
                  {fieldErrors.address}
                </p>
              ) : null}
            </label>
          ) : null}

          {message ? (
            <p
            className={`text-sm font-medium ${
              status === "success" ? "text-emerald-400" : "text-red-400"
            }`}
              role="status"
            >
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="mt-2 h-11 w-full rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting"
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-app-foreground)]">
          {alternateText}{" "}
          <Link
            href={alternateHref}
            className="font-bold text-[var(--color-link-hover)] transition hover:underline"
          >
            {alternateAction}
          </Link>
        </p>
      </div>
    </section>
  );
}
