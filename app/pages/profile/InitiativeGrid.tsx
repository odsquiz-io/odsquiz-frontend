import Link from "next/link";
import { focusRing } from "@/components/styles";
import { cardLink, InitiativeCard } from "../initiatives/InitiativesList";
import type { Initiative } from "../initiatives/types";

export function InitiativeGrid({ initiatives }: { initiatives: Initiative[] }) {
  return (
    <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {initiatives.map((initiative, index) => (
        <li key={initiative.id ?? `${initiative.name}-${index}`}>
          <InitiativeCard
            initiative={initiative}
            links={
              initiative.id ? (
                <Link
                  href={`/initiatives/${initiative.id}/manage`}
                  className={`mt-3 inline-block ${cardLink}`}
                >
                  Gerenciar iniciativa
                  <span className="sr-only"> {initiative.name}</span>
                  <span aria-hidden="true"> →</span>
                </Link>
              ) : null
            }
          />
        </li>
      ))}
      <li>
        <Link
          href="/initiatives#new-initiative"
          className={`flex h-full min-h-48 flex-col justify-between gap-8 rounded-lg border-2 border-dashed border-[var(--color-app-foreground)] p-5 transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-app-background)] ${focusRing}`}
        >
          <span
            aria-hidden="true"
            className="font-display text-6xl font-extrabold leading-none [font-stretch:75%]"
          >
            +
          </span>
          <span className="font-display text-2xl font-extrabold leading-tight [font-stretch:85%]">
            {initiatives.length > 0
              ? "Cadastrar outra iniciativa"
              : "Cadastrar sua primeira iniciativa"}
            <span aria-hidden="true"> →</span>
          </span>
        </Link>
      </li>
    </ul>
  );
}
