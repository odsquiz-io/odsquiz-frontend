import Image from "next/image";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { eyebrow } from "@/components/styles";
import { InitiativeAvatar } from "../InitiativeAvatar";
import type { Initiative, Photo } from "../types";

export function ProfileHeader({
  actions,
  cover,
  initiative,
}: {
  actions?: ReactNode;
  cover?: Photo;
  initiative: Initiative;
}) {
  const name = initiative.name || "Iniciativa sem nome";

  if (!cover) {
    return (
      <PageHeader
        label="Iniciativa"
        title={name}
        media={<InitiativeAvatar initiative={initiative} size="xl" />}
        actions={actions}
      />
    );
  }

  // The name sits below the photo, never over it, so its contrast does not depend on the image.
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] sm:aspect-[3/1]">
        <Image
          src={cover.url}
          alt=""
          fill
          unoptimized
          loading="eager"
          sizes="(min-width: 72rem) 72rem, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-6 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <InitiativeAvatar
            initiative={initiative}
            size="xl"
            className="relative -mt-8 ring-4 ring-[var(--color-app-background)] sm:-mt-12"
          />
          <div className="min-w-0 sm:pt-5">
            <p className={eyebrow}>Iniciativa</p>
            <h1 className="mt-3 text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.02em] wrap-break-word [font-stretch:80%]">
              {name}
            </h1>
          </div>
        </div>
        {actions ? <div className="shrink-0 sm:pt-5">{actions}</div> : null}
      </div>
    </div>
  );
}
