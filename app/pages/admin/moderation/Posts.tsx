"use client";

import Link from "next/link";
import { type Column, DataTable } from "../ui/DataTable";
import { FilterBar, FilterChip, SearchInput, SegmentedControl } from "../ui/Filters";
import { formatNumber } from "../ui/format";
import { RowMenu } from "../ui/RowMenu";
import { EmptyState, StatusMessage } from "../ui/States";
import { buttonClass, focusRing } from "../ui/styles";
import { readId, readOption, readPage, useQueryParams } from "../ui/useQueryParams";
import { type AdminPost, listPath, reactivatePost, suspendPost } from "./api";
import { Emphasis, Identity, LongText, none, personName, Published, Quote, Status } from "./Cells";
import { ContentHeader } from "./ContentHeader";
import { PagedList } from "./PagedList";
import { type Moderation, useModeration } from "./useModeration";
import { usePage } from "./usePage";

type PostAction = "suspend" | "reactivate";

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "suspended", label: "Suspensos" },
];

const moderations: Record<PostAction, Moderation<AdminPost>> = {
  suspend: {
    title: "Suspender post",
    confirmLabel: "Suspender",
    tone: "danger",
    reason: {
      label: "Motivo da suspensão",
      hint: "Fica registrado na auditoria, visível para os administradores.",
    },
    describe: (post) => (
      <>
        O post de <Emphasis>{personName(post.author)}</Emphasis> em{" "}
        <Emphasis>{post.initiative.name}</Emphasis> sai da página da iniciativa e do feed de
        atividades, junto com os comentários dele.
        <Quote>{post.body}</Quote>
      </>
    ),
    done: (post) => `Post de ${personName(post.author)} suspenso.`,
    run: (token, post, reason) => suspendPost(token, post.id, reason),
  },
  reactivate: {
    title: "Reativar post",
    confirmLabel: "Reativar",
    describe: (post) => (
      <>
        O post de <Emphasis>{personName(post.author)}</Emphasis> em{" "}
        <Emphasis>{post.initiative.name}</Emphasis> volta à página da iniciativa e ao feed de
        atividades, desde que a iniciativa e a conta do autor estejam ativas.
        <Quote>{post.body}</Quote>
      </>
    ),
    done: (post) => `Post de ${personName(post.author)} reativado.`,
    run: (token, post) => reactivatePost(token, post.id),
  },
};

export function Posts() {
  const { params, hrefWith, setParams } = useQueryParams();
  const query = (params.get("query") ?? "").trim();
  const status = readOption(params, "status", ["active", "suspended"]);
  const initiativeId = readId(params, "initiative_id");
  const page = readPage(params);
  const list = usePage<AdminPost>(
    listPath("posts", { query, status, initiative_id: initiativeId, page }),
  );
  const { dialog, menuItems, notice } = useModeration(list, moderations);
  const filtered = Boolean(query || status || initiativeId);
  const clearHref = hrefWith({
    query: undefined,
    status: undefined,
    initiative_id: undefined,
    page: undefined,
  });
  const initiativeName = list.page?.items.find((post) => post.initiative.id === initiativeId)
    ?.initiative.name;

  const columns: Column<AdminPost>[] = [
    {
      key: "author",
      header: "Autor",
      rowHeader: true,
      cell: (post) => <Identity title={personName(post.author)} detail={post.author.email} />,
    },
    { key: "post", header: "Post", cell: (post) => <LongText>{post.body}</LongText> },
    {
      key: "initiative",
      header: "Iniciativa",
      cell: ({ initiative }) => <Identity title={initiative.name || "Iniciativa removida"} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (post) => (
        <Status
          labels={["Ativo", "Suspenso"]}
          suspendedAt={post.suspended_at}
          reason={post.suspension_reason}
        />
      ),
    },
    { key: "comments", header: "Comentários", cell: (post) => <CommentsLink post={post} /> },
    {
      key: "created",
      header: "Publicado em",
      className: "text-[var(--admin-muted)]",
      cell: (post) => <Published createdAt={post.created_at} editedAt={post.edited_at} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">Ações</span>,
      align: "end",
      sticky: true,
      className: "w-px",
      cell: (post) => (
        <RowMenu
          label={`Ações para o post de ${personName(post.author)}`}
          items={[
            ...menuItems(post, [{ action: post.suspended_at ? "reactivate" : "suspend" }]),
            ...(initiativeId
              ? []
              : [
                  {
                    label: "Ver posts da iniciativa",
                    onSelect: () => setParams({ initiative_id: post.initiative.id, page: undefined }),
                  },
                ]),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <ContentHeader view="posts" onRefresh={list.reload} />

      <FilterBar label="Filtrar posts">
        <SearchInput
          label="Buscar"
          placeholder="Texto, iniciativa, autor ou e-mail"
          value={query}
          onSearch={(value) => setParams({ query: value, page: undefined }, { replace: true })}
        />
        <SegmentedControl
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(value) => setParams({ status: value, page: undefined })}
        />
        {initiativeId ? (
          <FilterChip
            label="Iniciativa"
            value={initiativeName || "Iniciativa selecionada"}
            clearHref={hrefWith({ initiative_id: undefined, page: undefined })}
          />
        ) : null}
        {filtered ? (
          <Link href={clearHref} scroll={false} className={buttonClass("ghost")}>
            Limpar filtros
          </Link>
        ) : null}
      </FilterBar>

      <StatusMessage>{notice}</StatusMessage>

      <PagedList
        list={list}
        loadingLabel="Carregando posts..."
        errorTitle="Não foi possível carregar os posts"
        empty={
          filtered ? (
            <EmptyState
              title="Nenhum post encontrado"
              action={
                <Link href={clearHref} scroll={false} className={buttonClass()}>
                  Limpar filtros
                </Link>
              }
            >
              Ajuste a busca ou os filtros para ver outros resultados.
            </EmptyState>
          ) : (
            <EmptyState title="Nenhum post publicado">
              Os posts que as iniciativas publicam aparecem aqui.
            </EmptyState>
          )
        }
      >
        {(result) => (
          <DataTable
            caption="Posts das iniciativas"
            columns={columns}
            rows={result.items}
            rowKey={(post) => post.id}
            busy={list.loading}
          />
        )}
      </PagedList>

      {dialog}
    </>
  );
}

function CommentsLink({ post }: { post: AdminPost }) {
  const count = post.comments_count;

  if (!count) {
    return none;
  }

  return (
    <Link
      href={`/admin/content?view=comments&post_id=${post.id}`}
      className={`whitespace-nowrap rounded font-medium text-[var(--admin-accent)] underline-offset-2 hover:underline ${focusRing}`}
    >
      {formatNumber(count)} {count === 1 ? "comentário" : "comentários"}
    </Link>
  );
}
