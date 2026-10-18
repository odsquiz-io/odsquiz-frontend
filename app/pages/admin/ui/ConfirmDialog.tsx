"use client";

import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Spinner } from "./States";
import { buttonClass, panel, textField } from "./styles";

const REASON_MAX_LENGTH = 500;

export function ConfirmDialog({
  children,
  confirmLabel,
  onClose,
  onConfirm,
  reason,
  title,
  tone = "default",
}: {
  children?: ReactNode;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  reason?: { label: string; hint?: string };
  title: string;
  tone?: "default" | "danger";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const reasonId = useId();
  const hintId = useId();
  const [text, setText] = useState("");
  const [missingReason, setMissingReason] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    dialog?.showModal();
    (reasonRef.current ?? cancelRef.current)?.focus();

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

    const value = text.trim();

    if (reason && !value) {
      setMissingReason(true);
      reasonRef.current?.focus();
      return;
    }

    setPending(true);
    setError("");

    try {
      await onConfirm(value);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Não foi possível concluir a ação. Tente de novo.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={children ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();

        if (!pending) {
          onClose();
        }
      }}
      className={`m-auto w-[min(32rem,calc(100vw-2rem))] max-w-none p-0 text-[var(--admin-text)] shadow-2xl backdrop:bg-black/50 ${panel}`}
    >
      <form noValidate onSubmit={submit}>
        <div className="p-5">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          {children ? (
            <div id={descriptionId} className="mt-2 text-sm leading-relaxed text-[var(--admin-muted)]">
              {children}
            </div>
          ) : null}

          {reason ? (
            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor={reasonId} className="text-sm font-medium">
                {reason.label}{" "}
                <span className="font-normal text-[var(--admin-muted)]">(obrigatório)</span>
              </label>
              <textarea
                ref={reasonRef}
                id={reasonId}
                value={text}
                required
                rows={4}
                maxLength={REASON_MAX_LENGTH}
                aria-invalid={missingReason || undefined}
                aria-describedby={hintId}
                onChange={(event) => {
                  setText(event.target.value);
                  setMissingReason(false);
                }}
                className={`${textField} aria-[invalid=true]:border-[var(--admin-danger)]`}
              />
              <div className="flex justify-between gap-4 text-xs">
                <p
                  id={hintId}
                  className={missingReason ? "text-[var(--admin-danger)]" : "text-[var(--admin-muted)]"}
                >
                  {missingReason ? "Informe o motivo para continuar." : reason.hint}
                </p>
                <p aria-hidden="true" className="shrink-0 tabular-nums text-[var(--admin-muted)]">
                  {text.length}/{REASON_MAX_LENGTH}
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-[var(--admin-danger)] bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 rounded-b-lg border-t border-[var(--admin-border)] bg-[var(--admin-raised)] px-5 py-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            aria-disabled={pending || undefined}
            onClick={() => {
              if (!pending) {
                onClose();
              }
            }}
            className={`${buttonClass("secondary")} aria-disabled:cursor-not-allowed aria-disabled:opacity-50`}
          >
            Cancelar
          </button>
          {/* aria-disabled rather than disabled keeps focus on the button while the request runs. */}
          <button
            type="submit"
            aria-disabled={pending || undefined}
            className={`${buttonClass(tone === "danger" ? "danger" : "primary")} aria-disabled:cursor-wait aria-disabled:opacity-70`}
          >
            {pending ? <Spinner /> : null}
            {pending ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
