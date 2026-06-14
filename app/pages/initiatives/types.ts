export type InitiativeFormField =
  | "name"
  | "address"
  | "cep"
  | "emailOwner"
  | "actingArea"
  | "impact"
  | "type"
  | "mainODS";

export type InitiativeFieldErrors = Partial<Record<InitiativeFormField, string>>;

export type InitiativeFormState = Record<InitiativeFormField, string>;

export type Coordinates = {
  lat: number;
  lon: number;
};

export type Initiative = {
  id?: string;
  name?: string;
  owner?: string;
  address?: string;
  cep?: string;
  email_owner?: string;
  acting_area?: string;
  impact?: number;
  type?: string;
  points?: number;
  main_ods?: number;
  lat?: number;
  lon?: number;
  created_at?: string;
  updated_at?: string;
};

export type ListStatus = "idle" | "loading" | "error";

export type SubmitStatus = "idle" | "submitting" | "success";

export type CepLookupStatus = "idle" | "loading" | "success" | "error";

