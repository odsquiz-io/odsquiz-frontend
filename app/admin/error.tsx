"use client";

import Link from "next/link";
import { ErrorState } from "@/app/pages/admin/ui/States";
import { buttonClass } from "@/app/pages/admin/ui/styles";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <>
      <ErrorState
        title="Algo deu errado nesta página"
        message="Tente de novo. Se o problema continuar, volte para a visão geral e siga por outro caminho."
        onRetry={reset}
      />
      <Link href="/admin" className={`self-center ${buttonClass("ghost")}`}>
        Ir para a visão geral
      </Link>
    </>
  );
}
