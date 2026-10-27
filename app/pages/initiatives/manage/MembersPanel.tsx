import { type ReactNode, type Ref, type SyntheticEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AccountSuspendedError, useSession } from "@/components/SessionProvider";
import { control, controlBorder, focusRing, primaryButton } from "@/components/styles";
import { PersonAvatar } from "../PersonAvatar";
import { formatDate } from "../../profile/format";
import { RequestError } from "../api";
import { Feedback } from "../InitiativesList";
import type { Member, MembersList } from "../types";
import { fetchMembers, inviteMember, removeMember } from "./api";
import { focusAfterRemoval } from "./focus";
import { type Result, ResultMessage, resultFrom } from "./ResultMessage";
import { busyButton, panelIntro, panelTitle, rowButton } from "./styles";

const inviteErrors = new Set([
  "user_not_found",
  "cannot_invite_self",
  "already_member",
  "target_suspended",
  "invalid_request",
]);

type Loaded = { list?: MembersList; error?: string };

export function MembersPanel({
  initiativeId,
  token,
}: {
  initiativeId: string;
  token: string;
}) {
  const { signOutSuspended } = useSession();
  const [loaded, setLoaded] = useState<Loaded>();
  const [removing, setRemoving] = useState<Member>();
  const [result, setResult] = useState<Result>();
  const membersRef = useRef<HTMLUListElement>(null);
  const invitationsRef = useRef<HTMLUListElement>(null);
  const noMembersRef = useRef<HTMLParagraphElement>(null);
  const noInvitationsRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let isCurrent = true;

    fetchMembers(token, initiativeId)
      .then((list) => {
        if (isCurrent) {
          setLoaded({ list });
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

  const list = loaded?.list;
  const members = list?.members.filter(({ status }) => status === "active") ?? [];
  const invitations = list?.members.filter(({ status }) => status === "pending") ?? [];

  function updateMembers(change: (members: Member[]) => Member[]) {
    setLoaded((current) =>
      current?.list
        ? { list: { ...current.list, members: change(current.list.members) } }
        : current,
    );
  }

  async function remove(member: Member) {
    const pending = member.status === "pending";
    const rows = pending ? invitations : members;
    const index = rows.indexOf(member);

    try {
      await removeMember(token, initiativeId, member.id);
    } catch (error) {
      if (error instanceof AccountSuspendedError) {
        signOutSuspended();
        return;
      }

      if (!(error instanceof RequestError && error.code === "membership_not_found")) {
        throw error;
      }
    }

    flushSync(() => {
      updateMembers((current) => current.filter(({ id }) => id !== member.id));
      setRemoving(undefined);
      setResult({
        tone: "success",
        text: pending
          ? `Convite para ${member.user.name} cancelado.`
          : `${member.user.name} não faz mais parte da iniciativa.`,
      });
    });
    focusAfterRemoval(
      pending ? invitationsRef.current : membersRef.current,
      index,
      pending ? noInvitationsRef.current : noMembersRef.current,
    );
  }

  return (
    <div className="grid max-w-3xl gap-16">
      <InviteForm
        initiativeId={initiativeId}
        token={token}
        onInvited={(member) => {
          updateMembers((current) => [member, ...current]);
          setResult(undefined);
        }}
      />

      {!loaded ? (
        <Feedback tone="loading">Carregando membros...</Feedback>
      ) : !list ? (
        <Feedback tone="error">{loaded.error} Atualize a página para tentar de novo.</Feedback>
      ) : (
        <>
          <section aria-labelledby="members-title">
            <h2 id="members-title" className={panelTitle}>
              Membros
            </h2>
            <p className={panelIntro}>
              Quem aceita o convite aparece em “Quem faz parte”, na página
              pública da iniciativa.
            </p>
            <ResultMessage className="mt-4" result={result} />

            <ul ref={membersRef} className="mt-6 border-b border-[var(--color-header-border)]">
              <MemberRow name={list.owner.name} detail="Responsável pela iniciativa" />
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  name={member.user.name}
                  email={member.user.email}
                  detail={sinceLabel("Participa desde", member.responded_at ?? member.created_at)}
                >
                  <button
                    type="button"
                    data-row-focus
                    onClick={() => {
                      setResult(undefined);
                      setRemoving(member);
                    }}
                    className={rowButton}
                  >
                    Remover<span className="sr-only"> {member.user.name}</span>
                  </button>
                </MemberRow>
              ))}
            </ul>
            {members.length === 0 ? (
              <EmptyRow ref={noMembersRef}>
                Ninguém além de você ainda. Convide pessoas pelo e-mail da conta
                delas.
              </EmptyRow>
            ) : null}
          </section>

          <section aria-labelledby="pending-title">
            <h2 id="pending-title" className={panelTitle}>
              Convites pendentes
            </h2>
            <p className={panelIntro}>
              O convite aparece no perfil da pessoa até ela aceitar ou recusar.
            </p>
            {invitations.length > 0 ? (
              <ul
                ref={invitationsRef}
                className="mt-6 border-b border-[var(--color-header-border)]"
              >
                {invitations.map((member) => (
                  <MemberRow
                    key={member.id}
                    name={member.user.name}
                    email={member.user.email}
                    detail={sinceLabel("Convite enviado em", member.created_at)}
                  >
                    <button
                      type="button"
                      data-row-focus
                      onClick={() => {
                        setResult(undefined);
                        setRemoving(member);
                      }}
                      className={rowButton}
                    >
                      Cancelar convite
                      <span className="sr-only"> para {member.user.name}</span>
                    </button>
                  </MemberRow>
                ))}
              </ul>
            ) : (
              <EmptyRow ref={noInvitationsRef} className="mt-6">
                Nenhum convite pendente.
              </EmptyRow>
            )}
          </section>
        </>
      )}

      {removing ? (
        removing.status === "pending" ? (
          <ConfirmDialog
            title={`Cancelar o convite para ${removing.user.name}?`}
            confirmLabel="Cancelar convite"
            tone="danger"
            onClose={() => setRemoving(undefined)}
            onConfirm={() => remove(removing)}
          >
            O convite deixa de aparecer no perfil dessa pessoa. Você pode
            convidá-la de novo quando quiser.
          </ConfirmDialog>
        ) : (
          <ConfirmDialog
            title={`Remover ${removing.user.name} da iniciativa?`}
            confirmLabel="Remover"
            tone="danger"
            onClose={() => setRemoving(undefined)}
            onConfirm={() => remove(removing)}
          >
            Essa pessoa deixa de aparecer na página da iniciativa. Para voltar,
            ela precisa de um novo convite.
          </ConfirmDialog>
        )
      ) : null}
    </div>
  );
}

function sinceLabel(prefix: string, value: string) {
  const date = formatDate(value, { dateStyle: "long" });
  return date ? `${prefix} ${date}` : undefined;
}

function MemberRow({
  children,
  detail,
  email,
  name,
}: {
  children?: ReactNode;
  detail?: string;
  email?: string;
  name: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[var(--color-header-border)] py-4">
      <PersonAvatar name={name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="font-bold wrap-anywhere">{name}</p>
        {email ? <p className="text-sm wrap-anywhere">{email}</p> : null}
        {detail ? <p className="text-sm text-[var(--color-muted)]">{detail}</p> : null}
      </div>
      {children}
    </li>
  );
}

function EmptyRow({
  children,
  className = "",
  ref,
}: {
  children: ReactNode;
  className?: string;
  ref: Ref<HTMLParagraphElement>;
}) {
  return (
    <p
      ref={ref}
      tabIndex={-1}
      className={`py-4 text-[var(--color-muted)] ${focusRing} ${className}`}
    >
      {children}
    </p>
  );
}

function InviteForm({
  initiativeId,
  onInvited,
  token,
}: {
  initiativeId: string;
  onInvited: (member: Member) => void;
  token: string;
}) {
  const { signOutSuspended } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result>();

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    if (sending) {
      return;
    }

    const value = email.trim();
    const invalid = !value
      ? "Informe o e-mail da pessoa."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? "Informe um e-mail válido."
        : "";

    setResult(undefined);

    if (invalid) {
      flushSync(() => setError(invalid));
      inputRef.current?.focus();
      return;
    }

    setError("");
    setSending(true);

    try {
      const member = await inviteMember(token, initiativeId, value);

      onInvited(member);
      setEmail("");
      setResult({
        tone: "success",
        text: `Convite enviado para ${member.user.name}.`,
      });
    } catch (failure) {
      if (failure instanceof AccountSuspendedError) {
        signOutSuspended();
        return;
      }

      if (failure instanceof RequestError && failure.code && inviteErrors.has(failure.code)) {
        flushSync(() => setError(failure.message));
        inputRef.current?.focus();
        return;
      }

      setResult(resultFrom(failure));
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-labelledby="invite-title">
      <h2 id="invite-title" className={panelTitle}>
        Convidar pessoas
      </h2>
      <p className={panelIntro}>
        A pessoa precisa ter uma conta no ODS Quiz. Ela recebe o convite no
        perfil dela e decide se aceita.
      </p>

      <form noValidate onSubmit={submit} className="mt-6">
        <label htmlFor="invite-email" className="block font-bold">
          E-mail da pessoa
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            id="invite-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            value={email}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "invite-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            className={`${control} ${controlBorder(Boolean(error))}`}
          />
          <button
            type="submit"
            aria-disabled={sending || undefined}
            className={`shrink-0 ${primaryButton} ${busyButton}`}
          >
            {sending ? "Enviando..." : "Convidar"}
          </button>
        </div>
        {error ? (
          <p
            id="invite-email-error"
            className="mt-2 text-sm font-bold text-[var(--color-error)]"
          >
            {error}
          </p>
        ) : null}
        <ResultMessage className="mt-4" result={result} />
      </form>
    </section>
  );
}
