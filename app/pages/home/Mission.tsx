import { eyebrow, stagger } from "./styles";

const principles = [
  {
    title: "Escutar o território",
    text: "O quiz parte do cotidiano — renda, saúde, escola, água, reciclagem — para dar endereço à agenda global.",
  },
  {
    title: "Mostrar quem faz",
    text: "Iniciativas comunitárias ganham lugar no mapa, com o objetivo em que mais atuam.",
  },
  {
    title: "Explicar sem complicar",
    text: "Linguagem direta e fonte oficial em cada objetivo, para que ninguém fique de fora.",
  },
];

export function Mission() {
  return (
    <section aria-labelledby="mission-title" className="py-24">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 id="mission-title" className={eyebrow}>
            Nossa missão
          </h2>
          <p className="mt-4 font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.02em] [font-stretch:85%] [view-timeline-name:--ink] sm:text-4xl lg:text-5xl">
            <span className="ink">
              Aproximar a Agenda 2030 de quem vive o território: ouvir como cada
              comunidade percebe o avanço dos ODS e dar visibilidade a quem já
              trabalha por eles.
            </span>
          </p>
        </div>

        <ol className="grid content-start gap-8">
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              className="slide grid grid-cols-[auto_1fr] gap-x-5 border-t border-[var(--color-header-border)] pt-6"
              style={stagger(index)}
            >
              <span
                aria-hidden="true"
                className="font-display text-4xl font-extrabold leading-none [font-stretch:75%]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-bold">{principle.title}</h3>
                <p className="mt-2 text-[var(--color-muted)]">{principle.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
