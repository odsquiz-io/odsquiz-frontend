import type { SeriesInterval } from "./types";

const integers = new Intl.NumberFormat("pt-BR");
const decimals = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const compacts = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percents = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

export const formatInteger = (value: number) => integers.format(value);

export const formatDecimal = (value: number) => decimals.format(value);

export const formatCompact = (value: number) => compacts.format(value);

export function formatShare(part: number, whole: number) {
  return percents.format(whole > 0 ? part / whole : 0);
}

export function share(part: number, whole: number) {
  return whole > 0 ? (part / whole) * 100 : 0;
}

export function plural(count: number, one: string, many: string) {
  return `${formatInteger(count)} ${count === 1 ? one : many}`;
}

// Dates travel as YYYY-MM-DD; reading them as UTC keeps the calendar day intact.
export function parseDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function dates(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...options });
}

const shortDay = dates({ day: "2-digit", month: "2-digit" });
const shortMonth = dates({ month: "short" });
const longDay = dates({ weekday: "short", day: "numeric", month: "short", year: "numeric" });
const longMonth = dates({ month: "long", year: "numeric" });
const mediumDay = dates({ day: "numeric", month: "short", year: "numeric" });

export function formatTick(value: string, interval: SeriesInterval) {
  const date = parseDay(value);

  if (interval !== "month") {
    return shortDay.format(date);
  }

  return `${shortMonth.format(date).replace(".", "")}/${String(date.getUTCFullYear()).slice(2)}`;
}

export function formatBucket(value: string, interval: SeriesInterval) {
  const date = parseDay(value);

  if (interval === "day") {
    return longDay.format(date);
  }

  if (interval === "month") {
    return longMonth.format(date);
  }

  const end = new Date(date);
  end.setUTCDate(end.getUTCDate() + 6);

  return `Semana de ${mediumDay.formatRange(date, end)}`;
}

export function formatDay(value: string) {
  return mediumDay.format(parseDay(value));
}

export function formatPeriod(from: string, to: string) {
  if (from && to) {
    return from === to
      ? formatDay(from)
      : mediumDay.formatRange(parseDay(from), parseDay(to));
  }

  if (from) {
    return `desde ${formatDay(from)}`;
  }

  return to ? `até ${formatDay(to)}` : "todo o histórico";
}
