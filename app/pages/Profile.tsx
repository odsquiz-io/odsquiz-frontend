"use client";

import { useEffect, useState } from "react";
import { LoginRequired } from "@/components/LoginRequired";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { type SessionUser, useSession } from "@/components/SessionProvider";
import { eyebrow, focusRing } from "@/components/styles";
import { UserIcon } from "@/components/UserIcon";
import { useAuthToken } from "@/lib/auth";
import { cityState } from "@/lib/cep";
import { fetchMyInitiatives } from "./initiatives/api";
import { formatNumber } from "./initiatives/format";
import { Feedback } from "./initiatives/InitiativesList";
import { AccountDetails } from "./profile/AccountDetails";
import { InitiativeGrid } from "./profile/InitiativeGrid";
import { QuizHistory } from "./profile/QuizHistory";
import { fetchQuizSubmissions } from "./quiz/api";

type Loaded<T> = { token: string; data?: T; error?: string };

function loadError(error: unknown) {
  if (error instanceof TypeError) {
    return "Não foi possível conectar ao servidor.";
  }

  return error instanceof Error ? error.message : "Algo deu errado.";
}

function useTokenData<T>(
  token: string | null | undefined,
  load: (token: string) => Promise<T>,
) {
  const [loaded, setLoaded] = useState<Loaded<T>>();

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;

    load(token)
      .then((data) => {
        if (isCurrent) {
          setLoaded({ token, data });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoaded({ token, error: loadError(error) });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [load, token]);

  // Never shows what was loaded for another account, e.g. after a sign-in in another tab.
  return loaded?.token === token ? loaded : undefined;
}

export default function Profile() {
  const token = useAuthToken();
  const { status, user } = useSession();
  const quizzes = useTokenData(token, fetchQuizSubmissions);
  const initiatives = useTokenData(token, fetchMyInitiatives);
  // Tied to the token, like the loaded data, so a sign-in in another tab never reopens the editor.
  const [editingToken, setEditingToken] = useState<string | null>();
  const editing = Boolean(token) && editingToken === token;
  const ready = Boolean(token && quizzes && initiatives) && status !== "loading";

  function setEditing(open: boolean) {
    setEditingToken(open ? token : null);
  }

  return (
    <main className="min-h-svh flex-1 bg-[var(--color-app-background)] pb-28 text-[var(--color-app-foreground)] transition-colors">
      <div className="mx-auto max-w-6xl px-4 pt-36 sm:px-6 sm:pt-44">
        <PageHeader
          label="Seu perfil"
          title={user?.name || "Sua conta"}
          media={
            <span
              aria-hidden="true"
              className="grid size-16 shrink-0 place-items-center rounded-lg border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] text-[var(--color-muted)] sm:size-24"
            >
              <UserIcon className="size-8 sm:size-12" />
            </span>
          }
          actions={
            ready ? (
              <ProfileFacts
                quizzes={quizzes?.data?.length}
                initiatives={initiatives?.data?.length}
              />
            ) : undefined
          }
        >
          {token === null ? null : (
            <Residence
              user={ready ? user : null}
              onAdd={editing ? undefined : () => setEditing(true)}
            />
          )}
        </PageHeader>

        {token === null ? (
          <LoginRequired
            className="mt-12 max-w-2xl"
            message="Entre na sua conta para ver seus quizzes, suas iniciativas e seus dados."
          />
        ) : ready ? (
          <>
            <section aria-labelledby="quizzes-title" className="pt-24">
              <SectionHeader
                animated={false}
                id="quizzes-title"
                label="Seus quizzes"
                title="Sua realidade, quiz a quiz."
              >
                Cada resultado fica guardado na sua conta, com os pontos por
                objetivo.
              </SectionHeader>
              {quizzes?.data ? (
                <div className="mt-12">
                  <QuizHistory submissions={quizzes.data} />
                </div>
              ) : (
                <LoadError error={quizzes?.error} />
              )}
            </section>

            <section aria-labelledby="initiatives-title" className="pt-24">
              <SectionHeader
                animated={false}
                id="initiatives-title"
                label="Suas iniciativas"
                title="O que você colocou no mapa."
              >
                {initiatives?.data?.length === 0
                  ? "Você ainda não cadastrou nenhuma iniciativa. Quando cadastrar, ela aparece aqui e no mapa."
                  : null}
              </SectionHeader>
              {initiatives?.data ? (
                <InitiativeGrid initiatives={initiatives.data} />
              ) : (
                <LoadError error={initiatives?.error} />
              )}
            </section>

            <section aria-labelledby="account-title" className="pt-24">
              <h2 id="account-title" className={eyebrow}>
                Seus dados
              </h2>
              {user && token ? (
                <AccountDetails
                  editing={editing}
                  token={token}
                  user={user}
                  onEditingChange={setEditing}
                />
              ) : (
                <Feedback className="mt-6" tone="error">
                  Não foi possível carregar seus dados. Atualize a página para
                  tentar de novo.
                </Feedback>
              )}
            </section>
          </>
        ) : token ? (
          <Feedback className="mt-12" tone="loading">
            Carregando seu perfil...
          </Feedback>
        ) : null}
      </div>
    </main>
  );
}

const residenceLine = "inline-flex items-start gap-2";

function Residence({ onAdd, user }: { onAdd?: () => void; user: SessionUser | null }) {
  const place = user && cityState(user);

  if (place) {
    return (
      <span className={residenceLine}>
        <PinIcon />
        <span>
          <span className="sr-only">Cidade: </span>
          {place}
        </span>
      </span>
    );
  }

  if (user && onAdd) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className={`${residenceLine} underline underline-offset-4 transition hover:text-[var(--color-link-hover)] ${focusRing}`}
      >
        <PinIcon />
        Adicione sua cidade
      </button>
    );
  }

  // Keeps the line's height while loading or editing, so nothing below it shifts.
  return (
    <span className={`invisible ${residenceLine}`}>
      <PinIcon />
      &nbsp;
    </span>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-1 size-5 shrink-0"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LoadError({ error }: { error?: string }) {
  return (
    <Feedback className="mt-12" tone="error">
      {error} Atualize a página para tentar de novo.
    </Feedback>
  );
}

function ProfileFacts({
  initiatives,
  quizzes,
}: {
  initiatives?: number;
  quizzes?: number;
}) {
  return (
    <div className="flex gap-10">
      <Fact
        value={quizzes}
        label={quizzes === 1 ? "quiz respondido" : "quizzes respondidos"}
      />
      <Fact
        value={initiatives}
        label={initiatives === 1 ? "iniciativa cadastrada" : "iniciativas cadastradas"}
      />
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: number }) {
  // Hidden rather than absent until loaded, so the sections below never shift.
  return (
    <p
      className={
        value === undefined
          ? "invisible"
          : "origin-bottom-left motion-safe:animate-[zoom_700ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
      }
    >
      <span className="block font-display text-6xl font-extrabold leading-none tabular-nums [font-stretch:75%]">
        {formatNumber(value ?? 0)}
      </span>
      <span className="mt-2 block text-sm font-bold text-[var(--color-muted)]">
        {label}
      </span>
    </p>
  );
}
