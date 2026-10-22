export type Result = { tone: "success" | "error"; text: string };

export function resultFrom(error: unknown): Result {
  return {
    tone: "error",
    text:
      error instanceof TypeError
        ? "Não foi possível conectar ao servidor. Tente de novo."
        : error instanceof Error
          ? error.message
          : "Algo deu errado. Tente de novo.",
  };
}

// The live region stays mounted, so screen readers announce each new result.
export function ResultMessage({
  className = "",
  result,
}: {
  className?: string;
  result?: Result;
}) {
  return (
    <div role="status">
      {result ? (
        <p
          className={`border-l-4 py-1 pl-3 text-sm font-semibold ${
            result.tone === "error"
              ? "border-[var(--color-error)] text-[var(--color-error)]"
              : "border-[var(--color-success)] text-[var(--color-success)]"
          } ${className}`}
        >
          {result.text}
        </p>
      ) : null}
    </div>
  );
}
