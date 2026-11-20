// The terms of use and the privacy policy share one version: the date they took effect.
// Signup sends it, so each account records which text was accepted.
export const LEGAL_VERSION = "2026-11-20";

export const MINIMUM_AGE = 16;

export const legalEffectiveDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "UTC",
}).format(new Date(`${LEGAL_VERSION}T00:00:00Z`));
