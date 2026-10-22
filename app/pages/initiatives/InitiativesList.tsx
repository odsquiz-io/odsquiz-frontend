import type { ReactNode } from "react";
import { OdsBand } from "@/components/OdsBand";
import { SectionHeader } from "@/components/SectionHeader";
import { focusRing, secondaryButton, surface } from "@/components/styles";
import { findGoal } from "@/lib/ods";
import { formatNumber, initiativeFacts } from "./format";
import { InitiativeLinks } from "./InitiativeLinks";
import { SuspensionNotice } from "./SuspensionNotice";
import type { Initiative, ListStatus } from "./types";

type InitiativesListProps = {
  initiatives: Initiative[];
  message: string;
  onRefresh: () => void;
  status: ListStatus;
};

export const cardLink = `font-bold underline-offset-4 transition hover:text-[var(--color-link-hover)] hover:underline ${focusRing}`;

export function InitiativesList({
  initiatives,
  message,
  onRefresh,
  status,
}: InitiativesListProps) {
  const total = initiatives.length;

  return (
    <section aria-labelledby="initiatives-title" className="pt-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          animated={false}
          id="initiatives-title"
          label="Quem já está no mapa"
          title={total > 0 ? `${countLabel(total)}.` : "Iniciativas cadastradas."}
        >
          {total > 0
            ? "Cada cartão traz, na cor oficial, o objetivo em que a iniciativa mais atua."
            : null}
        </SectionHeader>
        <button
          type="button"
          disabled={status === "loading"}
          onClick={onRefresh}
          className={`shrink-0 self-start sm:self-auto ${secondaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {status === "loading" ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <ListFeedback status={status} total={total} message={message} />

      {total > 0 ? (
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((initiative, index) => (
            <li key={initiative.id ?? `${initiative.name}-${index}`}>
              <InitiativeCard initiative={initiative} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function countLabel(total: number) {
  return total === 1
    ? "1 iniciativa cadastrada"
    : `${formatNumber(total)} iniciativas cadastradas`;
}

function ListFeedback({
  message,
  status,
  total,
}: {
  message: string;
  status: ListStatus;
  total: number;
}) {
  if (status === "error") {
    return (
      <Feedback className="mt-12" tone="error">
        {message}
      </Feedback>
    );
  }

  if (status === "loading" && total === 0) {
    return (
      <Feedback className="mt-12" tone="loading">
        Carregando iniciativas...
      </Feedback>
    );
  }

  if (status !== "loading" && total === 0) {
    return <Feedback className="mt-12">Nenhuma iniciativa cadastrada ainda.</Feedback>;
  }

  return null;
}

export function InitiativeCard({
  initiative,
  links,
}: {
  initiative: Initiative;
  links?: ReactNode;
}) {
  const goal = findGoal(initiative.main_ods);

  return (
    <article className={`flex h-full flex-col overflow-hidden ${surface}`}>
      <h3 className="wrap-break-word px-5 pt-5 text-2xl font-extrabold leading-tight [font-stretch:85%]">
        {initiative.name || "Iniciativa sem nome"}
      </h3>
      <SuspensionNotice className="mx-5 mt-4 text-sm" initiative={initiative} />
      {goal ? (
        <p
          className="order-first flex items-center gap-3 px-5 py-4"
          style={{ backgroundColor: goal.color, color: goal.textColor }}
        >
          <span
            aria-hidden="true"
            className="font-display text-4xl font-extrabold leading-none [font-stretch:75%]"
          >
            {String(goal.number).padStart(2, "0")}
          </span>
          <span className="text-sm font-bold leading-snug">
            <span className="sr-only">ODS {goal.number}: </span>
            {goal.name}
          </span>
        </p>
      ) : (
        <OdsBand className="order-first h-1.5" />
      )}

      <dl className="mt-5 grid grid-cols-2 gap-4 px-5 text-sm">
        {initiativeFacts(initiative).map((fact) => (
          <div key={fact.label} className={fact.wide ? "col-span-2" : undefined}>
            <dt className="text-[var(--color-muted)]">{fact.label}</dt>
            <dd className="mt-0.5 font-medium wrap-anywhere">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto px-5 pb-5 pt-3">
        {links ?? <InitiativeLinks id={initiative.id} className={cardLink} />}
      </div>
    </article>
  );
}

export function Feedback({
  children,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "error" | "loading";
}) {
  const isError = tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`overflow-hidden rounded-lg border bg-[var(--color-header-background)] ${
        isError ? "border-[var(--color-error)]" : "border-[var(--color-header-border)]"
      } ${className}`}
    >
      {tone === "loading" ? (
        <OdsBand className="h-1 origin-left motion-safe:animate-[draw_1.2s_ease-in-out_infinite_alternate]" />
      ) : null}
      <p
        className={`p-5 font-medium ${
          isError ? "text-[var(--color-error)]" : "text-[var(--color-muted)]"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
