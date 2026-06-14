import type { Initiative, ListStatus } from "./types";

type InitiativesListProps = {
  initiatives: Initiative[];
  message: string;
  onRefresh: () => void;
  status: ListStatus;
};

export function InitiativesList({
  initiatives,
  message,
  onRefresh,
  status,
}: InitiativesListProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-extrabold text-[var(--color-app-foreground)]">
          Todas as iniciativas
        </h2>
        <button
          type="button"
          disabled={status === "loading"}
          onClick={onRefresh}
          className="h-10 rounded-md border border-[var(--color-app-foreground)] px-4 text-sm font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <ListFeedback status={status} total={initiatives.length} message={message} />

      {initiatives.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {initiatives.map((initiative, index) => (
            <InitiativeCard
              key={initiative.id ?? `${initiative.name}-${index}`}
              initiative={initiative}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ListFeedback({
  message,
  status,
  total,
}: {
  message: string;
  status: ListStatus;
  total: number;
}) {
  if (status === "error") {
    return <Feedback tone="error">{message}</Feedback>;
  }

  if (status === "loading" && total === 0) {
    return <Feedback>Carregando iniciativas...</Feedback>;
  }

  if (status !== "loading" && total === 0) {
    return <Feedback>Nenhuma iniciativa cadastrada ainda.</Feedback>;
  }

  return null;
}

function InitiativeCard({ initiative }: { initiative: Initiative }) {
  const items: Array<[string, string | undefined]> = [
    ["Área", initiative.acting_area],
    ["Endereço", initiative.address],
    ["CEP", initiative.cep],
    ["Responsável", initiative.email_owner],
    ["Impacto", formatNumber(initiative.impact)],
    ["Pontos", formatNumber(initiative.points)],
  ];

  return (
    <article className="rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-background)] p-5 text-[var(--color-app-foreground)] shadow-2xl shadow-black/10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">
            {initiative.name || "Iniciativa sem nome"}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-link-hover)]">
            {initiative.type || "Tipo não informado"}
          </p>
        </div>
        {typeof initiative.main_ods === "number" ? (
          <span className="inline-flex h-9 items-center rounded-md border border-[var(--color-header-border)] px-3 text-sm font-bold">
            ODS {initiative.main_ods}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        {items.map(([label, value]) => (
          <InfoItem key={label} label={label} value={value} />
        ))}
      </dl>
    </article>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="font-bold">{label}</dt>
      <dd className="mt-1 break-words">{value}</dd>
    </div>
  );
}

function Feedback({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <p
      className={`rounded-lg border bg-[var(--color-header-background)] p-4 text-sm font-medium ${
        tone === "error"
          ? "border-red-400 text-red-400"
          : "border-[var(--color-header-border)] text-[var(--color-app-foreground)]"
      }`}
    >
      {children}
    </p>
  );
}

function formatNumber(value?: number) {
  return typeof value === "number" ? String(value) : undefined;
}
