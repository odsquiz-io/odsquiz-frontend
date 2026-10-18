"use client";

import Link from "next/link";
import { useSession } from "@/components/SessionProvider";
import { type Column, DataTable } from "../ui/DataTable";
import { FilterBar, SearchInput, SegmentedControl, SelectFilter } from "../ui/Filters";
import { formatNumber } from "../ui/format";
import { PageHeader } from "../ui/PageHeader";
import { EmptyState, StatusMessage } from "../ui/States";
import { StatusBadge } from "../ui/StatusBadge";
import { buttonClass } from "../ui/styles";
import { readOption, readPage, useQueryParams } from "../ui/useQueryParams";
import { type AdminUser, changeUserRole, listPath, reactivateUser, suspendUser } from "./api";
import { DateTime, Emphasis, Identity, Place, Status } from "./Cells";
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
  const { dialog, notice, start } = useModeration(list, moderations);
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
          badge={user.id === me?.id ? <StatusBadge>Você</StatusBadge> : null}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <Status
          labels={["Ativo", "Suspenso"]}
          suspendedAt={user.suspended_at}
          reason={user.suspension_reason}
        />
      ),
    },
    {
      key: "role",
      header: "Papel",
      cell: (user) =>
        user.role === "admin" ? (
          <StatusBadge tone="accent">Administrador</StatusBadge>
        ) : (
          <span className="text-[var(--admin-muted)]">Usuário</span>
        ),
    },
    { key: "place", header: "Local", cell: (user) => <Place city={user.city} state={user.state} /> },
    { key: "quizzes", header: "Quizzes", align: "end", cell: (user) => formatNumber(user.quizzes) },
    {
      key: "initiatives",
      header: "Iniciativas",
      align: "end",
      cell: (user) => formatNumber(user.initiatives),
    },
    { key: "created", header: "Cadastro", cell: (user) => <DateTime value={user.created_at} /> },
    {
      key: "actions",
      header: "Ações",
      align: "end",
      sticky: true,
      cell: (user) => (
        <UserActions
          user={user}
          self={user.id === me?.id}
          onAction={(action) => start(user, action)}
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

function UserActions({
  onAction,
  self,
  user,
}: {
  onAction: (action: UserAction) => void;
  self: boolean;
  user: AdminUser;
}) {
  const suspended = Boolean(user.suspended_at);
  const admin = user.role === "admin";
  const selfHint = "Você não pode alterar a sua própria conta.";

  return (
    <div className="flex justify-end gap-1.5">
      <button
        type="button"
        disabled={self || (admin && !suspended)}
        title={
          self
            ? selfHint
            : admin && !suspended
              ? "Remova o acesso de administrador antes de suspender."
              : undefined
        }
        onClick={() => onAction(suspended ? "reactivate" : "suspend")}
        className={buttonClass("secondary", "sm")}
      >
        {suspended ? "Reativar" : "Suspender"}
        <span className="sr-only"> {user.name}</span>
      </button>
      <button
        type="button"
        disabled={self || (!admin && suspended)}
        title={
          self
            ? selfHint
            : !admin && suspended
              ? "Reative a conta antes de dar acesso de administrador."
              : undefined
        }
        onClick={() => onAction(admin ? "demote" : "promote")}
        className={buttonClass("secondary", "sm")}
      >
        {admin ? "Remover admin" : "Tornar admin"}
        <span className="sr-only"> {user.name}</span>
      </button>
    </div>
  );
}
