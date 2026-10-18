"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { primaryButton, secondaryButton } from "@/components/styles";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex-1 bg-[var(--color-app-background)] pb-24 pt-36 text-[var(--color-app-foreground)] transition-colors sm:pt-44">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div role="alert">
          <PageHeader
            label="Erro inesperado"
            title="No meio do caminho tinha um erro."
          >
            Algo deu errado ao mostrar esta página. Tente de novo; se o
            problema continuar, volte ao início e siga por outro caminho.
          </PageHeader>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => reset()} className={primaryButton}>
            Tentar novamente
          </button>
          <Link href="/" className={secondaryButton}>
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
