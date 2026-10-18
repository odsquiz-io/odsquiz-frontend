export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  city: string | null;
  state: string | null;
  role: "user" | "admin";
  created_at: string;
  suspended_at: string | null;
  suspension_reason: string | null;
  quizzes: number;
  initiatives: number;
};

export type AdminInitiative = {
  id: string;
  name: string;
  type: string;
  main_ods: number;
  acting_area: string;
  address: string;
  cep: string;
  city: string | null;
  state: string | null;
  impact: number;
  created_at: string;
  suspended_at: string | null;
  suspension_reason: string | null;
  owner: { id: string; name: string; email: string } | null;
};

export type AdminAction = {
  id: string;
  action: string;
  target_type: "user" | "initiative";
  target_id: string;
  target_label: string | null;
  reason: string | null;
  created_at: string;
  admin: { id: string; name: string; email: string };
};

export const PAGE_SIZE = 25;

type Subject = "list" | "user" | "initiative";

export class AdminApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function listPath(resource: string, filters: Record<string, string | number>) {
  const params = new URLSearchParams({ page_size: String(PAGE_SIZE) });

  for (const [key, value] of Object.entries(filters)) {
    if (value !== "") {
      params.set(key, String(value));
    }
  }

  return `/api/admin/${resource}?${params}`;
}

export async function fetchPage<T>(token: string, path: string, signal: AbortSignal) {
  return (await request(token, path, "list", { signal })) as Page<T>;
}

export function suspendUser(token: string, id: string, reason: string) {
  return send<AdminUser>(token, "user", `users/${id}/suspend`, "POST", { reason });
}

export function reactivateUser(token: string, id: string) {
  return send<AdminUser>(token, "user", `users/${id}/reactivate`, "POST");
}

export function changeUserRole(token: string, id: string, role: AdminUser["role"]) {
  return send<AdminUser>(token, "user", `users/${id}/role`, "PUT", { role });
}

export function suspendInitiative(token: string, id: string, reason: string) {
  return send<AdminInitiative>(token, "initiative", `initiatives/${id}/suspend`, "POST", {
    reason,
  });
}

export function reactivateInitiative(token: string, id: string) {
  return send<AdminInitiative>(token, "initiative", `initiatives/${id}/reactivate`, "POST");
}

async function send<T>(
  token: string,
  subject: Subject,
  path: string,
  method: string,
  body?: object,
) {
  return (await request(token, `/api/admin/${path}`, subject, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })) as T;
}

async function request(token: string, url: string, subject: Subject, init: RequestInit) {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (init.signal?.aborted) {
      throw error;
    }

    throw new AdminApiError(
      0,
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.",
    );
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    const code = isRecord(payload) && typeof payload.code === "string" ? payload.code : "";
    throw new AdminApiError(response.status, errorMessage(code, response.status, subject));
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

const messages: Record<string, string> = {
  unauthorized: "Sua sessão expirou. Saia e entre de novo para continuar.",
  forbidden: "Sua conta não tem mais permissão para usar o painel administrativo.",
  invalid_request: "O pedido não pôde ser processado. Confira os dados e tente de novo.",
  user_not_found: "Este usuário não foi encontrado. A lista foi atualizada.",
  initiative_not_found: "Esta iniciativa não foi encontrada. A lista foi atualizada.",
  cannot_target_self: "Você não pode suspender nem mudar o papel da sua própria conta.",
  target_is_admin:
    "Administradores não podem ser suspensos. Remova o acesso de administrador antes de suspender.",
  target_suspended:
    "Uma conta suspensa não pode receber acesso de administrador. Reative a conta antes.",
};

const conflicts: Record<Exclude<Subject, "list">, Record<string, string>> = {
  user: {
    already_suspended: "Esta conta já estava suspensa. A lista foi atualizada.",
    not_suspended: "Esta conta já estava ativa. A lista foi atualizada.",
  },
  initiative: {
    already_suspended: "Esta iniciativa já estava suspensa. A lista foi atualizada.",
    not_suspended: "Esta iniciativa já estava ativa. A lista foi atualizada.",
  },
};

function errorMessage(code: string, status: number, subject: Subject) {
  const known = (subject !== "list" && conflicts[subject][code]) || messages[code];

  if (known) {
    return known;
  }

  if (status === 401 || status === 403) {
    return messages[status === 401 ? "unauthorized" : "forbidden"];
  }

  if (status >= 500) {
    return "O serviço do painel está indisponível no momento. Tente de novo em instantes.";
  }

  return subject === "list"
    ? "Não foi possível carregar os dados. Tente de novo."
    : "Não foi possível concluir a ação. Tente de novo.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
