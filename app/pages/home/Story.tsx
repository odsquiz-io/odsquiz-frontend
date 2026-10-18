import { OdsBand } from "@/components/OdsBand";
import { SectionHeader } from "@/components/SectionHeader";
import { stagger } from "@/components/styles";

const DAY = 86_400_000;
const adoption = Date.UTC(2015, 8, 25);
const deadline = Date.UTC(2031, 0, 1);

const milestones = [
  {
    date: "set. 2015",
    title: "A ONU adota a Agenda 2030",
    text: "Todos os Estados-membros assumem 17 objetivos e 169 metas, com prazo até 2030.",
  },
  {
    date: "out. 2022",
    title: "O ODS Quiz nasce no Hack2030",
    text: "Desafiada a ligar necessidades locais aos ODS, a Serra Hackclub cria o ODS Quiz e vence o hackathon promovido pela UERJ com SEAS, CEDAE, FAPERJ e INEA.",
  },
  {
    date: "2026",
    title: "O protótipo vira plataforma",
    text: "O projeto é reconstruído do zero para crescer junto com as comunidades.",
  },
  {
    date: "2030",
    title: "O prazo dos 17 objetivos",
    text: "Até lá, cada resposta e cada iniciativa cadastrada ajudam a mostrar onde cada território está.",
  },
];

function agendaProgress() {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  })
    .format(new Date())
    .split("-")
    .map(Number);
  const today = Date.UTC(year, month - 1, day);

  return {
    daysLeft: Math.max(0, Math.round((deadline - today) / DAY)),
    elapsed: Math.min(1, (today - adoption) / (deadline - adoption)),
  };
}

export function Story() {
  const { daysLeft, elapsed } = agendaProgress();
  const elapsedPercent = elapsed * 100;

  return (
    <section
      aria-labelledby="story-title"
      className="scheme-dark bg-[var(--color-header-background)] py-24 text-[var(--color-app-foreground)]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          id="story-title"
          label="Por que existimos"
          title="Um prazo global. Uma resposta local."
        >
          O ODS Quiz nasceu de uma pergunta: como ligar o que falta em cada
          bairro aos compromissos que o mundo assumiu?
        </SectionHeader>

        <div className="mt-16">
          <p className="zoom font-display text-[clamp(4.5rem,16vw,11rem)] font-extrabold leading-[0.85] tabular-nums [font-stretch:75%]">
            {new Intl.NumberFormat("pt-BR").format(daysLeft)}
          </p>
          <p className="mt-3 text-xl font-bold">dias até o fim de 2030</p>

          <div className="@container relative mt-10">
            <OdsBand className="h-4 overflow-hidden rounded-sm opacity-25" />
            <div
              className="uncover absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - elapsedPercent}% 0 0)` }}
            >
              <OdsBand className="h-full overflow-hidden rounded-sm" />
            </div>
            <div
              className="advance absolute -inset-y-2 left-0 w-0.5 bg-[var(--color-app-foreground)]"
              style={{ transform: `translateX(${elapsedPercent}cqw)` }}
            />
          </div>
          <div className="mt-4 flex justify-between gap-4 text-sm text-[var(--color-muted)]">
            <span>set. 2015</span>
            <span className="text-center font-bold text-[var(--color-app-foreground)]">
              {Math.floor(elapsedPercent)}% do prazo já passou
            </span>
            <span>dez. 2030</span>
          </div>
        </div>

        <ol className="mt-20 grid gap-10 md:grid-cols-4 md:gap-6">
          {milestones.map((milestone, index) => (
            <li
              key={milestone.date}
              className="build border-t border-[var(--color-header-border)] pt-5"
              style={stagger(index)}
            >
              <p className="font-display text-3xl font-extrabold [font-stretch:80%]">
                {milestone.date}
              </p>
              <h3 className="mt-3 text-lg font-bold">{milestone.title}</h3>
              <p className="mt-2 text-[var(--color-muted)]">{milestone.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
