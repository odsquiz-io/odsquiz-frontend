"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { eyebrow, focusRing } from "@/components/styles";
import { formatDate } from "../profile/format";
import { fetchMembers } from "./manage/api";
import { resultFrom } from "./manage/ResultMessage";
import { PersonAvatar } from "./PersonAvatar";
import type { MembersList } from "./types";

type Loaded = { key: string; data?: MembersList; error?: string };

export function MembersPanel({
  expectedCount = 0,
  initiativeId,
  manageHref,
  token,
}: {
  expectedCount?: number;
  initiativeId: string;
  manageHref?: string;
  token: string;
}) {
  const key = `${token}|${initiativeId}`;
  const [loaded, setLoaded] = useState<Loaded>();
  const current = loaded?.key === key ? loaded : undefined;
  const active = current?.data?.members.filter((member) => member.status === "active") ?? [];

  useEffect(() => {
    let isCurrent = true;

    fetchMembers(token, initiativeId).then(
      (data) => {
        if (isCurrent) {
          setLoaded({ key, data });
        }
      },
      (error) => {
        if (isCurrent) {
          setLoaded({ key, error: resultFrom(error).text });
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [initiativeId, key, token]);

  return (
    <section aria-labelledby="members-title">
      <h2 id="members-title" className={eyebrow}>
        Quem faz parte
      </h2>

      {!current ? (
        <>
          <p role="status" className="sr-only">
            Carregando membros...
          </p>
          {/* Holds the expected rows' space, so the content below never jumps. */}
          <ul aria-hidden="true" className="mt-6 border-b border-[var(--color-header-border)]">
            {Array.from({ length: Math.min(expectedCount, 8) + 1 }, (_, index) => (
              <li
                key={index}
                className="flex items-center gap-3 border-t border-[var(--color-header-border)] py-3"
              >
                <span className="size-11 shrink-0 rounded-full bg-[var(--color-theme-toggle-background)]" />
                <span className="grid flex-1 gap-2">
                  <span className="h-4 w-2/3 rounded bg-[var(--color-theme-toggle-background)]" />
                  <span className="h-3 w-1/2 rounded bg-[var(--color-theme-toggle-background)]" />
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : current.error ? (
        <p
          role="alert"
          className="mt-6 border-l-4 border-[var(--color-error)] py-1 pl-3 text-sm font-semibold text-[var(--color-error)]"
        >
          {current.error}
        </p>
      ) : current.data ? (
        <>
          <ul className="mt-6 border-b border-[var(--color-header-border)]">
            <MemberRow name={current.data.owner.name} detail="Gerencia a iniciativa" />
            {active.map((member) => {
              const since = member.responded_at
                ? formatDate(member.responded_at, { month: "long", year: "numeric" })
                : undefined;

              return (
                <MemberRow
                  key={member.id}
                  name={member.user.name}
                  detail={since ? `Participa desde ${since}` : "Participa da iniciativa"}
                />
              );
            })}
          </ul>
          {active.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              {manageHref
                ? "Ninguém mais participa ainda. Convide quem trabalha com você na iniciativa."
                : "Ainda não há outras pessoas participando."}
            </p>
          ) : null}
        </>
      ) : null}

      {manageHref ? (
        <Link
          href={`${manageHref}?aba=membros`}
          className={`mt-5 inline-flex items-center gap-2 font-bold underline-offset-4 transition hover:text-[var(--color-link-hover)] hover:underline ${focusRing}`}
        >
          Convidar pessoas
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </section>
  );
}

function MemberRow({ detail, name }: { detail: string; name: string }) {
  return (
    <li className="flex items-center gap-3 border-t border-[var(--color-header-border)] py-3">
      <PersonAvatar name={name} size="md" />
      <div className="min-w-0">
        <p className="font-bold leading-snug wrap-anywhere">{name}</p>
        <p className="text-sm text-[var(--color-muted)]">{detail}</p>
      </div>
    </li>
  );
}
