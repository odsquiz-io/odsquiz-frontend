import Image from "next/image";
import { type KeyboardEvent, type SyntheticEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { control, controlBorder, focusRing, surface } from "@/components/styles";
import type { Photo } from "../types";
import { CAPTION_MAX_LENGTH, textLength } from "../validation";
import { resultFrom } from "./ResultMessage";
import { busyButton, rowButton, rowPrimaryButton } from "./styles";

export type MoveAction = "previous" | "next" | "cover";

const moveButton = `inline-flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-app-background)] disabled:pointer-events-none ${focusRing} ${busyButton}`;

export function PhotoCard({
  index,
  onDelete,
  onMove,
  onSaveCaption,
  photo,
  reorderBusy,
  total,
}: {
  index: number;
  onDelete: (photo: Photo) => void;
  onMove: (photo: Photo, to: number, action: MoveAction) => void;
  onSaveCaption: (photo: Photo, caption: string) => Promise<void>;
  photo: Photo;
  reorderBusy: boolean;
  total: number;
}) {
  const editRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const number = index + 1;
  const cover = index === 0;

  function closeEditor() {
    flushSync(() => setEditing(false));
    editRef.current?.focus();
  }

  function move(to: number, action: MoveAction) {
    if (!reorderBusy) {
      onMove(photo, to, action);
    }
  }

  return (
    <li data-photo-id={photo.id} className={`flex flex-col overflow-hidden ${surface}`}>
      <div className="relative aspect-[4/3] bg-[var(--color-theme-toggle-background)]">
        <PhotoImage url={photo.url} />
        {cover ? (
          <span
            aria-hidden="true"
            className="absolute left-3 top-3 rounded-md bg-[var(--color-app-foreground)] px-2.5 py-1 text-sm font-bold text-[var(--color-app-background)]"
          >
            Capa
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <h3 className="font-bold">
          Foto {number} <span className="font-normal text-[var(--color-muted)]">de {total}</span>
          {cover ? <span className="sr-only"> (capa)</span> : null}
        </h3>

        {editing ? (
          <CaptionEditor
            caption={photo.caption}
            id={photo.id}
            number={number}
            onCancel={closeEditor}
            onSave={async (caption) => {
              await onSaveCaption(photo, caption);
              closeEditor();
            }}
          />
        ) : (
          <p
            className={`leading-relaxed wrap-anywhere ${
              photo.caption ? "" : "text-[var(--color-muted)]"
            }`}
          >
            {photo.caption ?? "Sem legenda."}
          </p>
        )}

        <div className="mt-auto grid gap-2">
          {total > 1 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-action="previous"
                disabled={cover}
                aria-disabled={reorderBusy || undefined}
                onClick={() => move(index - 1, "previous")}
                className={moveButton}
              >
                <Arrow direction="left" />
                <span className="sr-only">Mover a foto {number} para a esquerda</span>
              </button>
              <button
                type="button"
                data-action="next"
                disabled={number === total}
                aria-disabled={reorderBusy || undefined}
                onClick={() => move(index + 1, "next")}
                className={moveButton}
              >
                <Arrow direction="right" />
                <span className="sr-only">Mover a foto {number} para a direita</span>
              </button>
              {cover ? null : (
                <button
                  type="button"
                  data-action="cover"
                  aria-disabled={reorderBusy || undefined}
                  onClick={() => move(0, "cover")}
                  className={`${rowButton} ${busyButton}`}
                >
                  Tornar capa<span className="sr-only"> a foto {number}</span>
                </button>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {editing ? null : (
              <button
                ref={editRef}
                type="button"
                data-action="caption"
                onClick={() => setEditing(true)}
                className={rowButton}
              >
                {photo.caption ? "Editar legenda" : "Adicionar legenda"}
                <span className="sr-only"> da foto {number}</span>
              </button>
            )}
            <button
              type="button"
              data-action="delete"
              data-row-focus
              onClick={() => onDelete(photo)}
              className={rowButton}
            >
              Excluir<span className="sr-only"> a foto {number}</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function PhotoImage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="grid size-full place-items-center p-4 text-center text-sm text-[var(--color-muted)]">
        Não foi possível carregar a imagem.
      </span>
    );
  }

  return (
    <Image
      src={url}
      alt=""
      fill
      unoptimized
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      onError={() => setFailed(true)}
      className="object-cover"
    />
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d={direction === "left" ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} />
    </svg>
  );
}

function CaptionEditor({
  caption,
  id,
  number,
  onCancel,
  onSave,
}: {
  caption: string | null;
  id: string;
  number: number;
  onCancel: () => void;
  onSave: (caption: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(caption ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputId = `photo-caption-${id}`;
  const length = textLength(value);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (length > CAPTION_MAX_LENGTH) {
      flushSync(() => setError("Use no máximo 200 caracteres."));
      inputRef.current?.focus();
      return;
    }

    if (value.trim() === (caption ?? "")) {
      onCancel();
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(value);
    } catch (failure) {
      flushSync(() => {
        setSaving(false);
        setError(resultFrom(failure).text);
      });
      inputRef.current?.focus();
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape" && !saving) {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <form noValidate onSubmit={submit}>
      <label htmlFor={inputId} className="block text-sm font-bold">
        Legenda<span className="sr-only"> da foto {number}</span>
        <span className="font-normal text-[var(--color-muted)]"> (opcional)</span>
      </label>
      <textarea
        ref={inputRef}
        id={inputId}
        rows={3}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-hint ${inputId}-error` : `${inputId}-hint`}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
        }}
        onKeyDown={onKeyDown}
        className={`${control} ${controlBorder(Boolean(error))} mt-2 min-h-24 py-2`}
      />
      <div className="mt-1 flex items-start justify-between gap-3 text-sm">
        <p id={`${inputId}-hint`} className="text-[var(--color-muted)]">
          Até 200 caracteres. Aparece com a foto na página pública.
        </p>
        <p
          aria-hidden="true"
          className={`tabular-nums ${
            length > CAPTION_MAX_LENGTH
              ? "font-bold text-[var(--color-error)]"
              : "text-[var(--color-muted)]"
          }`}
        >
          {length}/{CAPTION_MAX_LENGTH}
        </p>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-2 text-sm font-bold text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          aria-disabled={saving || undefined}
          className={`${rowPrimaryButton} ${busyButton}`}
        >
          {saving ? "Salvando..." : "Salvar legenda"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className={`${rowButton} ${busyButton}`}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
