const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

const absolute = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

const numbers = new Intl.NumberFormat("pt-BR");

const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 31_557_600],
  ["month", 2_629_800],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

const connectors = new Set(["a", "as", "o", "os", "e", "de", "da", "das", "do", "dos", "em", "na", "no", "para"]);

export function relativeTime(date: Date, now: number) {
  const seconds = Math.min(0, (date.getTime() - now) / 1000);

  for (const [unit, size] of units) {
    if (-seconds >= size) {
      return relative.format(Math.trunc(seconds / size), unit);
    }
  }

  return relative.format(0, "second");
}

export function formatDateTime(date: Date) {
  return absolute.format(date);
}

export function formatCount(value: number) {
  return numbers.format(value);
}

// Counts code points, like the API's rune limits.
export function countCharacters(text: string) {
  return [...text.trim()].length;
}

export function initials(name?: string) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const significant = words.filter((word) => !connectors.has(word.toLowerCase()));
  const picked = (significant.length > 0 ? significant : words).slice(0, 2);

  return picked.map((word) => [...word][0]).join("").toLocaleUpperCase("pt-BR");
}

export function commentsLabel(count: number) {
  if (count <= 0) {
    return "Comentar";
  }

  return count === 1 ? "1 comentário" : `${formatCount(count)} comentários`;
}
