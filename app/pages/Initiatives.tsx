"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LoginRequired } from "@/components/LoginRequired";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { primaryButton } from "@/components/styles";
import { useAuthToken } from "@/lib/auth";
import { fetchInitiatives } from "./initiatives/api";
import { InitiativeForm } from "./initiatives/InitiativeForm";
import { InitiativesList } from "./initiatives/InitiativesList";
import { MapFrame, MapLoading } from "./initiatives/MapFrame";
import type { Initiative, ListStatus } from "./initiatives/types";

const InitiativesMap = dynamic(
  () =>
    import("./initiatives/map/InitiativesMap").then((mod) => mod.InitiativesMap),
  { loading: MapLoading, ssr: false },
);

export default function Initiatives() {
  const token = useAuthToken();
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
    <main className="min-h-svh flex-1 bg-[var(--color-app-background)] pb-28 text-[var(--color-app-foreground)] transition-colors">
      <div className="mx-auto max-w-6xl px-4 pt-36 sm:px-6 sm:pt-44">
        <PageHeader
          label="Iniciativas"
          title="Quem tira os ODS do papel."
          actions={
            token ? (
              <a href="#new-initiative" className={primaryButton}>
                Cadastre a sua iniciativa
                <span aria-hidden="true">&nbsp;↓</span>
              </a>
            ) : null
          }
        >
          Iniciativas são projetos comunitários que trabalham pelos Objetivos de
          Desenvolvimento Sustentável. Aqui você vê onde cada uma fica e o
          objetivo em que mais atua — e, com uma conta, pode cadastrar a sua.
        </PageHeader>

        {token === null ? (
          <LoginRequired
            className="mt-12 max-w-2xl"
            message="Entre na sua conta para ver o mapa de iniciativas e cadastrar a sua."
          />
        ) : token ? (
          <>
            <figure className="mt-12 sm:mt-16">
              <MapFrame band className="h-88 sm:h-128">
                <InitiativesMap initiatives={initiatives} />
              </MapFrame>
              <figcaption className="mt-3 text-sm text-[var(--color-muted)]">
                Clique em um marcador para ver a iniciativa. Os círculos
                numerados reúnem iniciativas próximas: clique neles para
                aproximar.
              </figcaption>
            </figure>

            <InitiativesList
              initiatives={initiatives}
              message={listMessage}
              status={listStatus}
              onRefresh={reloadInitiatives}
            />

            <section
              id="new-initiative"
              aria-labelledby="new-initiative-title"
              className="mt-24"
            >
              <SectionHeader
                id="new-initiative-title"
                label="Faça parte do mapa"
                title="Cadastre uma iniciativa."
              >
                Conhece um projeto que trabalha pelos ODS, ou faz parte de um?
                Coloque-o no mapa para que mais gente possa encontrá-lo. Todos
                os campos são obrigatórios.
              </SectionHeader>
              <div className="mt-12 max-w-3xl">
                <InitiativeForm token={token} onCreated={reloadInitiatives} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
