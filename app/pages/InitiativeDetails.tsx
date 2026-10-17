"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { LoginRequired } from "@/components/LoginRequired";
import { useAuthToken } from "@/lib/auth";
import { fetchInitiative } from "./initiatives/api";
import { Feedback, InitiativeCard } from "./initiatives/InitiativesList";
import type { Initiative } from "./initiatives/types";

const LocationMap = dynamic(
  () => import("./initiatives/map/LocationMap").then((mod) => mod.LocationMap),
  { ssr: false },
);

export default function InitiativeDetails({ id }: { id: string }) {
  const token = useAuthToken();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
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

    return () => {
      isCurrent = false;
    };
  }, [id, token]);

  return (
    <main className="relative min-h-screen bg-[var(--color-app-background)] transition-colors">
      <Header />

      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-link-hover)]">
              ODS Quiz
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[var(--color-app-foreground)]">
              Iniciativa
            </h1>
          </div>
          <Link
            href="/initiatives"
            className="inline-flex h-10 items-center rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)]"
          >
            Voltar
          </Link>
        </div>

        {!token ? (
          <LoginRequired message="Entre na sua conta para ver esta iniciativa." />
        ) : error ? (
          <Feedback tone="error">{error}</Feedback>
        ) : !initiative ? (
          <Feedback>Carregando iniciativa...</Feedback>
        ) : (
          <>
            <InitiativeCard initiative={initiative} />
            {initiative.lat && initiative.lon ? (
              <div className="mt-8 h-80">
                <LocationMap coordinates={{ lat: initiative.lat, lon: initiative.lon }} />
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
