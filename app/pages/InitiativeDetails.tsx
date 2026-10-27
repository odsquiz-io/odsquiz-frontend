"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoginRequired } from "@/components/LoginRequired";
import { PageHeader } from "@/components/PageHeader";
import { eyebrow, focusRing, loadIn, secondaryButton } from "@/components/styles";
import { useAuthToken } from "@/lib/auth";
import { findGoal, type OdsGoal } from "@/lib/ods";
import { fetchInitiative } from "./initiatives/api";
import { ContactLinks } from "./initiatives/details/ContactLinks";
import { ManageHint } from "./initiatives/details/ManageHint";
import { PhotoGallery } from "./initiatives/details/PhotoGallery";
import { ProfileHeader } from "./initiatives/details/ProfileHeader";
import { ExpandableText } from "./initiatives/ExpandableText";
import { initiativeFacts } from "./initiatives/format";
import { Feedback } from "./initiatives/InitiativesList";
import { resultFrom } from "./initiatives/manage/ResultMessage";
import { MapFrame, MapLoading } from "./initiatives/MapFrame";
import { MembersPanel } from "./initiatives/MembersPanel";
import { fetchPhotos } from "./initiatives/photos/api";
import { SuspensionNotice } from "./initiatives/SuspensionNotice";
import type { Initiative, Photo } from "./initiatives/types";

const LocationMap = dynamic(
  () => import("./initiatives/map/LocationMap").then((mod) => mod.LocationMap),
  { loading: MapLoading, ssr: false },
);

type Photos = { items: Photo[]; error?: string };

export default function InitiativeDetails({ id }: { id: string }) {
  const token = useAuthToken();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [photos, setPhotos] = useState<Photos>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;

    fetchInitiative(token, id)
      .then((nextInitiative) => {
        if (isCurrent) {
          setInitiative(nextInitiative);
        }
      })
      .catch((fetchError) => {
        if (isCurrent) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Algo deu errado ao carregar a iniciativa.",
          );
        }
      });

    fetchPhotos(token, id).then(
      (items) => {
        if (isCurrent) {
          setPhotos({ items });
        }
      },
      (photosError) => {
        if (isCurrent) {
          setPhotos({ items: [], error: resultFrom(photosError).text });
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [id, token]);

  // Waits for the photos too, so the cover never pushes the page down after it renders.
  const loaded = token && !error && photos ? initiative : null;
  const manageHref =
    loaded?.viewer_role === "owner" ? `/initiatives/${encodeURIComponent(id)}/manage` : undefined;
  const visiblePhotos = loaded && !loaded.suspended_at ? (photos?.items ?? []) : [];

  return (
    <main className="min-h-svh flex-1 bg-[var(--color-app-background)] pb-28 text-[var(--color-app-foreground)] transition-colors">
      <div className="mx-auto max-w-6xl px-4 pt-36 sm:px-6 sm:pt-44">
        <Link
          href="/initiatives"
          className={`inline-flex items-center gap-2 font-bold text-[var(--color-muted)] transition hover:text-[var(--color-app-foreground)] ${focusRing}`}
        >
          <span aria-hidden="true">←</span>
          Todas as iniciativas
        </Link>

        <div className="mt-8">
          {loaded ? (
            <ProfileHeader
              initiative={loaded}
              cover={visiblePhotos[0]}
              actions={
                manageHref ? (
                  <Link href={manageHref} className={secondaryButton}>
                    Gerenciar iniciativa
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <PageHeader
              label="Iniciativa"
              title="Detalhes da iniciativa"
              media={
                token === null || error ? undefined : (
                  <span
                    aria-hidden="true"
                    className="size-16 shrink-0 rounded-lg border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] sm:size-24"
                  />
                )
              }
            />
          )}
        </div>

        {loaded ? (
          <SuspensionNotice className="mt-8 max-w-2xl" initiative={loaded} />
        ) : null}

        {token === null ? (
          <LoginRequired
            className="mt-12 max-w-2xl"
            message="Entre na sua conta para ver esta iniciativa."
          />
        ) : error ? (
          <Feedback className="mt-12" tone="error">
            {error}
          </Feedback>
        ) : !loaded ? (
          <Feedback className="mt-12" tone="loading">
            Carregando iniciativa...
          </Feedback>
        ) : null}
      </div>

      {loaded && token ? (
        <InitiativeProfile
          id={id}
          initiative={loaded}
          manageHref={manageHref}
          photos={visiblePhotos}
          photosError={photos?.error}
          token={token}
        />
      ) : null}
    </main>
  );
}

function InitiativeProfile({
  id,
  initiative,
  manageHref,
  photos,
  photosError,
  token,
}: {
  id: string;
  initiative: Initiative;
  manageHref?: string;
  photos: Photo[];
  photosError?: string;
  token: string;
}) {
  const goal = findGoal(initiative.main_ods);
  const facts = initiativeFacts(initiative);
  const stats = facts.filter((fact) => fact.stat);
  // The e-mail, the only linked fact, is listed under "Contato".
  const details = facts.filter((fact) => !fact.stat && !fact.href);
  const coordinates =
    initiative.lat && initiative.lon
      ? { lat: initiative.lat, lon: initiative.lon }
      : null;
  const description = initiative.description?.trim();
  const suspended = Boolean(initiative.suspended_at);
  const showPhotos = photos.length > 0 || Boolean(manageHref);

  return (
    <>
      {goal ? <GoalPanel goal={goal} /> : null}

      <div
        className={`mx-auto mt-16 grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 ${loadIn}`}
        style={{ animationDelay: "150ms" }}
      >
        <section aria-labelledby="about-title" className="min-w-0">
          <h2 id="about-title" className={eyebrow}>
            Sobre a iniciativa
          </h2>

          {description ? (
            <ExpandableText className="mt-6 max-w-2xl text-lg" lines={8} text={description} />
          ) : manageHref ? (
            <ManageHint href={`${manageHref}?aba=dados`} label="escreva o texto “Sobre”">
              Conte a quem visita o que a iniciativa faz:
            </ManageHint>
          ) : null}

          {stats.length > 0 ? (
            <dl className="mt-8 flex flex-wrap gap-x-14 gap-y-6">
              {stats.map((fact) => (
                <div key={fact.label} className="flex flex-col-reverse">
                  <dt className="mt-2 font-bold">{fact.label}</dt>
                  <dd className="font-display text-7xl font-extrabold leading-[0.85] tabular-nums [font-stretch:75%]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {details.length > 0 ? (
            <dl className="mt-10 max-w-2xl border-b border-[var(--color-header-border)]">
              {details.map((fact) => (
                <div
                  key={fact.label}
                  className="grid gap-1 border-t border-[var(--color-header-border)] py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"
                >
                  <dt className="text-[var(--color-muted)]">{fact.label}</dt>
                  <dd className="font-bold wrap-anywhere">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>

        <ContactLinks initiative={initiative} manageHref={manageHref} />
      </div>

      {showPhotos || photosError || suspended ? (
        <PhotoGallery
          className={`mx-auto mt-24 max-w-6xl px-4 sm:px-6 ${loadIn}`}
          error={photosError}
          initiativeName={initiative.name || "Iniciativa sem nome"}
          manageHref={manageHref}
          photos={photos}
          suspended={suspended}
        />
      ) : null}

      <div
        className={`mx-auto mt-24 grid max-w-6xl gap-14 px-4 sm:px-6 lg:gap-16 ${
          coordinates ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""
        } ${loadIn}`}
        style={{ animationDelay: "300ms" }}
      >
        {coordinates ? (
          <section aria-labelledby="location-title" className="min-w-0">
            <h2 id="location-title" className={eyebrow}>
              Onde fica
            </h2>
            <MapFrame className="mt-6 h-80 sm:h-96">
              <LocationMap coordinates={coordinates} />
            </MapFrame>
          </section>
        ) : null}

        <div className={coordinates ? undefined : "max-w-2xl"}>
          <MembersPanel
            token={token}
            initiativeId={id}
            expectedCount={initiative.members_count}
            manageHref={manageHref}
          />
        </div>
      </div>
    </>
  );
}

function GoalPanel({ goal }: { goal: OdsGoal }) {
  return (
    <section
      aria-labelledby="goal-title"
      className={`mt-12 sm:mt-16 ${loadIn}`}
      style={{ backgroundColor: goal.color, color: goal.textColor }}
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[auto_1fr] md:items-end md:gap-14">
        <p
          aria-hidden="true"
          className="origin-bottom-left font-display text-[clamp(7rem,24vw,13rem)] font-extrabold leading-[0.8] tracking-[-0.02em] [font-stretch:75%] motion-safe:animate-[zoom_900ms_cubic-bezier(0.2,0.8,0.2,1)_250ms_both]"
        >
          {String(goal.number).padStart(2, "0")}
        </p>
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.1em]">
            ODS principal
          </p>
          <h2
            id="goal-title"
            className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-[-0.01em] [font-stretch:82%] sm:text-5xl"
          >
            <span className="sr-only">ODS {goal.number}: </span>
            {goal.name}
          </h2>
          <p className="mt-5 text-lg leading-relaxed">{goal.statement}.</p>
          <a
            href={`https://brasil.un.org/pt-br/sdgs/${goal.number}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block font-bold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          >
            Metas na ONU Brasil
            <span className="sr-only"> (abre em nova guia)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
