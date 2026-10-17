import Link from "next/link";
import { odsGoals } from "@/lib/ods";
import { SectionHeader } from "./SectionHeader";
import { stagger } from "./styles";

const tileClassName =
  "flex min-h-40 flex-col justify-between gap-4 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-app-foreground)]";

const numberClassName =
  "font-display text-5xl font-extrabold leading-none [font-stretch:75%]";

export function Goals() {
  return (
    <section aria-labelledby="goals-title" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          id="goals-title"
          label="O que são os ODS"
          title="17 objetivos, um mesmo prazo."
        >
          Em setembro de 2015, todos os Estados-membros da ONU adotaram a Agenda
          2030: um plano com 17 objetivos e 169 metas para acabar com a pobreza,
          proteger o planeta e garantir paz e prosperidade para todas as
          pessoas. Eles são integrados: o que se faz por um afeta os resultados
          dos outros. Abra cada objetivo para ler a definição oficial.
        </SectionHeader>

        <ul className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {odsGoals.map((goal, index) => (
            <li key={goal.number} className="build" style={stagger(index % 6)}>
              <details
                className="group h-full rounded-md"
                style={{ backgroundColor: goal.color, color: goal.textColor }}
              >
                <summary
                  className={`${tileClassName} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
                >
                  <span className="flex items-start justify-between" aria-hidden="true">
                    <span className={numberClassName}>
                      {String(goal.number).padStart(2, "0")}
                    </span>
                    <span className="text-2xl font-bold leading-none transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                  <span className="text-sm font-bold leading-snug">
                    <span className="sr-only">ODS {goal.number}: </span>
                    {goal.name}
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm leading-relaxed">
                  <p>{goal.statement}.</p>
                  <a
                    href={`https://brasil.un.org/pt-br/sdgs/${goal.number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block font-bold underline underline-offset-4"
                  >
                    Metas na ONU Brasil
                    <span className="sr-only"> (abre em nova guia)</span>
                  </a>
                </div>
              </details>
            </li>
          ))}
          <li className="build" style={stagger(5)}>
            <Link
              href="/quiz"
              className={`${tileClassName} h-full rounded-md border-2 border-dashed border-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-app-background)]`}
            >
              <span className={numberClassName}>Você</span>
              <span className="text-sm font-bold leading-snug">
                Qual deles tem mais a ver com a sua realidade? Faça o quiz
                <span aria-hidden="true"> →</span>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
