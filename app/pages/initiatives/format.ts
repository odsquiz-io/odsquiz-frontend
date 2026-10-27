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

const connectors = new Set(["a", "as", "o", "os", "e", "de", "da", "das", "do", "dos", "em", "na", "no", "para"]);

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

export function initials(name?: string) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const significant = words.filter((word) => !connectors.has(word.toLowerCase()));
  const picked = (significant.length > 0 ? significant : words).slice(0, 2);

  return picked.map((word) => [...word][0]).join("").toLocaleUpperCase("pt-BR");
}

// Shows a number stored as "55" + DDD + number the way people write it.
export function formatWhatsapp(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  const match = digits.match(/^55(\d{2})(\d{4,5})(\d{4})$/);

  return match ? `+55 (${match[1]}) ${match[2]}-${match[3]}` : (value ?? "");
}
