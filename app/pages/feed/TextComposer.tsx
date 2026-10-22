"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import {
  controlBorder,
  focusRing,
  primaryButton,
  secondaryButton,
} from "@/components/styles";
import { countCharacters, formatCount } from "./format";
import { useFailure } from "./hooks";
import { pendingButton, smallPrimaryButton, smallSecondaryButton } from "./styles";

const field = `block w-full resize-y rounded-md border bg-[var(--color-app-background)] px-4 py-3 text-base leading-relaxed text-[var(--color-app-foreground)] transition-colors ${focusRing}`;

export function TextComposer({
  autoFocus = false,
  className = "",
  compact = false,
  emptyMessage,
  hint,
  id,
  initialValue = "",
  label,
  labelHidden = false,
  maxLength,
  onCancel,
  onSubmit,
  pendingLabel,
  placeholder,
  resetOnSuccess = false,
  submitLabel,
  successMessage = "",
}: {
  autoFocus?: boolean;
  className?: string;
  compact?: boolean;
  emptyMessage: string;
  hint?: string;
  id?: string;
  initialValue?: string;
  label: string;
  labelHidden?: boolean;
  maxLength: number;
  onCancel?: () => void;
  onSubmit: (body: string) => Promise<void>;
  pendingLabel: string;
  placeholder?: string;
  resetOnSuccess?: boolean;
  submitLabel: string;
  successMessage?: string;
}) {
  const ownId = useId();
  const fieldId = id ?? `${ownId}-field`;
  const hintId = `${ownId}-hint`;
  const limitId = `${ownId}-limit`;
  const errorId = `${ownId}-error`;
  const fail = useFailure();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const length = countCharacters(value);
  const excess = length - maxLength;
  useEffect(() => {
    const node = textarea.current;

    if (autoFocus && node) {
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  }, [autoFocus]);

  const message =
    error ||
    (excess > 0
      ? `Passou ${formatCount(excess)} ${excess === 1 ? "caractere" : "caracteres"} do limite de ${formatCount(maxLength)}.`
      : "");

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (pending) {
      return;
    }

    const body = value.trim();

    if (!body || excess > 0) {
      setError(body ? "" : emptyMessage);
      textarea.current?.focus();
      return;
    }

    setPending(true);
    setError("");
    setNotice("");

    try {
      await onSubmit(body);

      if (resetOnSuccess) {
        setValue("");
        setNotice(successMessage);
      }
    } catch (failure) {
      setError(fail(failure, "Não foi possível enviar. Tente de novo."));
    } finally {
      setPending(false);
    }
  }

  const describedBy = [hint ? hintId : "", limitId, message ? errorId : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <form noValidate onSubmit={submit} className={className}>
      <label
        htmlFor={fieldId}
        className={labelHidden ? "sr-only" : "block font-bold"}
      >
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-sm text-[var(--color-muted)]">
          {hint}
        </p>
      ) : null}
      <textarea
        ref={textarea}
        id={fieldId}
        value={value}
        rows={compact ? 2 : 5}
        placeholder={placeholder}
        aria-invalid={Boolean(message)}
        aria-describedby={describedBy}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
          setNotice("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void submit();
          }
        }}
        className={`${field} ${controlBorder(Boolean(message))} ${
          labelHidden && !hint ? "" : "mt-2"
        } ${compact ? "min-h-20" : "min-h-32"}`}
      />

      <div aria-live="polite">
        {message ? (
          <p id={errorId} className="mt-2 text-sm font-semibold text-[var(--color-error)]">
            {message}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p
          id={limitId}
          className={`text-sm tabular-nums ${
            excess > 0 ? "font-semibold text-[var(--color-error)]" : "text-[var(--color-muted)]"
          }`}
        >
          <span aria-hidden="true">
            {formatCount(length)}/{formatCount(maxLength)}
          </span>
          <span className="sr-only">Até {formatCount(maxLength)} caracteres.</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {onCancel ? (
            <button
              type="button"
              aria-disabled={pending || undefined}
              onClick={() => {
                if (!pending) {
                  onCancel();
                }
              }}
              className={`${compact ? smallSecondaryButton : secondaryButton} aria-disabled:cursor-not-allowed aria-disabled:opacity-60`}
            >
              Cancelar
            </button>
          ) : null}
          {/* aria-disabled rather than disabled keeps focus on the button while the request runs. */}
          <button
            type="submit"
            aria-disabled={pending || undefined}
            className={`${compact ? smallPrimaryButton : primaryButton} ${pendingButton}`}
          >
            {pending ? pendingLabel : submitLabel}
          </button>
        </div>
      </div>

      <p role="status" className="sr-only">
        {notice}
      </p>
    </form>
  );
}
