"use client";

import Link from "next/link";
import { useSession } from "@/components/SessionProvider";
import { type Column, DataTable } from "../ui/DataTable";
import { FilterBar, SearchInput, SegmentedControl, SelectFilter } from "../ui/Filters";
import { formatNumber } from "../ui/format";
import { PageHeader } from "../ui/PageHeader";
import { RowMenu } from "../ui/RowMenu";
import { EmptyState, StatusMessage } from "../ui/States";
import { buttonClass } from "../ui/styles";
import { readOption, readPage, useQueryParams } from "../ui/useQueryParams";
import { type AdminUser, changeUserRole, listPath, reactivateUser, suspendUser } from "./api";
import { DateTime, Emphasis, Identity, Marker, none, Status } from "./Cells";
import { PagedList } from "./PagedList";
import { RefreshButton } from "./RefreshButton";
import { type Moderation, useModeration } from "./useModeration";
import { usePage } from "./usePage";

type UserAction = "suspend" | "reactivate" | "promote" | "demote";

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "suspended", label: "Suspensos" },
];

const roleOptions = [
  { value: "user", label: "Usuários" },
  { value: "admin", label: "Administradores" },
];

const moderations: Record<UserAction, Moderation<AdminUser>> = {
  suspend: {
    title: "Suspender usuário",
    confirmLabel: "Suspender",
    tone: "danger",
    reason: {
      label: "Motivo da suspensão",
      hint: "Fica registrado na auditoria, visível para os administradores.",
    },
    describe: (user) => (
      <>
        <Emphasis>{user.name}</Emphasis> ({user.email}) não poderá entrar, responder ao quiz nem
        cadastrar iniciativas até que a conta seja reativada.
      </>
    ),
    done: (user) => `Conta de ${user.name} suspensa.`,
    run: (token, user, reason) => suspendUser(token, user.id, reason),
  },
  reactivate: {
    title: "Reativar usuário",
    confirmLabel: "Reativar",
    describe: (user) => (
      <>
        <Emphasis>{user.name}</Emphasis> ({user.email}) volta a entrar e a usar a plataforma
        normalmente.
      </>
    ),
    done: (user) => `Conta de ${user.name} reativada.`,
    run: (token, user) => reactivateUser(token, user.id),
  },
  promote: {
    title: "Tornar administrador",
    confirmLabel: "Tornar administrador",
    describe: (user) => (
      <>
        <Emphasis>{user.name}</Emphasis> ({user.email}) passa a acessar este painel, com permissão
        para suspender contas, moderar iniciativas e mudar papéis.
      </>
    ),
    done: (user) => `${user.name} agora tem acesso de administrador.`,
    run: (token, user) => changeUserRole(token, user.id, "admin"),
  },
  demote: {
    title: "Remover acesso de administrador",
    confirmLabel: "Remover acesso",
    tone: "danger",
    describe: (user) => (
      <>
        <Emphasis>{user.name}</Emphasis> ({user.email}) deixa de acessar este painel e volta a ser
        um usuário comum.
      </>
    ),
    done: (user) => `${user.name} não tem mais acesso de administrador.`,
    run: (token, user) => changeUserRole(token, user.id, "user"),
  },
};

export default function Users() {
  const { params, hrefWith, setParams } = useQueryParams();
  const query = (params.get("query") ?? "").trim();
  const status = readOption(params, "status", ["active", "suspended"]);
  const role = readOption(params, "role", ["user", "admin"]);
  const page = readPage(params);
  const list = usePage<AdminUser>(listPath("users", { query, status, role, page }));
  const { dialog, menuItems, notice } = useModeration(list, moderations);
  const { user: me } = useSession();
  const filtered = Boolean(query || status || role);
  const clearHref = hrefWith({ query: undefined, status: undefined, role: undefined, page: undefined });

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "Usuário",
      rowHeader: true,
      cell: (user) => (
        <Identity
          title={user.name || user.email}
          detail={user.email}
          badge={
            user.id === me?.id ? (
              <span className="shrink-0 text-xs text-[var(--admin-muted)]">(você)</span>
            ) : null
          }
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (user) =>
        user.role === "admin" && !user.suspended_at ? (
          <Marker tone="accent">Administrador</Marker>
        ) : (
          <Status
            labels={["Ativo", "Suspenso"]}
            suspendedAt={user.suspended_at}
            reason={user.suspension_reason}
          />
        ),
    },
    {
      key: "activity",
      header: "Atividade",
      className: "text-[var(--admin-muted)]",
      cell: (user) => <Activity quizzes={user.quizzes} initiatives={user.initiatives} />,
    },
    {
      key: "created",
      header: "Cadastro",
      className: "text-[var(--admin-muted)]",
      cell: (user) => <DateTime value={user.created_at} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">Ações</span>,
      align: "end",
      sticky: true,
      className: "w-px",
      cell: (user) =>
        user.id === me?.id ? null : (
          <RowMenu
            label={`Ações para ${user.name || user.email}`}
            items={menuItems(user, userActions(user))}
          />
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Busque contas, suspenda ou reative acessos e defina quem administra o painel."
        actions={<RefreshButton onClick={list.reload} />}
      />

      <FilterBar label="Filtrar usuários">
        <SearchInput
          label="Buscar"
          placeholder="Nome ou e-mail"
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
          label="Papel"
          allLabel="Todos os papéis"
          options={roleOptions}
          value={role}
          onChange={(value) => setParams({ role: value, page: undefined })}
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
        loadingLabel="Carregando usuários..."
        errorTitle="Não foi possível carregar os usuários"
        empty={
          filtered ? (
            <EmptyState
              title="Nenhum usuário encontrado"
              action={
                <Link href={clearHref} scroll={false} className={buttonClass()}>
                  Limpar filtros
                </Link>
              }
            >
              Ajuste a busca ou os filtros para ver outros resultados.
            </EmptyState>
          ) : (
            <EmptyState title="Nenhum usuário cadastrado">
              As contas criadas no site aparecem aqui.
            </EmptyState>
          )
        }
      >
        {(result) => (
          <DataTable
            caption="Usuários cadastrados"
            columns={columns}
            rows={result.items}
            rowKey={(user) => user.id}
            busy={list.loading}
          />
        )}
      </PagedList>

      {dialog}
    </>
  );
}

function userActions(user: AdminUser): { action: UserAction; disabledReason?: string }[] {
  const suspended = Boolean(user.suspended_at);
  const admin = user.role === "admin";

  return [
    {
      action: suspended ? "reactivate" : "suspend",
      disabledReason:
        admin && !suspended ? "Remova o acesso de administrador antes de suspender." : undefined,
    },
    {
      action: admin ? "demote" : "promote",
      disabledReason:
        !admin && suspended ? "Reative a conta antes de dar acesso de administrador." : undefined,
    },
  ];
}

function Activity({ initiatives, quizzes }: { initiatives: number; quizzes: number }) {
  const parts = [
    count(quizzes, "quiz", "quizzes"),
    count(initiatives, "iniciativa", "iniciativas"),
  ].filter(Boolean);

  return parts.length ? <span className="whitespace-nowrap">{parts.join(" · ")}</span> : none;
}

function count(value: number, one: string, many: string) {
  return value ? `${formatNumber(value)} ${value === 1 ? one : many}` : "";
}
