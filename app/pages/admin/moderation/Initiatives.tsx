"use client";

import Link from "next/link";
import { states } from "@/lib/cep";
import { findGoal, odsGoals } from "@/lib/ods";
import { type Column, DataTable } from "../ui/DataTable";
import { FilterBar, SearchInput, SegmentedControl, SelectFilter } from "../ui/Filters";
import { formatNumber } from "../ui/format";
import { PageHeader } from "../ui/PageHeader";
import { EmptyState, StatusMessage } from "../ui/States";
import { buttonClass } from "../ui/styles";
import { readOption, readPage, useQueryParams } from "../ui/useQueryParams";
import { type AdminInitiative, listPath, reactivateInitiative, suspendInitiative } from "./api";
import { DateTime, Emphasis, Identity, none, Status, Text } from "./Cells";
import { PagedList } from "./PagedList";
import { RefreshButton } from "./RefreshButton";
import { type Moderation, useModeration } from "./useModeration";
import { usePage } from "./usePage";

type InitiativeAction = "suspend" | "reactivate";

const initiativeTypes = ["Sociedade Civil", "Instituição Pública", "Instituição Privada"];

const statusOptions = [
  { value: "", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "suspended", label: "Suspensas" },
];

const odsOptions = odsGoals.map((goal) => ({
  value: String(goal.number),
  label: `${goal.number}. ${goal.name}`,
}));

const odsValues = odsOptions.map((option) => option.value);

const typeOptions = initiativeTypes.map((type) => ({ value: type, label: type }));

const stateOptions = states.map((state) => ({ value: state, label: state }));

const moderations: Record<InitiativeAction, Moderation<AdminInitiative>> = {
  suspend: {
    title: "Suspender iniciativa",
    confirmLabel: "Suspender",
    tone: "danger",
    reason: {
      label: "Motivo da suspensão",
      hint: "O responsável vê este motivo no perfil, e ele fica registrado na auditoria.",
    },
    describe: (initiative) => (
      <>
        <Emphasis>{initiative.name}</Emphasis> sai do mapa e da lista pública. O responsável
        continua vendo a iniciativa no perfil, marcada como suspensa.
      </>
    ),
    done: (initiative) => `Iniciativa ${initiative.name} suspensa.`,
    run: (token, initiative, reason) => suspendInitiative(token, initiative.id, reason),
  },
  reactivate: {
    title: "Reativar iniciativa",
    confirmLabel: "Reativar",
    describe: (initiative) => (
      <>
        <Emphasis>{initiative.name}</Emphasis> volta a aparecer no mapa e na lista pública.
      </>
    ),
    done: (initiative) => `Iniciativa ${initiative.name} reativada.`,
    run: (token, initiative) => reactivateInitiative(token, initiative.id),
  },
};

export default function Initiatives() {
  const { params, hrefWith, setParams } = useQueryParams();
  const query = (params.get("query") ?? "").trim();
  const status = readOption(params, "status", ["active", "suspended"]);
  const ods = readOption(params, "main_ods", odsValues);
  const type = readOption(params, "type", initiativeTypes);
  const state = readOption(params, "state", states);
  const page = readPage(params);
  const list = usePage<AdminInitiative>(
    listPath("initiatives", { query, status, main_ods: ods, type, state, page }),
  );
  const { dialog, notice, start } = useModeration(list, moderations);
  const filtered = Boolean(query || status || ods || type || state);
  const clearHref = hrefWith({
    query: undefined,
    status: undefined,
    main_ods: undefined,
    type: undefined,
    state: undefined,
    page: undefined,
  });

  const columns: Column<AdminInitiative>[] = [
    {
      key: "initiative",
      header: "Iniciativa",
      rowHeader: true,
      cell: (initiative) => (
        <Identity
          title={initiative.name}
          detail={[initiative.acting_area, [initiative.city, initiative.state].filter(Boolean).join(" - ")]
            .filter(Boolean)
            .join(" · ")}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (initiative) => (
        <Status
          labels={["Ativa", "Suspensa"]}
          suspendedAt={initiative.suspended_at}
          reason={initiative.suspension_reason}
        />
      ),
    },
    { key: "ods", header: "ODS principal", cell: (initiative) => <Goal number={initiative.main_ods} /> },
    {
      key: "type",
      header: "Tipo",
      cell: (initiative) => (
        <Text>{initiative.type}</Text>
      ),
    },
    {
      key: "owner",
      header: "Responsável",
      cell: ({ owner }) => (owner ? <Identity title={owner.name} detail={owner.email} /> : none),
    },
    {
      key: "impact",
      header: "Pessoas atendidas",
      align: "end",
      cell: (initiative) => formatNumber(initiative.impact),
    },
    {
      key: "created",
      header: "Cadastro",
      cell: (initiative) => <DateTime value={initiative.created_at} />,
    },
    {
      key: "actions",
      header: "Ações",
      align: "end",
      sticky: true,
      cell: (initiative) => {
        const suspended = Boolean(initiative.suspended_at);

        return (
          <button
            type="button"
            onClick={() => start(initiative, suspended ? "reactivate" : "suspend")}
            className={buttonClass("secondary", "sm")}
          >
            {suspended ? "Reativar" : "Suspender"}
            <span className="sr-only"> {initiative.name}</span>
          </button>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Iniciativas"
        description="Revise as iniciativas cadastradas e suspenda as que não seguem as regras. Uma iniciativa suspensa sai do mapa público até ser reativada."
        actions={<RefreshButton onClick={list.reload} />}
      />

      <FilterBar label="Filtrar iniciativas">
        <SearchInput
          label="Buscar"
          placeholder="Nome, área de atuação ou e-mail"
          value={query}
          onSearch={(value) => setParams({ query: value, page: undefined }, { replace: true })}
        />
        <SegmentedControl
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(value) => setParams({ status: value, page: undefined })}
        />
        <SelectFilter
          label="ODS principal"
          allLabel="Todos os ODS"
          className="sm:w-64"
          options={odsOptions}
          value={ods}
          onChange={(value) => setParams({ main_ods: value, page: undefined })}
        />
        <SelectFilter
          label="Tipo"
          allLabel="Todos os tipos"
          className="sm:w-48"
          options={typeOptions}
          value={type}
          onChange={(value) => setParams({ type: value, page: undefined })}
        />
        <SelectFilter
          label="UF"
          allLabel="Todas"
          className="sm:w-28"
          options={stateOptions}
          value={state}
          onChange={(value) => setParams({ state: value, page: undefined })}
        />
        {filtered ? (
          <Link href={clearHref} scroll={false} className={buttonClass("ghost")}>
            Limpar filtros
          </Link>
        ) : null}
      </FilterBar>

      <StatusMessage>{notice}</StatusMessage>

      <PagedList
        list={list}
        loadingLabel="Carregando iniciativas..."
        errorTitle="Não foi possível carregar as iniciativas"
        empty={
          filtered ? (
            <EmptyState
              title="Nenhuma iniciativa encontrada"
              action={
                <Link href={clearHref} scroll={false} className={buttonClass()}>
                  Limpar filtros
                </Link>
              }
            >
              Ajuste a busca ou os filtros para ver outros resultados.
            </EmptyState>
          ) : (
            <EmptyState title="Nenhuma iniciativa cadastrada">
              As iniciativas cadastradas no site aparecem aqui.
            </EmptyState>
          )
        }
      >
        {(result) => (
          <DataTable
            caption="Iniciativas cadastradas"
            columns={columns}
            rows={result.items}
            rowKey={(initiative) => initiative.id}
            busy={list.loading}
          />
        )}
      </PagedList>

      {dialog}
    </>
  );
}

function Goal({ number }: { number: number }) {
  const goal = findGoal(number);

  if (!goal) {
    return none;
  }

  return (
    <span className="flex min-w-36 max-w-40 items-center gap-2" title={goal.name}>
      <span
        className="grid size-6 shrink-0 place-items-center rounded text-xs font-semibold"
        style={{ backgroundColor: goal.color, color: goal.textColor }}
      >
        {goal.number}
      </span>
      <span className="truncate">{goal.name}</span>
    </span>
  );
}
