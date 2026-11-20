import Link from "next/link";
import { OdsBand } from "./OdsBand";
import { focusRing } from "./styles";

const linkClassName = `rounded-sm underline-offset-4 transition hover:text-[var(--color-link-hover)] hover:underline ${focusRing}`;

export function Footer() {
  return (
    <footer className="text-[var(--color-app-foreground)]">
      <OdsBand className="h-1.5" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-14 text-sm sm:px-6 md:grid-cols-[2fr_1fr_1.4fr]">
        <div>
          <p className="font-display text-2xl font-extrabold">ODS Quiz</p>
          <p className="mt-3 max-w-sm text-[var(--color-muted)]">
            Criado pela Serra Hackclub no Hack2030, desafio promovido pela UERJ
            em 2022. Reconstruído por Kauan Peçanha.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <p className="font-bold">Navegue</p>
          <ul className="mt-3 grid gap-2 text-[var(--color-muted)]">
            <li>
              <Link href="/" className={linkClassName}>
                Início
              </Link>
            </li>
            <li>
              <Link href="/quiz" className={linkClassName}>
                Quiz
              </Link>
            </li>
            <li>
              <Link href="/initiatives" className={linkClassName}>
                Iniciativas
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="font-bold">Fonte</p>
          <p className="mt-3 text-[var(--color-muted)]">
            Nomes e declarações dos objetivos:{" "}
            <a
              href="https://brasil.un.org/pt-br/sdgs"
              target="_blank"
              rel="noreferrer"
              className={`underline ${linkClassName}`}
            >
              ONU Brasil
              <span className="sr-only"> (abre em nova guia)</span>
            </a>
            .
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14 text-sm sm:px-6">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--color-header-border)] pt-6 text-[var(--color-muted)]">
          <li>
            <Link href="/privacy" className={linkClassName}>
              Política de privacidade
            </Link>
          </li>
          <li>
            <Link href="/terms" className={linkClassName}>
              Termos de uso
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
