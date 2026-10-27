"use client";

import Image from "next/image";
import { type KeyboardEvent, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { eyebrow, focusRing } from "@/components/styles";
import type { Photo } from "../types";
import { Icon } from "./Icon";
import { ManageHint } from "./ManageHint";

const lightboxButton = `inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[var(--color-header-border)] bg-[var(--color-header-background)] px-4 font-bold transition hover:border-[var(--color-link-hover)] hover:bg-[var(--color-theme-toggle-hover)] ${focusRing}`;

export function PhotoGallery({
  className = "",
  error,
  initiativeName,
  manageHref,
  photos,
  suspended,
}: {
  className?: string;
  error?: string;
  initiativeName: string;
  manageHref?: string;
  photos: Photo[];
  suspended: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbnails = useRef<Array<HTMLButtonElement | null>>([]);
  const statusId = useId();
  const [current, setCurrent] = useState<number | null>(null);
  const photo = current === null ? undefined : photos[current];

  function open(index: number) {
    flushSync(() => setCurrent(index));
    dialogRef.current?.showModal();
  }

  function step(delta: number) {
    setCurrent((index) => (index === null ? null : (index + delta + photos.length) % photos.length));
  }

  // Runs for the close button and Escape alike; focus lands on the photo last shown.
  function onClose() {
    if (current !== null) {
      thumbnails.current[current]?.focus();
    }

    setCurrent(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (photos.length > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  return (
    <section aria-labelledby="photos-title" className={className}>
      <h2 id="photos-title" className={eyebrow}>
        Fotos
      </h2>

      {suspended ? (
        <p className="mt-6 border-l-4 border-[var(--color-header-border)] py-1 pl-3 text-[var(--color-muted)]">
          As fotos ficam ocultas enquanto a iniciativa estiver suspensa.
        </p>
      ) : error ? (
        <p
          role="alert"
          className="mt-6 border-l-4 border-[var(--color-error)] py-1 pl-3 text-sm font-semibold text-[var(--color-error)]"
        >
          {error}
        </p>
      ) : photos.length === 0 ? (
        manageHref ? (
          <ManageHint href={`${manageHref}?aba=fotos`} label="adicione fotos">
            A primeira foto vira a capa desta página. Mostre o trabalho da iniciativa:
          </ManageHint>
        ) : null
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((item, index) => (
            <li key={item.id}>
              <button
                ref={(node) => {
                  thumbnails.current[index] = node;
                }}
                type="button"
                aria-haspopup="dialog"
                aria-label={`Ampliar foto ${index + 1} de ${photos.length}${item.caption ? `: ${item.caption}` : ""}`}
                onClick={() => open(index)}
                className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] ${focusRing}`}
              >
                {/* The first photo is the cover's file, already loading above. */}
                <Image
                  src={item.url}
                  alt=""
                  fill
                  unoptimized
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 64rem) 18rem, (min-width: 40rem) 33vw, 50vw"
                  className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`Fotos de ${initiativeName}`}
        aria-describedby={statusId}
        onClose={onClose}
        onKeyDown={onKeyDown}
        className="scheme-dark m-0 h-dvh max-h-none w-full max-w-none bg-[var(--color-app-background)] p-0 text-[var(--color-app-foreground)] backdrop:bg-black"
      >
        {photo && current !== null ? (
          <div className="flex h-full flex-col">
            <p id={statusId} aria-live="polite" className="sr-only">
              Foto {current + 1} de {photos.length}
              {photo.caption ? `: ${photo.caption}` : ""}
            </p>

            <div className="flex justify-end p-3 sm:p-4">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className={lightboxButton}
              >
                <Icon>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </Icon>
                Fechar
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="relative mx-3 min-h-0 flex-1 sm:mx-6">
                <Image
                  key={photo.id}
                  src={photo.url}
                  alt=""
                  fill
                  unoptimized
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              {photo.caption ? (
                <p
                  aria-hidden="true"
                  className="mx-auto max-w-3xl px-4 pt-4 text-center leading-relaxed wrap-anywhere"
                >
                  {photo.caption}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-center gap-3 p-3 sm:gap-6 sm:p-4">
              {photos.length > 1 ? (
                <button type="button" onClick={() => step(-1)} className={lightboxButton}>
                  <Icon>
                    <path d="m15 18-6-6 6-6" />
                  </Icon>
                  Anterior
                </button>
              ) : null}
              <p aria-hidden="true" className="min-w-16 text-center font-bold tabular-nums">
                {current + 1} de {photos.length}
              </p>
              {photos.length > 1 ? (
                <button type="button" onClick={() => step(1)} className={lightboxButton}>
                  Próxima
                  <Icon>
                    <path d="m9 18 6-6-6-6" />
                  </Icon>
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
