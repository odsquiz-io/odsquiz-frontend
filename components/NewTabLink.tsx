import Link from "next/link";
import type { ReactNode } from "react";
import { textLink } from "./styles";

// Opens in a new tab so the form or quiz being filled keeps what was typed.
export function NewTabLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link href={href} target="_blank" className={textLink}>
      {children}
      <span className="sr-only"> (abre em nova guia)</span>
    </Link>
  );
}
