import type {
  InitiativeFieldErrors,
  InitiativeFormState,
} from "./types";

export const DESCRIPTION_MAX_LENGTH = 2000;

// Counts characters as the API does, so an emoji counts once.
export function textLength(value: string) {
  return Array.from(value.trim()).length;
}

export const initialFormState: InitiativeFormState = {
  name: "",
  address: "",
  cep: "",
  emailOwner: "",
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
    errors.emailOwner = "Informe o email do responsável.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOwner.trim())) {
    errors.emailOwner = "Informe um email válido.";
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

