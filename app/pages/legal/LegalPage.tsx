import type { ReactNode } from "react";
import { OdsBand } from "@/components/OdsBand";
import { PageHeader } from "@/components/PageHeader";
import { surface, textLink } from "@/components/styles";
import { legalEffectiveDate } from "@/lib/legal";

const CONTACT_EMAIL = "privacidade@odsquiz.com";

export function LegalPage({
  children,
  intro,
  label,
  summary,
  title,
}: {
  children: ReactNode;
  intro: string;
  label: string;
  summary: ReactNode[];
  title: string;
}) {
  return (
    <main className="flex-1 bg-[var(--color-app-background)] pb-24 pt-36 text-[var(--color-app-foreground)] transition-colors sm:pt-44">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageHeader label={label} title={title}>
          {intro}
        </PageHeader>
        <p className="mt-6 text-sm font-bold text-[var(--color-muted)]">
          Em vigor desde {legalEffectiveDate}.
        </p>

        <section
          aria-labelledby="summary-title"
          className={`mt-12 max-w-3xl overflow-hidden ${surface}`}
        >
          <OdsBand className="h-1.5" />
          <div className="p-6 sm:p-8">
            <h2 id="summary-title" className="text-2xl font-extrabold [font-stretch:85%]">
              Em resumo
            </h2>
            <LegalList className="mt-4">
              {summary.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </LegalList>
          </div>
        </section>

        <div className="mt-16 grid max-w-3xl gap-14 leading-relaxed">{children}</div>
      </div>
    </main>
  );
}

export function LegalSection({
  children,
  id,
  title,
}: {
  children: ReactNode;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={id}>
      <h2
        id={id}
        className="text-3xl font-extrabold leading-tight tracking-[-0.01em] [font-stretch:85%]"
      >
        {title}
      </h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

export function LegalList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={`grid list-disc gap-2 pl-5 marker:text-[var(--color-muted)] ${className}`}>
      {children}
    </ul>
  );
}

export function ContactEmail() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className={textLink}>
      {CONTACT_EMAIL}
    </a>
  );
}
