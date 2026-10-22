"use client";

import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { OdsBand } from "./OdsBand";
import { dangerButton, loadIn, primaryButton, secondaryButton, surface } from "./styles";

export function ConfirmDialog({
  cancelLabel = "Voltar",
  children,
  confirmLabel,
  onClose,
  onConfirm,
  title,
  tone = "default",
}: {
  cancelLabel?: string;
  children?: ReactNode;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  tone?: "default" | "danger";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    dialog?.showModal();
    cancelRef.current?.focus();

    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      await onConfirm();
    } catch (failure) {
      setError(
        failure instanceof TypeError
          ? "Não foi possível conectar ao servidor. Tente de novo."
          : failure instanceof Error
            ? failure.message
            : "Não foi possível concluir a ação. Tente de novo.",
      );
      setPending(false);
    }
  }

  function close() {
    if (!pending) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={children ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className={`m-auto w-[calc(100%-2rem)] max-w-md overflow-y-auto p-0 text-[var(--color-app-foreground)] backdrop:bg-black/70 ${surface} ${loadIn}`}
    >
      <OdsBand className="h-1.5" />
      <form noValidate onSubmit={submit} className="p-6 sm:p-8">
        <h2 id={titleId} className="text-2xl font-extrabold leading-tight [font-stretch:85%]">
          {title}
        </h2>
        {children ? (
          <div id={descriptionId} className="mt-2 leading-relaxed text-[var(--color-muted)]">
            {children}
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-5 border-l-4 border-[var(--color-error)] py-1 pl-3 text-sm font-semibold text-[var(--color-error)]"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            aria-disabled={pending || undefined}
            onClick={close}
            className={`${secondaryButton} aria-disabled:cursor-not-allowed aria-disabled:opacity-60`}
          >
            {cancelLabel}
          </button>
          {/* aria-disabled rather than disabled keeps focus on the button while the request runs. */}
          <button
            type="submit"
            aria-disabled={pending || undefined}
            className={`${tone === "danger" ? dangerButton : primaryButton} aria-disabled:cursor-wait aria-disabled:opacity-70`}
          >
            {pending ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
