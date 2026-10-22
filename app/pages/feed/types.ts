import type { InitiativeSummary } from "../initiatives/types";

export const POST_MAX_LENGTH = 3000;

export const COMMENT_MAX_LENGTH = 1000;

export type Person = {
  id: string;
  name: string;
};

export type Post = {
  id: string;
  initiative: InitiativeSummary;
  author: Person;
  body: string;
  created_at: string;
  edited_at: string | null;
  comments_count: number;
  viewer_can_edit: boolean;
  viewer_can_delete: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  author: Person;
  body: string;
  created_at: string;
  edited_at: string | null;
  viewer_can_edit: boolean;
  viewer_can_delete: boolean;
};

export type Page<T> = {
  items: T[];
  next_cursor: string | null;
};

export type AvatarSource = {
  name?: string;
  main_ods?: number;
  logo_url?: string | null;
};
