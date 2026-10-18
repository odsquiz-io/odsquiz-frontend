import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { primaryButton, secondaryButton } from "@/components/styles";
import { odsGoals } from "@/lib/ods";

const street = [...odsGoals.slice(0, 9), null, ...odsGoals.slice(9)];
const heights = [58, 76, 50, 88, 66, 54, 94, 72, 84, 40, 62, 90, 52, 80, 60, 96, 70, 86];

export default function NotFound() {
  return (
    <main className="flex-1 bg-[var(--color-app-background)] pb-24 pt-36 text-[var(--color-app-foreground)] transition-colors sm:pt-44">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageHeader label="Erro 404" title="Este endereço não está no mapa.">
          O link pode estar quebrado, ou a página pode ter mudado de endereço.
          Acontece até nos melhores bairros.
        </PageHeader>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/" className={primaryButton}>
            Voltar ao início
          </Link>
          <Link href="/quiz" className={secondaryButton}>
            Fazer o quiz
          </Link>
          <Link href="/initiatives" className={secondaryButton}>
            Ver iniciativas no mapa
          </Link>
        </div>

        <div
          aria-hidden="true"
          className="mt-16 flex h-40 items-end gap-1 border-b-2 border-[var(--color-app-foreground)] font-display text-xs font-bold sm:mt-20 sm:h-56 sm:gap-1.5"
        >
          {street.map((goal, index) =>
            goal ? (
              <span
                key={goal.number}
                className="flex flex-1 origin-bottom justify-center rounded-t-[3px] pt-2 motion-safe:animate-[rise_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
                style={{
                  height: `${heights[index]}%`,
                  backgroundColor: goal.color,
                  color: goal.textColor,
                  animationDelay: `${index * 45}ms`,
                }}
              >
                <span className="hidden sm:inline">{goal.number}</span>
              </span>
            ) : (
              <span
                key="lot"
                className="relative flex flex-1 justify-center rounded-t-[3px] border-2 border-b-0 border-dashed border-[var(--color-app-foreground)] pt-1.5"
                style={{ height: `${heights[index]}%` }}
              >
                <span className="hidden sm:inline">404</span>
                <span className="absolute bottom-full left-1/2 z-10 mb-3 origin-bottom -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-app-foreground)] px-2.5 py-1 font-sans text-[var(--color-app-background)] motion-safe:animate-[zoom_400ms_cubic-bezier(0.2,0.8,0.2,1)_1s_both] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[6px] after:border-t-[6px] after:border-x-transparent after:border-t-[var(--color-app-foreground)]">
                  Você está aqui
                </span>
              </span>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
