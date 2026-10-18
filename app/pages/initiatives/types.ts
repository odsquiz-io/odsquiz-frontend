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

export type { Coordinates } from "@/lib/cep";

export type Place = {
  city: string;
  state: string;
};

export type Initiative = {
  id?: string;
  name?: string;
  owner?: string;
  address?: string;
  cep?: string;
  city?: string;
  state?: string;
  email_owner?: string;
  acting_area?: string;
  impact?: number;
  type?: string;
  points?: number;
  main_ods?: number;
  lat?: number;
  lon?: number;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ListStatus = "idle" | "loading" | "error";

export type SubmitStatus = "idle" | "submitting" | "success";

export type CepLookupStatus = "idle" | "loading" | "success" | "error";

