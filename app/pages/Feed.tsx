"use client";

import Link from "next/link";
import { LoginRequired } from "@/components/LoginRequired";
import { PageHeader } from "@/components/PageHeader";
import { eyebrow, focusRing } from "@/components/styles";
import { useAuthToken } from "@/lib/auth";
import { PostList } from "./feed/PostList";
import { usePostPages } from "./feed/usePages";

export default function Feed() {
  const token = useAuthToken();

  return (
    <main className="min-h-svh flex-1 bg-[var(--color-app-background)] pb-28 text-[var(--color-app-foreground)] transition-colors">
      <div className="mx-auto max-w-6xl px-4 pt-36 sm:px-6 sm:pt-44">
        <PageHeader label="Atividades" title="O que as iniciativas andam fazendo.">
          Novidades publicadas por quem participa das iniciativas: resultados,
          convites e bastidores do trabalho pelos ODS. Comente para apoiar e
          trocar ideias.
        </PageHeader>

        {token === null ? (
          <LoginRequired
            className="mt-12 max-w-2xl"
            message="Entre na sua conta para ver e comentar as atividades das iniciativas."
          />
        ) : token ? (
          <FeedContent token={token} />
        ) : null}
      </div>
    </main>
  );
}

function FeedContent({ token }: { token: string }) {
  const feed = usePostPages(token);

  return (
    <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,42rem)_minmax(0,1fr)] lg:gap-16">
      <section aria-labelledby="feed-title" className="min-w-0">
        <h2 id="feed-title" className={eyebrow}>
          Mais recentes
        </h2>
        <div className="mt-6">
          <PostList
            token={token}
            feed={feed}
            emptyMessage="Nenhuma iniciativa publicou atividades ainda."
          />
        </div>
      </section>

      <aside aria-labelledby="feed-help-title" className="lg:pt-12">
        <div className="lg:sticky lg:top-[calc(var(--size-header-offset)*2+var(--size-header-nav-height)+1.5rem)]">
          <h2 id="feed-help-title" className={eyebrow}>
            Como funciona
          </h2>
          <ul className="mt-6 grid gap-4 border-t border-[var(--color-header-border)] pt-4 text-[var(--color-muted)]">
            <li>
              Quem gerencia ou participa de uma iniciativa publica pela página
              dela.
            </li>
            <li>
              Qualquer pessoa com conta pode comentar. Quem escreveu pode editar
              ou excluir.
            </li>
            <li>A moderação do ODS Quiz pode suspender conteúdos que fujam das regras.</li>
          </ul>
          <Link
            href="/initiatives"
            className={`mt-6 inline-flex items-center gap-2 font-bold underline-offset-4 transition hover:text-[var(--color-link-hover)] hover:underline ${focusRing}`}
          >
            Conhecer as iniciativas
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
