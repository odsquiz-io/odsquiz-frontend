"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type KeyboardEvent, useEffect, useState } from "react";
import { LoginRequired } from "@/components/LoginRequired";
import { OdsBand } from "@/components/OdsBand";
import { PageHeader } from "@/components/PageHeader";
import { useSession } from "@/components/SessionProvider";
import { focusRing, loadIn, primaryButton, secondaryButton, surface } from "@/components/styles";
import { useAuthToken } from "@/lib/auth";
import { InitiativeAvatar } from "../InitiativeAvatar";
import { fetchInitiative } from "../api";
import { InitiativeForm } from "../InitiativeForm";
import { Feedback } from "../InitiativesList";
import { SuspensionNotice } from "../SuspensionNotice";
import type { Initiative } from "../types";
import { LogoUploader } from "./LogoUploader";
import { MembersPanel } from "./MembersPanel";
import { PhotosPanel } from "./PhotosPanel";
import { panelIntro, panelTitle } from "./styles";

const tabs = [
  { id: "dados", label: "Dados" },
  { id: "fotos", label: "Fotos" },
  { id: "membros", label: "Membros" },
] as const;

type Tab = (typeof tabs)[number]["id"];

type Loaded = { token: string; initiative?: Initiative; error?: string };

function tabFrom(value: string | null): Tab {
  return tabs.find((tab) => tab.id === value)?.id ?? "dados";
}

export default function ManageInitiative({ id }: { id: string }) {
  const token = useAuthToken();
  const { user } = useSession();
  const [loaded, setLoaded] = useState<Loaded>();

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;

    fetchInitiative(token, id)
      .then((initiative) => {
        if (isCurrent) {
          setLoaded({ token, initiative });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoaded({
            token,
            error:
              error instanceof TypeError
                ? "Não foi possível conectar ao servidor."
                : error instanceof Error
                  ? error.message
                  : "Algo deu errado ao carregar a iniciativa.",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [id, token]);

  // Never shows what was loaded for another account, e.g. after a sign-in in another tab.
  const current = loaded?.token === token ? loaded : undefined;
  const initiative = current?.initiative;
  const isOwner = Boolean(
    initiative &&
      (initiative.viewer_role === "owner" || (user && initiative.owner === user.id)),
  );
  const publicHref = `/initiatives/${id}`;

  // Replies to writes leave out the viewer's role and the member count, so they are merged.
  function update(changed: Initiative) {
    setLoaded((previous) =>
      previous?.initiative
        ? { ...previous, initiative: { ...previous.initiative, ...changed } }
        : previous,
    );
  }

  return (
    <main className="min-h-svh flex-1 bg-[var(--color-app-background)] pb-28 text-[var(--color-app-foreground)] transition-colors">
      <div className="mx-auto max-w-6xl px-4 pt-36 sm:px-6 sm:pt-44">
        <Link
          href="/profile"
          className={`inline-flex items-center gap-2 font-bold text-[var(--color-muted)] transition hover:text-[var(--color-app-foreground)] ${focusRing}`}
        >
          <span aria-hidden="true">←</span>
          Seu perfil
        </Link>

        <div className="mt-8">
          <PageHeader
            label="Gerenciar iniciativa"
            title={initiative ? initiative.name || "Iniciativa sem nome" : "Sua iniciativa"}
            media={
              initiative ? (
                <InitiativeAvatar initiative={initiative} size="xl" />
              ) : token === null ? undefined : (
                <span
                  aria-hidden="true"
                  className="size-16 shrink-0 rounded-lg border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] sm:size-24"
                />
              )
            }
            actions={
              isOwner ? (
                <Link href={publicHref} className={secondaryButton}>
                  Ver página pública
                  <span aria-hidden="true">&nbsp;→</span>
                </Link>
              ) : undefined
            }
          />
        </div>

        {token === null ? (
          <LoginRequired
            className="mt-12 max-w-2xl"
            message="Entre na sua conta para gerenciar esta iniciativa."
          />
        ) : current?.error ? (
          <Feedback className="mt-12" tone="error">
            {current.error}
          </Feedback>
        ) : !initiative ? (
          token ? (
            <Feedback className="mt-12" tone="loading">
              Carregando iniciativa...
            </Feedback>
          ) : null
        ) : !isOwner ? (
          <NotOwner href={publicHref} member={initiative.viewer_role === "member"} />
        ) : token ? (
          <>
            <SuspensionNotice className="mt-8 max-w-2xl" initiative={initiative} />
            <ManageTabs
              initiative={initiative}
              initiativeId={id}
              token={token}
              onChange={update}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}

function NotOwner({ href, member }: { href: string; member: boolean }) {
  return (
    <div className={`mt-12 max-w-2xl overflow-hidden ${surface} ${loadIn}`}>
      <OdsBand className="h-1.5" />
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold [font-stretch:85%]">
          Só a pessoa responsável pode gerenciar
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          {member
            ? "Você participa desta iniciativa, mas só a pessoa responsável altera os dados, as fotos e os membros."
            : "Esta área é exclusiva de quem cadastrou a iniciativa. Na página pública você vê os dados, as fotos e quem faz parte dela."}
        </p>
        <Link href={href} className={`mt-6 ${primaryButton}`}>
          Ver página pública
        </Link>
      </div>
    </div>
  );
}

function ManageTabs({
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
  const searchParams = useSearchParams();
  const tab = tabFrom(searchParams.get("aba"));
  // Panels stay mounted once opened, so unsaved edits survive a switch between tabs.
  const [visited, setVisited] = useState<Tab[]>([]);

  function select(next: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("aba", next);
    window.history.replaceState(null, "", `?${params}`);
    setVisited((current) => (current.includes(tab) ? current : [...current, tab]));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex(({ id }) => id === tab);
    const target = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];

    if (target === undefined) {
      return;
    }

    event.preventDefault();
    const next = tabs[(target + tabs.length) % tabs.length].id;
    select(next);
    document.getElementById(`manage-tab-${next}`)?.focus();
  }

  return (
    <div className="mt-12 sm:mt-16">
      <div
        role="tablist"
        aria-label="Áreas de gestão"
        onKeyDown={onKeyDown}
        className="flex gap-2 overflow-x-auto border-b border-[var(--color-header-border)]"
      >
        {tabs.map(({ id, label }) => {
          const selected = id === tab;

          return (
            <button
              key={id}
              id={`manage-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`manage-panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(id)}
              className={`relative shrink-0 px-4 py-3 text-lg font-bold transition after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:origin-left after:bg-current after:scale-x-0 hover:text-[var(--color-app-foreground)] aria-selected:text-[var(--color-app-foreground)] aria-selected:after:scale-x-100 motion-safe:after:transition-transform motion-safe:after:duration-300 text-[var(--color-muted)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tabs.map(({ id }) => (
        <div
          key={id}
          id={`manage-panel-${id}`}
          role="tabpanel"
          aria-labelledby={`manage-tab-${id}`}
          hidden={id !== tab}
          className="pt-12"
        >
          {id === tab || visited.includes(id) ? (
            <TabContent
              tab={id}
              initiative={initiative}
              initiativeId={initiativeId}
              token={token}
              onChange={onChange}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function TabContent({
  initiative,
  initiativeId,
  onChange,
  tab,
  token,
}: {
  initiative: Initiative;
  initiativeId: string;
  onChange: (initiative: Initiative) => void;
  tab: Tab;
  token: string;
}) {
  if (tab === "membros") {
    return <MembersPanel initiativeId={initiativeId} token={token} />;
  }

  if (tab === "fotos") {
    return <PhotosPanel initiativeId={initiativeId} token={token} />;
  }

  return (
    <div className="grid max-w-3xl gap-16">
      <LogoUploader
        initiative={initiative}
        initiativeId={initiativeId}
        token={token}
        onChange={onChange}
      />
      <section aria-labelledby="details-title">
        <h2 id="details-title" className={panelTitle}>
          Dados da iniciativa
        </h2>
        <p className={panelIntro}>
          Os campos marcados com * são obrigatórios. As alterações aparecem no
          mapa e na página pública assim que você salva.
        </p>
        <div className="mt-8">
          <InitiativeForm
            initiative={initiative}
            token={token}
            onSaved={(saved) => {
              if (saved) {
                onChange(saved);
              }
            }}
          />
        </div>
      </section>
    </div>
  );
}
