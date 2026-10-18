const numbers = new Intl.NumberFormat("pt-BR");

const dates = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimes = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatNumber(value: number) {
  return numbers.format(value);
}

export function formatDate(value: string) {
  return format(dates, value);
}

export function formatDateTime(value: string) {
  return format(dateTimes, value);
}

function format(formatter: Intl.DateTimeFormat, value: string) {
  // Date-only values are calendar days; parsing them as UTC would show the previous day here.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);

  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}
