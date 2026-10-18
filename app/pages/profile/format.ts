export function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString("pt-BR", options);
}
