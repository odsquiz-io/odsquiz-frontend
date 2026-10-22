"use client";

import { readOption, useQueryParams } from "../ui/useQueryParams";
import { Comments } from "./Comments";
import { Posts } from "./Posts";

export default function Content() {
  const { params } = useQueryParams();

  return readOption(params, "view", ["comments"]) ? <Comments /> : <Posts />;
}
