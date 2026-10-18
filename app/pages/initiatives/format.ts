import { formatCep } from "@/lib/cep";
import type { Initiative } from "./types";

type Fact = {
  href?: string;
  label: string;
  stat?: boolean;
  value?: string;
  wide?: boolean;
};

const numbers = new Intl.NumberFormat("pt-BR");

export function formatNumber(value: number) {
  return numbers.format(value);
}

export function initiativeFacts(initiative: Initiative) {
  const { acting_area, address, cep, email_owner, impact, points, type } =
    initiative;

  const facts: Fact[] = [
    { label: "Tipo", value: type },
    { label: "Área de atuação", value: acting_area },
    { label: "Endereço", value: address, wide: true },
    { label: "CEP", value: formatCep(cep) },
    {
      label: "Pessoas atendidas",
      stat: true,
      value: typeof impact === "number" ? formatNumber(impact) : undefined,
    },
    {
      href: `mailto:${email_owner}`,
      label: "Responsável",
      value: email_owner,
      wide: true,
    },
    {
      label: "Pontos",
      stat: true,
      value: points && points > 0 ? formatNumber(points) : undefined,
    },
  ];

  return facts.filter((fact) => fact.value);
}
