import Link from "next/link";
import { OdsBand } from "@/components/OdsBand";
import { SectionHeader } from "@/components/SectionHeader";
import { primaryButton, stagger, surface } from "@/components/styles";

const paths = [
  {
    title: "Responda ao quiz",
    text: "22 perguntas sobre o dia a dia da sua casa e do seu bairro. Com sua conta, você vê como a sua realidade se relaciona com cada objetivo.",
    href: "/quiz",
    action: "Fazer o quiz",
  },
  {
    title: "Mapeie iniciativas",
    text: "Conheça quem já atua pelos ODS perto de você e cadastre a sua. Cada iniciativa aparece no mapa, com o objetivo em que mais atua.",
    href: "/initiatives",
    action: "Ver iniciativas",
  },
];

export function Participate() {
  return (
    <section aria-labelledby="participate-title" className="pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          id="participate-title"
          label="Como participar"
          title="Dois jeitos de começar hoje."
        />

        <ol className="mt-12 grid gap-4 [--end:30%] md:grid-cols-2">
          {paths.map((path, index) => (
            <li
              key={path.href}
              className={`build flex flex-col overflow-hidden ${surface}`}
              style={stagger(index)}
            >
              <OdsBand className="draw h-1.5" />
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <span
                  aria-hidden="true"
                  className="font-display text-6xl font-extrabold leading-none [font-stretch:75%]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-2xl font-extrabold">{path.title}</h3>
                <p className="mt-3 flex-1 text-[var(--color-muted)]">{path.text}</p>
                <Link href={path.href} className={`mt-8 self-start ${primaryButton}`}>
                  {path.action}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
