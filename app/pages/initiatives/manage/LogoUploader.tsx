import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AccountSuspendedError, useSession } from "@/components/SessionProvider";
import { primaryButton, secondaryButton, surface } from "@/components/styles";
import { InitiativeAvatar } from "../../feed/InitiativeAvatar";
import type { Initiative } from "../types";
import { removeLogo, uploadLogo } from "./api";
import { LOGO_TYPES, prepareLogo } from "./logo";
import { type Result, ResultMessage, resultFrom } from "./ResultMessage";
import { busyButton, panelIntro, panelTitle } from "./styles";

type Pending = { blob: Blob; url: string };

export function LogoUploader({
  initiative,
  initiativeId,
  onChange,
  token,
}: {
  initiative: Initiative;
  initiativeId: string;
  onChange: (initiative: Initiative) => void;
  token: string;
}) {
  const { signOutSuspended } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState<Pending>();
  const [status, setStatus] = useState<"idle" | "preparing" | "uploading">("idle");
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const [result, setResult] = useState<Result>();
  const busy = status !== "idle";
  const hasLogo = Boolean(initiative.logo_url);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const { url } = pending;
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  function fail(error: unknown) {
    if (error instanceof AccountSuspendedError) {
      signOutSuspended();
      return;
    }

    setResult(resultFrom(error));
  }

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setStatus("preparing");
    setResult(undefined);

    try {
      const blob = await prepareLogo(file);
      setPending({ blob, url: URL.createObjectURL(blob) });
      setResult({ tone: "success", text: "Prévia pronta. Salve para publicar o novo logo." });
    } catch (error) {
      setResult(resultFrom(error));
    } finally {
      setStatus("idle");
    }
  }

  async function save() {
    if (!pending || busy) {
      return;
    }

    setStatus("uploading");
    setResult(undefined);

    try {
      const updated = await uploadLogo(token, initiativeId, pending.blob);

      flushSync(() => {
        onChange(updated);
        setPending(undefined);
        setResult({ tone: "success", text: "Logo atualizado." });
      });
      chooseRef.current?.focus();
    } catch (error) {
      fail(error);
    } finally {
      setStatus("idle");
    }
  }

  function discard() {
    flushSync(() => {
      setPending(undefined);
      setResult({ tone: "success", text: "Prévia descartada." });
    });
    chooseRef.current?.focus();
  }

  async function remove() {
    try {
      const updated = await removeLogo(token, initiativeId);

      flushSync(() => {
        onChange(updated);
        setConfirmingRemoval(false);
        setResult({ tone: "success", text: "Logo removido." });
      });
      chooseRef.current?.focus();
    } catch (error) {
      if (error instanceof AccountSuspendedError) {
        signOutSuspended();
        return;
      }

      throw error;
    }
  }

  return (
    <section aria-labelledby="logo-title" className={surface}>
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-8 sm:p-8">
        <figure className="flex flex-col items-start gap-2 sm:items-center">
          <InitiativeAvatar
            initiative={pending ? { ...initiative, logo_url: pending.url } : initiative}
            size="xl"
          />
          <figcaption className="text-sm text-[var(--color-muted)]">
            {pending ? "Prévia" : hasLogo ? "Logo atual" : "Sem logo"}
          </figcaption>
        </figure>

        <div className="min-w-0">
          <h2 id="logo-title" className={panelTitle}>
            Logo
          </h2>
          <p className={panelIntro}>
            Aparece na página da iniciativa, nas publicações e no feed. Use uma
            imagem PNG, JPG ou WebP: antes do envio, ela é reduzida para até
            512 × 512 pixels. Sem logo, mostramos as iniciais na cor do ODS
            principal.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={LOGO_TYPES.join(",")}
            hidden
            onChange={choose}
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              ref={chooseRef}
              type="button"
              aria-disabled={busy || undefined}
              onClick={() => {
                if (!busy) {
                  inputRef.current?.click();
                }
              }}
              className={`${pending ? secondaryButton : primaryButton} ${busyButton}`}
            >
              {status === "preparing"
                ? "Preparando imagem..."
                : pending
                  ? "Escolher outra imagem"
                  : hasLogo
                    ? "Trocar logo"
                    : "Enviar logo"}
            </button>

            {pending ? (
              <>
                <button
                  type="button"
                  aria-disabled={busy || undefined}
                  onClick={save}
                  className={`${primaryButton} ${busyButton}`}
                >
                  {status === "uploading" ? "Enviando..." : "Salvar logo"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={discard}
                  className={`${secondaryButton} ${busyButton}`}
                >
                  Descartar
                </button>
              </>
            ) : hasLogo ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setResult(undefined);
                  setConfirmingRemoval(true);
                }}
                className={`${secondaryButton} ${busyButton}`}
              >
                Remover logo
              </button>
            ) : null}
          </div>

          <ResultMessage className="mt-4" result={result} />
        </div>
      </div>

      {confirmingRemoval ? (
        <ConfirmDialog
          title="Remover o logo?"
          confirmLabel="Remover logo"
          tone="danger"
          onClose={() => setConfirmingRemoval(false)}
          onConfirm={remove}
        >
          A iniciativa passa a mostrar as iniciais na cor do ODS principal até
          que você envie outro logo.
        </ConfirmDialog>
      ) : null}
    </section>
  );
}
