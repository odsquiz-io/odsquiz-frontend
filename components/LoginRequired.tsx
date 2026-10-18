import Link from "next/link";
import { OdsBand } from "./OdsBand";
import { loadIn, primaryButton, surface } from "./styles";

export function LoginRequired({
  className = "",
  message,
}: {
  className?: string;
  message: string;
}) {
  return (
    <div
      className={`overflow-hidden text-[var(--color-app-foreground)] ${surface} ${loadIn} ${className}`}
    >
      <OdsBand className="h-1.5" />
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold [font-stretch:85%]">
          Login necessário
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">{message}</p>
        <Link href="/login" className={`mt-6 ${primaryButton}`}>
          Fazer login
        </Link>
      </div>
    </div>
  );
}
