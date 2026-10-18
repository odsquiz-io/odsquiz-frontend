import {
  AccountSuspendedError,
  isAccountSuspended,
  type SessionUser,
} from "@/components/SessionProvider";

type AccountUpdate = Pick<
  SessionUser,
  "name" | "address" | "cep" | "city" | "state" | "lat" | "lon"
>;

export async function updateAccount(account: AccountUpdate, token: string) {
  const response = await fetch("/api/auth/me", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(account),
  });

  const payload = await readPayload(response);

  if (isAccountSuspended(payload)) {
    throw new AccountSuspendedError(
      "Sua conta está suspensa, por isso não é possível salvar alterações.",
    );
  }

  if (!response.ok) {
    throw new Error(errorMessage(response.status));
  }

  return payload as SessionUser;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

// Chosen by status: the auth API replies with codes or English text, never with page copy.
function errorMessage(status: number) {
  if (status === 400) {
    return "Confira seus dados e tente de novo.";
  }

  if (status === 401) {
    return "Sua sessão expirou. Entre de novo para salvar as alterações.";
  }

  if (status === 404) {
    return "Não encontramos sua conta.";
  }

  return status >= 500
    ? "O serviço de contas está indisponível no momento. Tente de novo em instantes."
    : "Não foi possível salvar seus dados. Tente de novo.";
}
