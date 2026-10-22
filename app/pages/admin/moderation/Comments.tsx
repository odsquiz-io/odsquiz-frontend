"use client";

import Link from "next/link";
import { type Column, DataTable } from "../ui/DataTable";
import { FilterBar, FilterChip, SearchInput, SegmentedControl } from "../ui/Filters";
import { RowMenu } from "../ui/RowMenu";
import { EmptyState, StatusMessage } from "../ui/States";
import { buttonClass } from "../ui/styles";
import { readId, readOption, readPage, useQueryParams } from "../ui/useQueryParams";
import { type AdminComment, listPath, reactivateComment, suspendComment } from "./api";
import { Emphasis, Identity, LongText, personName, Published, Quote, Status } from "./Cells";
import { ContentHeader } from "./ContentHeader";
import { PagedList } from "./PagedList";
import { type Moderation, useModeration } from "./useModeration";
import { usePage } from "./usePage";

type CommentAction = "suspend" | "reactivate";

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "suspended", label: "Suspensos" },
];

const moderations: Record<CommentAction, Moderation<AdminComment>> = {
  suspend: {
    title: "Suspender comentário",
    confirmLabel: "Suspender",
    tone: "danger",
    reason: {
      label: "Motivo da suspensão",
      hint: "Fica registrado na auditoria, visível para os administradores.",
    },
    describe: (comment) => (
      <>
        O comentário de <Emphasis>{personName(comment.author)}</Emphasis> deixa de aparecer no
        post de <Emphasis>{comment.initiative.name}</Emphasis>.
        <Quote>{comment.body}</Quote>
      </>
    ),
    done: (comment) => `Comentário de ${personName(comment.author)} suspenso.`,
    run: (token, comment, reason) => suspendComment(token, comment.id, reason),
  },
  reactivate: {
    title: "Reativar comentário",
    confirmLabel: "Reativar",
    describe: (comment) => (
      <>
        O comentário de <Emphasis>{personName(comment.author)}</Emphasis> volta a aparecer no
        post de <Emphasis>{comment.initiative.name}</Emphasis>, desde que o post e a conta do autor
        estejam ativos.
        <Quote>{comment.body}</Quote>
      </>
    ),
    done: (comment) => `Comentário de ${personName(comment.author)} reativado.`,
    run: (token, comment) => reactivateComment(token, comment.id),
  },
};

export function Comments() {
  const { params, hrefWith, setParams } = useQueryParams();
  const query = (params.get("query") ?? "").trim();
  const status = readOption(params, "status", ["active", "suspended"]);
  const postId = readId(params, "post_id");
  const page = readPage(params);
  const list = usePage<AdminComment>(
    listPath("comments", { query, status, post_id: postId, page }),
  );
  const { dialog, menuItems, notice } = useModeration(list, moderations);
  const filtered = Boolean(query || status || postId);
  const clearHref = hrefWith({
    query: undefined,
    status: undefined,
    post_id: undefined,
    page: undefined,
  });
  const postExcerpt = list.page?.items.find((comment) => comment.post.id === postId)?.post
    .body_excerpt;

  const columns: Column<AdminComment>[] = [
    {
      key: "author",
      header: "Autor",
      rowHeader: true,
      cell: (comment) => (
        <Identity title={personName(comment.author)} detail={comment.author.email} />
      ),
    },
    {
      key: "comment",
      header: "Comentário",
      cell: (comment) => <LongText>{comment.body}</LongText>,
    },
    {
      key: "post",
      header: "Post",
      cell: ({ initiative, post }) => (
        <Identity title={post.body_excerpt || "Post removido"} detail={initiative.name} />
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (comment) => (
        <Status
          labels={["Ativo", "Suspenso"]}
          suspendedAt={comment.suspended_at}
          reason={comment.suspension_reason}
        />
      ),
    },
    {
      key: "created",
      header: "Publicado em",
      className: "text-[var(--admin-muted)]",
      cell: (comment) => <Published createdAt={comment.created_at} editedAt={comment.edited_at} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">Ações</span>,
      align: "end",
      sticky: true,
      className: "w-px",
      cell: (comment) => (
        <RowMenu
          label={`Ações para o comentário de ${personName(comment.author)}`}
          items={[
            ...menuItems(comment, [{ action: comment.suspended_at ? "reactivate" : "suspend" }]),
            ...(postId
              ? []
              : [
                  {
                    label: "Ver comentários do post",
                    onSelect: () => setParams({ post_id: comment.post.id, page: undefined }),
                  },
                ]),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <ContentHeader view="comments" onRefresh={list.reload} />

      <FilterBar label="Filtrar comentários">
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
        {postId ? (
          <FilterChip
            label="Post"
            value={postExcerpt || "Post selecionado"}
            clearHref={hrefWith({ post_id: undefined, page: undefined })}
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
        loadingLabel="Carregando comentários..."
        errorTitle="Não foi possível carregar os comentários"
        empty={
          filtered ? (
            <EmptyState
              title="Nenhum comentário encontrado"
              action={
                <Link href={clearHref} scroll={false} className={buttonClass()}>
                  Limpar filtros
                </Link>
              }
            >
              Ajuste a busca ou os filtros para ver outros resultados.
            </EmptyState>
          ) : (
            <EmptyState title="Nenhum comentário publicado">
              Os comentários feitos nos posts das iniciativas aparecem aqui.
            </EmptyState>
          )
        }
      >
        {(result) => (
          <DataTable
            caption="Comentários dos posts"
            columns={columns}
            rows={result.items}
            rowKey={(comment) => comment.id}
            busy={list.loading}
          />
        )}
      </PagedList>

      {dialog}
    </>
  );
}
