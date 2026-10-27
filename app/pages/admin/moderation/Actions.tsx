"use client";

import Link from "next/link";
import { type Column, DataTable } from "../ui/DataTable";
import { FilterBar, SegmentedControl } from "../ui/Filters";
import { PageHeader } from "../ui/PageHeader";
import { EmptyState } from "../ui/States";
import type { Tone } from "../ui/StatusBadge";
import { buttonClass } from "../ui/styles";
import { readOption, readPage, useQueryParams } from "../ui/useQueryParams";
import { type AdminAction, listPath } from "./api";
import { DateTime, Identity, Marker, Text } from "./Cells";
import { PagedList } from "./PagedList";
import { RefreshButton } from "./RefreshButton";
import { usePage } from "./usePage";

const targetLabels: Record<AdminAction["target_type"], string> = {
  user: "Usuário",
  initiative: "Iniciativa",
  post: "Post",
  comment: "Comentário",
};

const targetOptions = [
  { value: "", label: "Todos" },
  { value: "user", label: "Usuários" },
  { value: "initiative", label: "Iniciativas" },
];

const actionLabels: Record<string, { label: string; tone: Tone }> = {
  suspend_user: { label: "Suspendeu usuário", tone: "danger" },
  reactivate_user: { label: "Reativou usuário", tone: "success" },
  promote_user: { label: "Tornou administrador", tone: "accent" },
  demote_user: { label: "Removeu administrador", tone: "warning" },
  suspend_initiative: { label: "Suspendeu iniciativa", tone: "danger" },
  reactivate_initiative: { label: "Reativou iniciativa", tone: "success" },
  suspend_post: { label: "Suspendeu post", tone: "danger" },
  reactivate_post: { label: "Reativou post", tone: "success" },
  suspend_comment: { label: "Suspendeu comentário", tone: "danger" },
  reactivate_comment: { label: "Reativou comentário", tone: "success" },
};

const columns: Column<AdminAction>[] = [
  {
    key: "date",
    header: "Data",
    cell: (action) => <DateTime value={action.created_at} withTime />,
  },
  {
    key: "admin",
    header: "Administrador",
    cell: ({ admin }) => <Identity title={admin.name} detail={admin.email} />,
  },
  {
    key: "action",
    header: "Ação",
    cell: (action) => {
      const known = actionLabels[action.action];
      return <Marker tone={known?.tone}>{known?.label ?? action.action}</Marker>;
    },
  },
  {
    key: "target",
    header: "Alvo",
    rowHeader: true,
    cell: (action) => (
      <Identity
        title={action.target_label ?? "Registro removido"}
        detail={targetLabels[action.target_type]}
      />
    ),
  },
  {
    key: "reason",
    header: "Motivo",
    cell: (action) => (
      <p className="min-w-56 max-w-md whitespace-pre-line break-words">
        <Text>{action.reason}</Text>
      </p>
    ),
  },
];

export default function Actions() {
  const { params, hrefWith, setParams } = useQueryParams();
  const target = readOption(params, "target_type", ["user", "initiative"]);
  const page = readPage(params);
  const list = usePage<AdminAction>(listPath("actions", { target_type: target, page }));

  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Registro das ações de moderação feitas no painel, da mais recente para a mais antiga."
        actions={<RefreshButton onClick={list.reload} />}
      />

      <FilterBar label="Filtrar auditoria">
        <SegmentedControl
          label="Alvo"
          options={targetOptions}
          value={target}
          onChange={(value) => setParams({ target_type: value, page: undefined })}
        />
      </FilterBar>

      <PagedList
        list={list}
        loadingLabel="Carregando registros..."
        errorTitle="Não foi possível carregar a auditoria"
        empty={
          target ? (
            <EmptyState
              title="Nenhuma ação encontrada"
              action={
                <Link
                  href={hrefWith({ target_type: undefined, page: undefined })}
                  scroll={false}
                  className={buttonClass()}
                >
                  Ver todas as ações
                </Link>
              }
            >
              Ainda não há ações de moderação para este tipo de alvo.
            </EmptyState>
          ) : (
            <EmptyState title="Nenhuma ação registrada">
              Suspensões, reativações e mudanças de papel feitas no painel aparecem aqui.
            </EmptyState>
          )
        }
      >
        {(result) => (
          <DataTable
            caption="Ações de moderação"
            columns={columns}
            rows={result.items}
            rowKey={(action) => action.id}
            busy={list.loading}
          />
        )}
      </PagedList>
    </>
  );
}
