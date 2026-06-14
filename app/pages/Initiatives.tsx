"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Header } from "@/components/Header";
import {
  fetchInitiatives,
  getServerAuthToken,
  getStoredAuthToken,
  subscribeToAuthToken,
} from "./initiatives/api";
import { InitiativeForm } from "./initiatives/InitiativeForm";
import { InitiativesList } from "./initiatives/InitiativesList";
import type { Initiative, ListStatus } from "./initiatives/types";

export default function Initiatives() {
  const token = useSyncExternalStore(
    subscribeToAuthToken,
    getStoredAuthToken,
    getServerAuthToken,
  );
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("idle");
  const [listMessage, setListMessage] = useState("");
  const [listReloadKey, setListReloadKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;
    const authToken = token;

    async function loadInitiatives() {
      if (isCurrent) {
        setListStatus("loading");
        setListMessage("");
      }

      try {
        const nextInitiatives = await fetchInitiatives(authToken);

        if (isCurrent) {
          setInitiatives(nextInitiatives);
          setListStatus("idle");
        }
      } catch (error) {
        if (isCurrent) {
          setListStatus("error");
          setListMessage(
            error instanceof Error
              ? error.message
              : "Algo deu errado ao carregar as iniciativas.",
          );
        }
      }
    }

    loadInitiatives();

    return () => {
      isCurrent = false;
    };
  }, [listReloadKey, token]);

  function reloadInitiatives() {
    setListReloadKey((currentKey) => currentKey + 1);
  }

  return (
    <main className="relative min-h-screen bg-[var(--color-app-background)] transition-colors">
      <Header />

      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-link-hover)]">
            ODS Quiz
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--color-app-foreground)]">
            Iniciativas
          </h1>
        </div>

        {!token ? (
          <LoginRequired />
        ) : (
          <>
            <InitiativeForm token={token} onCreated={reloadInitiatives} />
            <InitiativesList
              initiatives={initiatives}
              message={listMessage}
              status={listStatus}
              onRefresh={reloadInitiatives}
            />
          </>
        )}
      </section>
    </main>
  );
}

function LoginRequired() {
  return (
    <div className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 text-[var(--color-app-foreground)] shadow-2xl shadow-black/20">
      <h2 className="text-xl font-bold">Login necessário</h2>
      <p className="mt-2 text-sm">
        Entre na sua conta para cadastrar uma nova iniciativa.
      </p>
      <Link
        href="/login"
        className="mt-5 inline-flex min-h-11 items-center rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)]"
      >
        Fazer login
      </Link>
    </div>
  );
}
