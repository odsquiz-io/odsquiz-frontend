import { authHeader, request } from "../api";
import type { Photo } from "../types";

export const PHOTO_LIMIT = 12;

function photosUrl(initiativeId: string, path = "") {
  return `/api/initiatives/${encodeURIComponent(initiativeId)}/photos${path}`;
}

function photoUrl(initiativeId: string, photoId: string) {
  return photosUrl(initiativeId, `/${encodeURIComponent(photoId)}`);
}

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function fetchPhotos(token: string, initiativeId: string) {
  const payload = await request(
    photosUrl(initiativeId),
    { headers: authHeader(token) },
    "Não foi possível carregar as fotos.",
  );

  return Array.isArray(payload) ? (payload as Photo[]) : [];
}

export async function uploadPhoto(
  token: string,
  initiativeId: string,
  photo: Blob,
  caption?: string,
) {
  const body = new FormData();
  body.append("photo", photo, `photo.${extensions[photo.type] ?? "png"}`);

  if (caption?.trim()) {
    body.append("caption", caption.trim());
  }

  return (await request(
    photosUrl(initiativeId),
    { method: "POST", headers: authHeader(token), body },
    "Não foi possível enviar a foto.",
  )) as Photo;
}

export async function updatePhotoCaption(
  token: string,
  initiativeId: string,
  photoId: string,
  caption: string,
) {
  return (await request(
    photoUrl(initiativeId, photoId),
    {
      method: "PATCH",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({ caption: caption.trim() || null }),
    },
    "Não foi possível salvar a legenda.",
  )) as Photo;
}

export async function reorderPhotos(token: string, initiativeId: string, photoIds: string[]) {
  const payload = await request(
    photosUrl(initiativeId, "/order"),
    {
      method: "PUT",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({ photo_ids: photoIds }),
    },
    "Não foi possível mudar a ordem das fotos.",
  );

  return Array.isArray(payload) ? (payload as Photo[]) : [];
}

export async function deletePhoto(token: string, initiativeId: string, photoId: string) {
  await request(
    photoUrl(initiativeId, photoId),
    { method: "DELETE", headers: authHeader(token) },
    "Não foi possível excluir a foto.",
  );
}
