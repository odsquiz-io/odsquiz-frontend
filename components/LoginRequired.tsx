import Link from "next/link";

export function LoginRequired({
  className = "",
  message,
}: {
  className?: string;
  message: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 text-[var(--color-app-foreground)] shadow-2xl shadow-black/20 ${className}`}
    >
      <h2 className="text-xl font-bold">Login necessário</h2>
      <p className="mt-2 text-sm">{message}</p>
      <Link
        href="/login"
        className="mt-5 inline-flex min-h-11 items-center rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)]"
      >
        Fazer login
      </Link>
    </div>
  );
}
