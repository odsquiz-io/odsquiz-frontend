"use client";

import { formatDateTime, relativeTime } from "./format";
import { useNow } from "./hooks";

export function RelativeTime({ value }: { value: string }) {
  const now = useNow();
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return (
    <time dateTime={value} title={formatDateTime(date)}>
      {relativeTime(date, now)}
    </time>
  );
}

export function EditedMark({ value }: { value: string | null }) {
  const date = value ? new Date(value) : null;

  if (!date) {
    return null;
  }

  return (
    <>
      <span aria-hidden="true"> · </span>
      <span title={Number.isNaN(date.getTime()) ? undefined : `Editado em ${formatDateTime(date)}`}>
        editado
      </span>
    </>
  );
}
