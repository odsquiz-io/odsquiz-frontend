import Link from "next/link";
import type { CSSProperties } from "react";
import { OdsBand } from "@/components/OdsBand";
import { odsGoals } from "@/lib/ods";
import { eyebrow, primaryButton, secondaryButton } from "./styles";

const skyline = [62, 80, 52, 92, 70, 58, 100, 74, 86, 48, 95, 66, 82, 56, 90, 68, 97];
const sink = [62, 30, 74, 44, 82, 38, 22, 66, 48, 86, 34, 58, 18, 76, 52, 90, 40];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden pt-36 sm:pt-44">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className={eyebrow}>
          Agenda&nbsp;2030 · 17&nbsp;objetivos · 169&nbsp;metas
        </p>
        <h1
          id="hero-title"
          className="mt-5 max-w-5xl text-[clamp(3rem,9vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.015em] [font-stretch:80%]"
        >
          A Agenda 2030 cabe no{" "}
          <span className="relative inline-block">
            seu bairro.
            <OdsBand className="absolute inset-x-0 -bottom-1 h-2 sm:h-3" />
          </span>
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)] sm:text-xl">
          Os 17 Objetivos de Desenvolvimento Sustentável foram pensados para o
          mundo inteiro, mas só se cumprem rua a rua. Responda ao quiz, veja
          como a sua realidade se relaciona com eles e encontre quem já faz a
          diferença perto de você.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/quiz" className={primaryButton}>
            Fazer o quiz
          </Link>
          <Link href="/initiatives" className={secondaryButton}>
            Ver iniciativas no mapa
          </Link>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mx-auto mt-16 flex h-48 max-w-6xl items-end gap-1 overflow-hidden px-4 sm:mt-20 sm:h-72 sm:gap-1.5 sm:px-6"
      >
        {odsGoals.map((goal, index) => (
          <span
            key={goal.number}
            className="sink flex-1"
            style={
              { height: `${skyline[index]}%`, "--sink": `${sink[index]}%` } as CSSProperties
            }
          >
            <span
              className="flex h-full origin-bottom justify-center rounded-t-[3px] pt-2 font-display text-xs font-bold motion-safe:animate-[rise_1100ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
              style={{
                backgroundColor: goal.color,
                color: goal.textColor,
                animationDelay: `${index * 55}ms`,
              }}
            >
              <span className="hidden sm:inline">{goal.number}</span>
            </span>
          </span>
        ))}
      </div>
      <div className="h-0.5 bg-[var(--color-app-foreground)]" />
    </section>
  );
}
