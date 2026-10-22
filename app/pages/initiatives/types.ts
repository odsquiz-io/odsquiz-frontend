export type InitiativeFormField =
  | "name"
  | "address"
  | "cep"
  | "emailOwner"
  | "actingArea"
  | "impact"
  | "type"
  | "mainODS"
  | "description";

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
  description?: string;
  logo_url?: string | null;
  viewer_role?: "owner" | "member" | null;
  members_count?: number;
};

export type InitiativeSummary = {
  id: string;
  name: string;
  main_ods: number;
  city: string;
  state: string;
  logo_url: string | null;
};

export type Member = {
  id: string;
  status: "pending" | "active";
  user: { id: string; name: string; email?: string };
  created_at: string;
  responded_at: string | null;
};

export type MembersList = {
  owner: { id: string; name: string };
  members: Member[];
};

export type Invitation = {
  id: string;
  initiative: InitiativeSummary;
  invited_by: { id: string; name: string };
  created_at: string;
};

export type Membership = {
  membership_id: string;
  initiative: InitiativeSummary;
  since: string | null;
};

export type ListStatus = "idle" | "loading" | "error";

export type SubmitStatus = "idle" | "submitting" | "success";

export type CepLookupStatus = "idle" | "loading" | "success" | "error";

