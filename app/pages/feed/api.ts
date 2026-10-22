import { AccountSuspendedError, isAccountSuspended } from "@/components/SessionProvider";
import type { Comment, Page, Post } from "./types";

type Messages = {
  fallback: string;
  invalid?: string;
};

export class FeedError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

const postMessages = {
  invalid: "Escreva a publicação com até 3.000 caracteres.",
};

const commentMessages = {
  invalid: "Escreva o comentário com até 1.000 caracteres.",
};

const codeMessages: Record<string, string> = {
  initiative_not_found: "Não encontramos esta iniciativa.",
  post_not_found: "Esta publicação não está mais disponível.",
  comment_not_found: "Este comentário não está mais disponível.",
  forbidden: "Você não tem permissão para fazer isso.",
};

export function fetchFeed(token: string, cursor?: string) {
  return fetchPage<Post>(withCursor("/api/initiatives/feed", cursor), token, {
    fallback: "Não foi possível carregar as atividades.",
  });
}

export function fetchInitiativePosts(token: string, initiativeId: string, cursor?: string) {
  return fetchPage<Post>(withCursor(`${initiativePath(initiativeId)}/posts`, cursor), token, {
    fallback: "Não foi possível carregar as atividades desta iniciativa.",
  });
}

export async function createPost(token: string, initiativeId: string, body: string) {
  return (await request(`${initiativePath(initiativeId)}/posts`, token, {
    ...postMessages,
    fallback: "Não foi possível publicar. Tente de novo.",
  }, { method: "POST", body: JSON.stringify({ body }) })) as Post;
}

export async function updatePost(token: string, postId: string, body: string) {
  return (await request(postPath(postId), token, {
    ...postMessages,
    fallback: "Não foi possível salvar a publicação. Tente de novo.",
  }, { method: "PATCH", body: JSON.stringify({ body }) })) as Post;
}

export async function deletePost(token: string, postId: string) {
  await request(postPath(postId), token, {
    fallback: "Não foi possível excluir a publicação. Tente de novo.",
  }, { method: "DELETE" });
}

export function fetchComments(token: string, postId: string, cursor?: string) {
  return fetchPage<Comment>(withCursor(`${postPath(postId)}/comments`, cursor), token, {
    fallback: "Não foi possível carregar os comentários.",
  });
}

export async function createComment(token: string, postId: string, body: string) {
  return (await request(`${postPath(postId)}/comments`, token, {
    ...commentMessages,
    fallback: "Não foi possível enviar o comentário. Tente de novo.",
  }, { method: "POST", body: JSON.stringify({ body }) })) as Comment;
}

export async function updateComment(token: string, commentId: string, body: string) {
  return (await request(commentPath(commentId), token, {
    ...commentMessages,
    fallback: "Não foi possível salvar o comentário. Tente de novo.",
  }, { method: "PATCH", body: JSON.stringify({ body }) })) as Comment;
}

export async function deleteComment(token: string, commentId: string) {
  await request(commentPath(commentId), token, {
    fallback: "Não foi possível excluir o comentário. Tente de novo.",
  }, { method: "DELETE" });
}

export function isGone(error: unknown) {
  return (
    error instanceof FeedError &&
    (error.code === "post_not_found" || error.code === "comment_not_found")
  );
}

export function errorMessage(error: unknown, fallback: string) {
  if (error instanceof TypeError) {
    return "Não foi possível conectar ao servidor. Confira sua conexão e tente de novo.";
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

async function fetchPage<T>(url: string, token: string, messages: Messages): Promise<Page<T>> {
  const payload = await request(url, token, messages);

  if (!isRecord(payload)) {
    return { items: [], next_cursor: null };
  }

  return {
    items: Array.isArray(payload.items) ? (payload.items as T[]) : [],
    next_cursor:
      typeof payload.next_cursor === "string" && payload.next_cursor
        ? payload.next_cursor
        : null,
  };
}

async function request(url: string, token: string, messages: Messages, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const payload = await readPayload(response);

  if (!response.ok) {
    throw errorFrom(response.status, payload, messages);
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
function errorFrom(status: number, payload: unknown, { fallback, invalid }: Messages) {
  if (isAccountSuspended(payload)) {
    return new AccountSuspendedError(
      "Sua conta está suspensa, por isso não é possível publicar nem comentar.",
    );
  }

  if (status === 401) {
    return new FeedError("Sua sessão expirou. Entre de novo para continuar.", "unauthorized");
  }

  const code = isRecord(payload) && typeof payload.code === "string" ? payload.code : undefined;

  if (code === "invalid_request" && invalid) {
    return new FeedError(invalid, code);
  }

  if (code && code in codeMessages) {
    return new FeedError(codeMessages[code], code);
  }

  if (status === 403) {
    return new FeedError(codeMessages.forbidden, "forbidden");
  }

  if (status >= 500) {
    return new FeedError(
      "O serviço de iniciativas está indisponível no momento. Tente de novo em instantes.",
      code,
    );
  }

  return new FeedError(fallback, code);
}

function withCursor(path: string, cursor?: string) {
  return cursor ? `${path}?cursor=${encodeURIComponent(cursor)}` : path;
}

function initiativePath(id: string) {
  return `/api/initiatives/${encodeURIComponent(id)}`;
}

function postPath(id: string) {
  return `/api/initiatives/posts/${encodeURIComponent(id)}`;
}

function commentPath(id: string) {
  return `/api/initiatives/comments/${encodeURIComponent(id)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
