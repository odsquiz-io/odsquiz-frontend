import type {
  InitiativeFieldErrors,
  InitiativeFormState,
} from "./types";

export const DESCRIPTION_MAX_LENGTH = 2000;

export const CAPTION_MAX_LENGTH = 200;

export const WEBSITE_MAX_LENGTH = 255;

// Counts characters as the API does, so an emoji counts once.
export function textLength(value: string) {
  return Array.from(value.trim()).length;
}

export const initialFormState: InitiativeFormState = {
  name: "",
  address: "",
  cep: "",
  emailOwner: "",
  whatsapp: "",
  instagram: "",
  website: "",
  actingArea: "",
  impact: "",
  type: "",
  mainODS: "",
  description: "",
};

export function validateInitiativeForm(form: InitiativeFormState) {
  const errors: InitiativeFieldErrors = {};
  const impact = Number(form.impact);
  const mainODS = Number(form.mainODS);

  requireText(errors, form, "name", "Informe o nome da iniciativa.");
  requireText(errors, form, "address", "Informe o endereço.");
  requireText(errors, form, "cep", "Informe o CEP.");
  requireText(errors, form, "actingArea", "Informe a área de atuação.");
  requireText(errors, form, "type", "Informe o tipo.");

  if (!form.emailOwner.trim()) {
    errors.emailOwner = "Informe o e-mail de contato.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOwner.trim())) {
    errors.emailOwner = "Informe um e-mail válido.";
  }

  if (normalizeWhatsapp(form.whatsapp) === undefined) {
    errors.whatsapp = contactErrors.whatsapp;
  }

  if (normalizeInstagram(form.instagram) === undefined) {
    errors.instagram = contactErrors.instagram;
  }

  if (normalizeWebsite(form.website) === undefined) {
    errors.website = contactErrors.website;
  }

  if (!form.impact.trim()) {
    errors.impact = "Informe o impacto.";
  } else if (!Number.isInteger(impact) || impact < 0) {
    errors.impact = "Use um número inteiro igual ou maior que zero.";
  }

  if (!form.mainODS.trim()) {
    errors.mainODS = "Informe o ODS principal.";
  } else if (!Number.isInteger(mainODS) || mainODS < 1 || mainODS > 17) {
    errors.mainODS = "Use um número entre 1 e 17.";
  }

  if (textLength(form.description) > DESCRIPTION_MAX_LENGTH) {
    errors.description = "Use no máximo 2.000 caracteres.";
  }

  return errors;
}

export const contactErrors = {
  whatsapp: "Informe o número com DDD, como (22) 99999-9999.",
  instagram: "Informe um perfil do Instagram válido, como @suainiciativa.",
  website: "Informe um endereço válido, como suainiciativa.org.br.",
} as const;

// The normalisers mirror the API: null clears the field, undefined means invalid.
export function normalizeWhatsapp(value: string) {
  if (!value.trim()) {
    return null;
  }

  let digits = value.replace(/\D/g, "");

  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  return /^55\d{10,11}$/.test(digits) ? digits : undefined;
}

export function normalizeInstagram(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const profile = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]*)\/?(?:[?#].*)?$/i);
  const handle = (profile ? profile[1] : trimmed).replace(/^@/, "");

  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : undefined;
}

export function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const website = trimmed.includes("://") ? trimmed : `https://${trimmed}`;

  if (/\s/.test(website) || website.length > WEBSITE_MAX_LENGTH) {
    return undefined;
  }

  try {
    const { hostname, password, protocol, username } = new URL(website);

    return (protocol === "http:" || protocol === "https:") &&
      hostname.includes(".") &&
      !username &&
      !password
      ? website
      : undefined;
  } catch {
    return undefined;
  }
}

function requireText(
  errors: InitiativeFieldErrors,
  form: InitiativeFormState,
  field: keyof InitiativeFormState,
  message: string,
) {
  if (!form[field].trim()) {
    errors[field] = message;
  }
}

