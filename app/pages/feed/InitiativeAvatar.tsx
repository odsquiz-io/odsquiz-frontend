"use client";

import Image from "next/image";
import { useState } from "react";
import { findGoal } from "@/lib/ods";
import { initials } from "./format";
import type { AvatarSource } from "./types";

const sizes = {
  sm: { box: "size-10 text-sm", pixels: 40 },
  md: { box: "size-12 text-base", pixels: 48 },
  lg: { box: "size-16 text-xl", pixels: 64 },
  xl: { box: "size-16 text-xl sm:size-24 sm:text-3xl", pixels: 96 },
};

// Decorative: the initiative's name is always written next to it.
export function InitiativeAvatar({
  className = "",
  initiative,
  size = "md",
}: {
  className?: string;
  initiative: AvatarSource;
  size?: keyof typeof sizes;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const { box, pixels } = sizes[size];
  const logo = initiative.logo_url && initiative.logo_url !== failedUrl ? initiative.logo_url : null;
  const goal = findGoal(initiative.main_ods);

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--color-header-border)] font-display font-extrabold leading-none [font-stretch:80%] ${
        logo ? "bg-white" : ""
      } ${box} ${className}`}
      style={
        logo
          ? undefined
          : {
              backgroundColor: goal?.color ?? "var(--color-theme-toggle-background)",
              color: goal?.textColor ?? "var(--color-app-foreground)",
            }
      }
    >
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={pixels}
          height={pixels}
          unoptimized
          onError={() => setFailedUrl(logo)}
          className="size-full object-contain"
        />
      ) : (
        initials(initiative.name) || (goal ? String(goal.number) : "")
      )}
    </span>
  );
}
