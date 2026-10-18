"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession } from "@/components/SessionProvider";
import { Spinner } from "../ui/States";
import { buttonClass, panel } from "../ui/styles";
import { Brand } from "./Brand";

export function AccessScreen({ state }: { state: "loading" | "signed-out" | "restricted" }) {
  const { signOut, user } = useSession();

  return (
    <main className="grid flex-1 place-items-center px-4 py-16">
      <div className={`w-full max-w-md p-6 sm:p-8 ${panel}`}>
        <Brand />
        {state === "loading" ? (
          <p role="status" className="mt-8 flex items-center gap-3 text-sm text-[var(--admin-muted)]">
            <Spinner />
            Carregando o painel...
          </p>
        ) : state === "signed-out" ? (
          <Message
            title="Entre para acessar o painel"
            actions={
              <>
                <Link href="/login" className={buttonClass("primary")}>
                  Entrar
                </Link>
                <Link href="/" className={buttonClass("secondary")}>
                  Voltar ao site
                </Link>
              </>
            }
          >
            O painel administrativo do ODS Quiz é exclusivo para administradores. Entre com a
            sua conta para continuar.
          </Message>
        ) : (
          <Message
            title="Acesso restrito"
            actions={
              <>
                <Link href="/" className={buttonClass("primary")}>
                  Voltar ao site
                </Link>
                <Link href="/login" onClick={signOut} className={buttonClass("secondary")}>
                  Entrar com outra conta
                </Link>
              </>
            }
          >
            A conta <strong className="font-medium text-[var(--admin-text)]">{user?.email}</strong>{" "}
            não tem permissão para acessar o painel administrativo. Se você precisa de acesso,
            peça a um administrador.
          </Message>
        )}
      </div>
    </main>
  );
}

function Message({
  actions,
  children,
  title,
}: {
  actions: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <>
      <h1 className="mt-8 text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--admin-muted)]">{children}</p>
      <div className="mt-6 flex flex-wrap gap-2">{actions}</div>
    </>
  );
}
