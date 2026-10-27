import { type ChangeEvent, type Ref, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AccountSuspendedError, useSession } from "@/components/SessionProvider";
import { focusRing, primaryButton } from "@/components/styles";
import { RequestError } from "../api";
import { Feedback } from "../InitiativesList";
import {
  deletePhoto,
  fetchPhotos,
  PHOTO_LIMIT,
  reorderPhotos,
  updatePhotoCaption,
  uploadPhoto,
} from "../photos/api";
import type { Photo } from "../types";
import { focusAfterRemoval } from "./focus";
import { IMAGE_TYPES, preparePhoto } from "./image";
import { type MoveAction, PhotoCard } from "./PhotoCard";
import { type Result, ResultMessage, resultFrom } from "./ResultMessage";
import { panelIntro, panelTitle, rowButton } from "./styles";

type Upload = {
  key: number;
  name: string;
  status: "waiting" | "preparing" | "sending" | "failed";
  error?: string;
};

type Loaded = { photos?: Photo[]; error?: string };

const uploadLabels = {
  waiting: "Na fila",
  preparing: "Preparando a imagem...",
  sending: "Enviando...",
};

function plural(count: number, one: string, many: string) {
  return count === 1 ? one : many.replace("#", String(count));
}

function uploadSummary(sent: number, total: number, skipped: number): Result {
  const failed = total - sent;
  const parts = [
    sent > 0 ? plural(sent, "1 foto enviada.", "# fotos enviadas.") : "",
    failed > 0
      ? plural(
          failed,
          "1 foto não foi enviada. Veja o motivo abaixo.",
          "# fotos não foram enviadas. Veja os motivos abaixo.",
        )
      : "",
    skipped > 0
      ? `O limite é de ${PHOTO_LIMIT} fotos, então ${plural(skipped, "1 ficou", "# ficaram")} de fora.`
      : "",
  ];

  return {
    tone: failed > 0 || skipped > 0 ? "error" : "success",
    text: parts.filter(Boolean).join(" "),
  };
}

function indexOfPhoto(photos?: Photo[], photo?: Photo) {
  return photos && photo ? photos.findIndex(({ id }) => id === photo.id) : -1;
}

export function PhotosPanel({
  initiativeId,
  token,
}: {
  initiativeId: string;
  token: string;
}) {
  const { signOutSuspended } = useSession();
  const [loaded, setLoaded] = useState<Loaded>();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [progress, setProgress] = useState("");
  const [reordering, setReordering] = useState(false);
  const [deleting, setDeleting] = useState<Photo>();
  const [result, setResult] = useState<Result>();
  const inputRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const uploadsRef = useRef<HTMLUListElement>(null);
  const emptyRef = useRef<HTMLDivElement>(null);
  const nextKey = useRef(0);

  useEffect(() => {
    let isCurrent = true;

    fetchPhotos(token, initiativeId)
      .then((photos) => {
        if (isCurrent) {
          setLoaded({ photos });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoaded({ error: resultFrom(error).text });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [initiativeId, token]);

  const photos = loaded?.photos;
  const uploading = uploads.some(({ status }) => status !== "failed");
  const full = (photos?.length ?? 0) >= PHOTO_LIMIT;
  const deletingIndex = indexOfPhoto(photos, deleting);

  function updatePhotos(change: (photos: Photo[]) => Photo[]) {
    setLoaded((current) => (current?.photos ? { photos: change(current.photos) } : current));
  }

  function updateUploads(keys: number[], change: Partial<Upload>) {
    setUploads((current) =>
      current.map((upload) => (keys.includes(upload.key) ? { ...upload, ...change } : upload)),
    );
  }

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!photos || files.length === 0 || uploading) {
      return;
    }

    const accepted = files.slice(0, Math.max(0, PHOTO_LIMIT - photos.length));
    const batch = accepted.map((file) => ({ file, key: nextKey.current++ }));
    let sent = 0;

    setResult(undefined);
    setProgress(plural(batch.length, "Enviando 1 foto.", "Enviando # fotos."));
    setUploads(batch.map(({ file, key }) => ({ key, name: file.name, status: "waiting" })));

    for (const [position, { file, key }] of batch.entries()) {
      try {
        updateUploads([key], { status: "preparing" });
        const blob = await preparePhoto(file);
        updateUploads([key], { status: "sending" });
        const photo = await uploadPhoto(token, initiativeId, blob);

        sent += 1;
        updatePhotos((current) => [...current, photo]);
        setUploads((current) => current.filter((upload) => upload.key !== key));
      } catch (error) {
        if (error instanceof AccountSuspendedError) {
          signOutSuspended();
          return;
        }

        const failure = { status: "failed" as const, error: resultFrom(error).text };

        if (error instanceof RequestError && error.code === "photo_limit_reached") {
          updateUploads(batch.slice(position).map((item) => item.key), failure);
          break;
        }

        updateUploads([key], failure);
      }
    }

    setProgress("");
    setResult(uploadSummary(sent, batch.length, files.length - accepted.length));
  }

  function dismiss(upload: Upload) {
    const index = uploads
      .filter(({ status }) => status === "failed")
      .findIndex(({ key }) => key === upload.key);

    flushSync(() => setUploads((current) => current.filter(({ key }) => key !== upload.key)));
    focusAfterRemoval(uploadsRef.current, index, addRef.current);
  }

  function focusInCard(photoId: string, action: MoveAction) {
    const card = Array.from(listRef.current?.children ?? []).find(
      (item) => item instanceof HTMLElement && item.dataset.photoId === photoId,
    );
    const button = [action, "previous", "next", "caption", "delete"]
      .map((name) => card?.querySelector<HTMLButtonElement>(`[data-action="${name}"]`))
      .find((candidate) => candidate && !candidate.disabled);

    button?.focus();
  }

  async function move(photo: Photo, to: number, action: MoveAction) {
    if (!photos || reordering || uploading) {
      return;
    }

    const order = photos.filter(({ id }) => id !== photo.id);
    order.splice(to, 0, photo);

    setReordering(true);
    setResult(undefined);

    try {
      const saved = await reorderPhotos(
        token,
        initiativeId,
        order.map(({ id }) => id),
      );

      flushSync(() => {
        setLoaded({ photos: saved });
        setResult({
          tone: "success",
          text:
            to === 0
              ? "Foto definida como capa."
              : `Foto movida para a posição ${to + 1} de ${saved.length}.`,
        });
      });
      focusInCard(photo.id, action);
    } catch (error) {
      if (error instanceof AccountSuspendedError) {
        signOutSuspended();
        return;
      }

      if (error instanceof RequestError && error.code === "invalid_request") {
        setResult({
          tone: "error",
          text: "As fotos mudaram em outra janela. Confira a ordem atual e tente de novo.",
        });
        fetchPhotos(token, initiativeId)
          .then((current) => setLoaded({ photos: current }))
          .catch(() => undefined);
        return;
      }

      setResult(resultFrom(error));
    } finally {
      setReordering(false);
    }
  }

  async function saveCaption(photo: Photo, caption: string) {
    try {
      const saved = await updatePhotoCaption(token, initiativeId, photo.id, caption);

      updatePhotos((current) =>
        current.map((item) => (item.id === saved.id ? { ...item, caption: saved.caption } : item)),
      );
      setResult({
        tone: "success",
        text: saved.caption ? "Legenda salva." : "Legenda removida.",
      });
    } catch (error) {
      if (error instanceof AccountSuspendedError) {
        signOutSuspended();
      }

      throw error;
    }
  }

  async function remove(photo: Photo) {
    const index = indexOfPhoto(photos, photo);

    try {
      await deletePhoto(token, initiativeId, photo.id);
    } catch (error) {
      if (error instanceof AccountSuspendedError) {
        signOutSuspended();
        return;
      }

      if (!(error instanceof RequestError && error.code === "photo_not_found")) {
        throw error;
      }
    }

    flushSync(() => {
      updatePhotos((current) =>
        current
          .filter(({ id }) => id !== photo.id)
          .map((item, position) => ({ ...item, position })),
      );
      setDeleting(undefined);
      setResult({
        tone: "success",
        text:
          index === 0 && photos && photos.length > 1
            ? "Foto excluída. A próxima foto agora é a capa."
            : "Foto excluída.",
      });
    });
    focusAfterRemoval(listRef.current, index, emptyRef.current ?? addRef.current);
  }

  return (
    <section aria-labelledby="photos-title">
      <h2 id="photos-title" className={panelTitle}>
        Fotos
      </h2>
      <p className={panelIntro}>
        A primeira foto é a capa, no topo da página pública. Envie até{" "}
        {PHOTO_LIMIT} fotos em PNG, JPG ou WebP: antes do envio, cada uma é
        reduzida para até 1.600 pixels no lado maior.
      </p>

      {!loaded ? (
        <Feedback className="mt-8 max-w-3xl" tone="loading">
          Carregando fotos...
        </Feedback>
      ) : !photos ? (
        <Feedback className="mt-8 max-w-3xl" tone="error">
          {loaded.error} Atualize a página para tentar de novo.
        </Feedback>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            multiple
            hidden
            onChange={choose}
          />

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              ref={addRef}
              type="button"
              aria-disabled={uploading || full || undefined}
              aria-describedby={full ? "photos-full" : undefined}
              onClick={() => {
                if (!uploading && !full) {
                  inputRef.current?.click();
                }
              }}
              className={`${primaryButton} aria-disabled:opacity-60 ${
                uploading ? "aria-disabled:cursor-wait" : "aria-disabled:cursor-not-allowed"
              }`}
            >
              {uploading ? "Enviando fotos..." : "Adicionar fotos"}
            </button>
            <p className="text-[var(--color-muted)]">
              <span className="font-bold tabular-nums text-[var(--color-app-foreground)]">
                {photos.length} de {PHOTO_LIMIT}
              </span>{" "}
              fotos
            </p>
          </div>
          {full ? (
            <p id="photos-full" className="mt-3 text-sm text-[var(--color-muted)]">
              Você chegou ao limite de {PHOTO_LIMIT} fotos. Exclua uma para enviar outra.
            </p>
          ) : null}

          <p role="status" className="sr-only">
            {progress}
          </p>
          <ResultMessage className="mt-4 max-w-3xl" result={result} />

          {uploads.length > 0 ? (
            <ul ref={uploadsRef} aria-label="Envios" className="mt-6 grid max-w-3xl gap-2">
              {uploads.map((upload) => (
                <UploadRow key={upload.key} upload={upload} onDismiss={() => dismiss(upload)} />
              ))}
            </ul>
          ) : null}

          {photos.length > 0 ? (
            <ol
              ref={listRef}
              aria-label="Fotos da iniciativa"
              className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {photos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  index={index}
                  photo={photo}
                  total={photos.length}
                  reorderBusy={reordering || uploading}
                  onMove={move}
                  onSaveCaption={saveCaption}
                  onDelete={(target) => {
                    setResult(undefined);
                    setDeleting(target);
                  }}
                />
              ))}
            </ol>
          ) : uploads.length === 0 ? (
            <EmptyState ref={emptyRef} />
          ) : null}
        </>
      )}

      {deleting ? (
        <ConfirmDialog
          title={`Excluir a foto ${deletingIndex + 1}?`}
          confirmLabel="Excluir foto"
          tone="danger"
          onClose={() => setDeleting(undefined)}
          onConfirm={() => remove(deleting)}
        >
          {deletingIndex === 0 && photos && photos.length > 1
            ? "Ela é a capa da página pública. Depois de excluída, a próxima foto passa a ser a capa."
            : "A foto sai da página pública."}{" "}
          Não é possível desfazer.
        </ConfirmDialog>
      ) : null}
    </section>
  );
}

function UploadRow({ onDismiss, upload }: { onDismiss: () => void; upload: Upload }) {
  const failed = upload.status === "failed";

  return (
    <li
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border px-4 py-3 ${
        failed ? "border-[var(--color-error)]" : "border-[var(--color-header-border)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-2.5 shrink-0 rounded-full ${
          failed
            ? "bg-[var(--color-error)]"
            : upload.status === "waiting"
              ? "bg-[var(--color-muted)]"
              : "bg-[var(--color-link-hover)] motion-safe:animate-pulse"
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{upload.name}</p>
        <p
          className={`text-sm ${
            failed ? "font-semibold text-[var(--color-error)]" : "text-[var(--color-muted)]"
          }`}
        >
          {upload.status === "failed" ? upload.error : uploadLabels[upload.status]}
        </p>
      </div>
      {failed ? (
        <button type="button" data-row-focus onClick={onDismiss} className={rowButton}>
          Dispensar<span className="sr-only"> o aviso sobre {upload.name}</span>
        </button>
      ) : null}
    </li>
  );
}

function EmptyState({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={`mt-8 grid max-w-3xl justify-items-center rounded-lg border-2 border-dashed border-[var(--color-header-border)] px-6 py-14 text-center ${focusRing}`}
    >
      <p className="text-2xl font-extrabold [font-stretch:85%]">Nenhuma foto ainda</p>
      <p className="mt-2 max-w-md leading-relaxed text-[var(--color-muted)]">
        Mostre a iniciativa em ação. A primeira foto que você enviar vira a capa
        da página pública.
      </p>
    </div>
  );
}
