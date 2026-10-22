"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useSession } from "@/components/SessionProvider";
import { focusRing } from "@/components/styles";
import { ActionsMenu, type MenuAction } from "./ActionsMenu";
import { createComment, deleteComment, isGone, updateComment } from "./api";
import { ExpandableText } from "./ExpandableText";
import { useFailure, useFocusRequest } from "./hooks";
import { PersonAvatar } from "./PersonAvatar";
import { EditedMark, RelativeTime } from "./RelativeTime";
import { pendingButton, quietButton } from "./styles";
import { TextComposer } from "./TextComposer";
import { COMMENT_MAX_LENGTH, type Comment } from "./types";
import { useCommentPages } from "./usePages";

export function CommentThread({
  autoFocus = false,
  onCountChange,
  postId,
  token,
}: {
  autoFocus?: boolean;
  onCountChange: (delta: number) => void;
  postId: string;
  token: string;
}) {
  const { user } = useSession();
  const comments = useCommentPages(token, postId);
  const focus = useFocusRequest();
  const composerId = useId();
  const [notice, setNotice] = useState("");

  async function loadMore() {
    const [first] = await comments.loadMore();

    if (first) {
      focus(commentElementId(first.id));
    }
  }

  function removed(comment: Comment) {
    const index = comments.items.findIndex((item) => item.id === comment.id);
    const neighbor = comments.items[index + 1] ?? comments.items[index - 1];

    comments.remove(comment.id);
    onCountChange(-1);
    setNotice("Comentário excluído.");
    focus(neighbor ? commentElementId(neighbor.id) : composerId);
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4">
      {comments.status === "loading" ? (
        <p role="status" className="text-sm text-[var(--color-muted)]">
          Carregando comentários...
        </p>
      ) : comments.status === "error" ? (
        <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <p className="font-semibold text-[var(--color-error)]">{comments.error}</p>
          <button type="button" onClick={comments.retry} className={quietButton}>
            Tentar de novo
          </button>
        </div>
      ) : null}

      {comments.items.length > 0 ? (
        <ul aria-label="Comentários" className="grid grid-cols-1 gap-3">
          {comments.items.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                token={token}
                onChange={(updated) => comments.change(updated.id, () => updated)}
                onRemoved={removed}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {comments.hasMore ? (
        <div>
          <button
            type="button"
            aria-disabled={comments.loadingMore || undefined}
            onClick={() => void loadMore()}
            className={`${quietButton} ${pendingButton}`}
          >
            {comments.loadingMore ? "Carregando comentários..." : "Ver mais comentários"}
          </button>
          {comments.moreError ? (
            <p role="alert" className="mt-1 text-sm font-semibold text-[var(--color-error)]">
              {comments.moreError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        <PersonAvatar name={user?.name} />
        <TextComposer
          id={composerId}
          compact
          autoFocus={autoFocus}
          className="min-w-0 flex-1"
          label="Escrever comentário"
          labelHidden
          placeholder="Escreva um comentário..."
          maxLength={COMMENT_MAX_LENGTH}
          emptyMessage="Escreva o comentário antes de enviar."
          submitLabel="Comentar"
          pendingLabel="Enviando..."
          resetOnSuccess
          successMessage="Comentário enviado."
          onSubmit={async (body) => {
            const comment = await createComment(token, postId, body);

            comments.add(comment);
            onCountChange(1);
            setNotice("");
          }}
        />
      </div>

      <p role="status" className="sr-only">
        {notice}
      </p>
    </div>
  );
}

function CommentItem({
  comment,
  onChange,
  onRemoved,
  token,
}: {
  comment: Comment;
  onChange: (comment: Comment) => void;
  onRemoved: (comment: Comment) => void;
  token: string;
}) {
  const id = useId();
  const fail = useFailure();
  const menuButton = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState("");
  const actions: MenuAction[] = [];

  if (comment.viewer_can_edit) {
    actions.push({
      label: "Editar",
      onSelect: () => {
        setNotice("");
        setEditing(true);
      },
    });
  }

  if (comment.viewer_can_delete) {
    actions.push({ label: "Excluir", tone: "danger", onSelect: () => setConfirming(true) });
  }

  function finishEditing(updated?: Comment) {
    flushSync(() => {
      if (updated) {
        onChange(updated);
      }

      setEditing(false);
      setNotice(updated ? "Comentário atualizado." : "");
    });
    menuButton.current?.focus();
  }

  return (
    <article
      id={commentElementId(comment.id)}
      tabIndex={-1}
      aria-labelledby={`${id}-author ${id}-meta`}
      className={`flex items-start gap-3 rounded-lg ${focusRing}`}
    >
      <PersonAvatar name={comment.author.name} />
      <div className="min-w-0 flex-1 rounded-lg bg-[var(--color-theme-toggle-background)] px-4 py-3">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-sm">
            <span id={`${id}-author`} className="font-bold wrap-anywhere">
              {comment.author.name}
            </span>
            <span id={`${id}-meta`} className="text-[var(--color-muted)]">
              <span aria-hidden="true"> · </span>
              <RelativeTime value={comment.created_at} />
              <EditedMark value={comment.edited_at} />
            </span>
          </p>
          {actions.length > 0 ? (
            <ActionsMenu
              actions={actions}
              buttonRef={menuButton}
              label={`Ações do comentário de ${comment.author.name}`}
              size="sm"
            />
          ) : null}
        </div>

        {editing ? (
          <TextComposer
            compact
            autoFocus
            className="mt-2"
            label="Editar comentário"
            labelHidden
            initialValue={comment.body}
            maxLength={COMMENT_MAX_LENGTH}
            emptyMessage="O comentário não pode ficar vazio."
            submitLabel="Salvar"
            pendingLabel="Salvando..."
            onCancel={() => finishEditing()}
            onSubmit={async (body) =>
              finishEditing(await updateComment(token, comment.id, body))
            }
          />
        ) : (
          <ExpandableText className="mt-1" lines={4} text={comment.body} />
        )}
      </div>

      {confirming ? (
        <ConfirmDialog
          title="Excluir comentário?"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          tone="danger"
          onClose={() => setConfirming(false)}
          onConfirm={async () => {
            try {
              await deleteComment(token, comment.id);
            } catch (error) {
              if (!isGone(error)) {
                fail(error, "");
                throw error;
              }
            }

            onRemoved(comment);
          }}
        >
          O comentário será excluído para todos. Essa ação não pode ser desfeita.
        </ConfirmDialog>
      ) : null}

      <p role="status" className="sr-only">
        {notice}
      </p>
    </article>
  );
}

function commentElementId(id: string) {
  return `comment-${id}`;
}
