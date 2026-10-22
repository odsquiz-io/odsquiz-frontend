import { authHeader, request } from "../api";
import type {
  Initiative,
  InitiativeSummary,
  Invitation,
  Member,
  MembersList,
  Membership,
} from "../types";

function initiativeUrl(initiativeId: string, path = "") {
  return `/api/initiatives/${encodeURIComponent(initiativeId)}${path}`;
}

export async function uploadLogo(token: string, initiativeId: string, logo: Blob) {
  const body = new FormData();
  body.append("logo", logo, logo.type === "image/webp" ? "logo.webp" : "logo.png");

  return (await request(
    initiativeUrl(initiativeId, "/logo"),
    { method: "PUT", headers: authHeader(token), body },
    "Não foi possível enviar o logo.",
  )) as Initiative;
}

export async function removeLogo(token: string, initiativeId: string) {
  return (await request(
    initiativeUrl(initiativeId, "/logo"),
    { method: "DELETE", headers: authHeader(token) },
    "Não foi possível remover o logo.",
  )) as Initiative;
}

export async function fetchMembers(token: string, initiativeId: string) {
  return (await request(
    initiativeUrl(initiativeId, "/members"),
    { headers: authHeader(token) },
    "Não foi possível carregar os membros.",
  )) as MembersList;
}

export async function inviteMember(token: string, initiativeId: string, email: string) {
  return (await request(
    initiativeUrl(initiativeId, "/members"),
    {
      method: "POST",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    },
    "Não foi possível enviar o convite.",
  )) as Member;
}

export async function removeMember(token: string, initiativeId: string, memberId: string) {
  await request(
    initiativeUrl(initiativeId, `/members/${encodeURIComponent(memberId)}`),
    { method: "DELETE", headers: authHeader(token) },
    "Não foi possível concluir a ação.",
  );
}

export async function fetchInvitations(token: string) {
  const payload = await request(
    "/api/initiatives/invitations",
    { headers: authHeader(token) },
    "Não foi possível carregar seus convites.",
  );

  return Array.isArray(payload) ? (payload as Invitation[]) : [];
}

export async function acceptInvitation(token: string, invitationId: string) {
  return (await request(
    `/api/initiatives/invitations/${encodeURIComponent(invitationId)}/accept`,
    { method: "POST", headers: authHeader(token) },
    "Não foi possível aceitar o convite.",
  )) as { id: string; status: "active"; initiative: InitiativeSummary };
}

export async function declineInvitation(token: string, invitationId: string) {
  await request(
    `/api/initiatives/invitations/${encodeURIComponent(invitationId)}/decline`,
    { method: "POST", headers: authHeader(token) },
    "Não foi possível recusar o convite.",
  );
}

export async function fetchMemberships(token: string) {
  const payload = await request(
    "/api/initiatives/memberships",
    { headers: authHeader(token) },
    "Não foi possível carregar as iniciativas de que você participa.",
  );

  return Array.isArray(payload) ? (payload as Membership[]) : [];
}
