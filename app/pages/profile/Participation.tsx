import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SectionHeader } from "@/components/SectionHeader";
import { AccountSuspendedError, useSession } from "@/components/SessionProvider";
import { focusRing, primaryButton, secondaryButton, surface } from "@/components/styles";
import { cityState } from "@/lib/cep";
import { findGoal } from "@/lib/ods";
import { InitiativeAvatar } from "../initiatives/InitiativeAvatar";
import { RequestError } from "../initiatives/api";
import { cardLink } from "../initiatives/InitiativesList";
import { acceptInvitation, declineInvitation, removeMember } from "../initiatives/manage/api";
import { focusAfterRemoval } from "../initiatives/manage/focus";
import { type Result, ResultMessage, resultFrom } from "../initiatives/manage/ResultMessage";
import { busyButton } from "../initiatives/manage/styles";
import type { InitiativeSummary, Invitation, Membership } from "../initiatives/types";
import { formatDate } from "./format";

export function Invitations({
  invitations,
  onAccepted,
  onDeclined,
  token,
}: {
  invitations: Invitation[];
  onAccepted: (invitationId: string, membership: Membership) => void;
  onDeclined: (invitationId: string) => void;
  token: string;
}) {
  const { signOutSuspended } = useSession();
  const listRef = useRef<HTMLUListElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const [answering, setAnswering] = useState<string>();
  const [result, setResult] = useState<Result>();

  async function answer(invitation: Invitation, accept: boolean) {
    if (answering) {
      return;
    }

    const index = invitations.indexOf(invitation);
    const name = invitation.initiative.name;

    setAnswering(invitation.id);
    setResult(undefined);

    try {
      if (accept) {
        const accepted = await acceptInvitation(token, invitation.id);

        flushSync(() => {
          onAccepted(invitation.id, {
            membership_id: accepted.id,
            initiative: accepted.initiative,
            since: new Date().toISOString(),
          });
          setResult({ tone: "success", text: `Pronto! Agora você participa de ${name}.` });
        });
      } else {
        await declineInvitation(token, invitation.id);

        flushSync(() => {
          onDeclined(invitation.id);
          setResult({ tone: "success", text: `Convite de ${name} recusado.` });
        });
      }

      focusAfterRemoval(listRef.current, index, emptyRef.current);
    } catch (error) {
      if (error instanceof AccountSuspendedError) {
        signOutSuspended();
        return;
      }

      if (error instanceof RequestError && error.code === "invitation_not_found") {
        flushSync(() => {
          onDeclined(invitation.id);
          setResult(resultFrom(error));
        });
        focusAfterRemoval(listRef.current, index, emptyRef.current);
        return;
      }

      setResult(resultFrom(error));
    } finally {
      setAnswering(undefined);
    }
  }

  return (
    <section aria-labelledby="invitations-title" className="pt-24">
      <SectionHeader
        animated={false}
        id="invitations-title"
        label="Convites"
        title="Tem gente contando com você."
      >
        Ao aceitar um convite, você passa a fazer parte da iniciativa e aparece
        em “Quem faz parte”, na página dela.
      </SectionHeader>

      <ResultMessage className="mt-8" result={result} />

      {invitations.length > 0 ? (
        <ul ref={listRef} className="mt-8 grid gap-4">
          {invitations.map((invitation) => {
            const { initiative } = invitation;
            const busy = answering === invitation.id;
            const date = formatDate(invitation.created_at, { dateStyle: "long" });

            return (
              <li
                key={invitation.id}
                className={`flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between ${surface}`}
              >
                <InitiativeHeading initiative={initiative} linked>
                  Convite de {invitation.invited_by.name}
                  {date ? `, em ${date}` : ""}
                </InitiativeHeading>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    type="button"
                    data-row-focus
                    aria-disabled={busy || undefined}
                    onClick={() => answer(invitation, true)}
                    className={`${primaryButton} ${busyButton}`}
                  >
                    {busy ? "Aguarde..." : "Aceitar"}
                    <span className="sr-only"> o convite de {initiative.name}</span>
                  </button>
                  <button
                    type="button"
                    aria-disabled={busy || undefined}
                    onClick={() => answer(invitation, false)}
                    className={`${secondaryButton} ${busyButton}`}
                  >
                    Recusar
                    <span className="sr-only"> o convite de {initiative.name}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p ref={emptyRef} tabIndex={-1} className={`mt-8 text-[var(--color-muted)] ${focusRing}`}>
          Nenhum convite pendente.
        </p>
      )}
    </section>
  );
}

export function Memberships({
  error,
  memberships,
  onLeft,
  token,
}: {
  error?: ReactNode;
  memberships: Membership[];
  onLeft: (membershipId: string) => void;
  token: string;
}) {
  const { signOutSuspended } = useSession();
  const listRef = useRef<HTMLUListElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const [leaving, setLeaving] = useState<Membership>();
  const [result, setResult] = useState<Result>();

  async function leave(membership: Membership) {
    const index = memberships.indexOf(membership);

    try {
      await removeMember(token, membership.initiative.id, membership.membership_id);
    } catch (failure) {
      if (failure instanceof AccountSuspendedError) {
        signOutSuspended();
        return;
      }

      if (!(failure instanceof RequestError && failure.code === "membership_not_found")) {
        throw failure;
      }
    }

    flushSync(() => {
      onLeft(membership.membership_id);
      setLeaving(undefined);
      setResult({ tone: "success", text: `Você saiu de ${membership.initiative.name}.` });
    });
    focusAfterRemoval(listRef.current, index, emptyRef.current);
  }

  return (
    <section aria-labelledby="memberships-title" className="pt-24">
      <SectionHeader
        animated={false}
        id="memberships-title"
        label="Iniciativas de que você participa"
        title="Onde você faz parte do time."
      />

      <ResultMessage className="mt-8" result={result} />

      {error ? (
        error
      ) : memberships.length > 0 ? (
        <ul ref={listRef} className="mt-8 grid gap-4 md:grid-cols-2">
          {memberships.map((membership) => {
            const { initiative } = membership;
            const since = membership.since
              ? formatDate(membership.since, { dateStyle: "long" })
              : undefined;

            return (
              <li key={membership.membership_id} className={`flex flex-col gap-4 p-5 ${surface}`}>
                <InitiativeHeading initiative={initiative}>
                  {since ? `Participa desde ${since}` : null}
                </InitiativeHeading>
                <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1">
                  <Link href={`/initiatives/${initiative.id}`} className={cardLink}>
                    Ver iniciativa
                    <span className="sr-only"> {initiative.name}</span>
                    <span aria-hidden="true"> →</span>
                  </Link>
                  <button
                    type="button"
                    data-row-focus
                    onClick={() => setLeaving(membership)}
                    className={`font-bold text-[var(--color-error)] underline-offset-4 hover:underline ${focusRing}`}
                  >
                    Sair
                    <span className="sr-only"> de {initiative.name}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p
          ref={emptyRef}
          tabIndex={-1}
          className={`mt-8 max-w-3xl text-lg leading-relaxed text-[var(--color-muted)] ${focusRing}`}
        >
          Você ainda não participa de nenhuma iniciativa. Quando a pessoa
          responsável por uma iniciativa convidar você, o convite aparece no
          topo do seu perfil.
        </p>
      )}

      {leaving ? (
        <ConfirmDialog
          title={`Sair de ${leaving.initiative.name}?`}
          confirmLabel="Sair da iniciativa"
          tone="danger"
          onClose={() => setLeaving(undefined)}
          onConfirm={() => leave(leaving)}
        >
          Você deixa de fazer parte da iniciativa e sai da lista “Quem faz
          parte”. Para voltar, é preciso receber um novo convite.
        </ConfirmDialog>
      ) : null}
    </section>
  );
}

function InitiativeHeading({
  children,
  initiative,
  linked = false,
}: {
  children?: ReactNode;
  initiative: InitiativeSummary;
  linked?: boolean;
}) {
  const name = initiative.name || "Iniciativa sem nome";

  const goal = findGoal(initiative.main_ods);
  const place = cityState(initiative);

  return (
    <div className="flex min-w-0 items-start gap-4">
      <InitiativeAvatar initiative={initiative} size="md" />
      <div className="min-w-0">
        <h3 className="wrap-break-word text-xl font-extrabold leading-tight [font-stretch:85%]">
          {linked ? (
            <Link
              href={`/initiatives/${initiative.id}`}
              className={`underline-offset-4 transition hover:text-[var(--color-link-hover)] hover:underline ${focusRing}`}
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>
        {goal || place ? (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {[goal ? `ODS ${goal.number} · ${goal.name}` : "", place]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
        {children ? (
          <p className="mt-1 text-sm text-[var(--color-muted)]">{children}</p>
        ) : null}
      </div>
    </div>
  );
}
