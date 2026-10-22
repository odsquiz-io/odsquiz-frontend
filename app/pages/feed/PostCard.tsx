"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { focusRing, surface } from "@/components/styles";
import { ActionsMenu, type MenuAction } from "./ActionsMenu";
import { deletePost, isGone, updatePost } from "./api";
import { CommentThread } from "./CommentThread";
import { ExpandableText } from "./ExpandableText";
import { commentsLabel } from "./format";
import { useFailure } from "./hooks";
import { InitiativeAvatar } from "./InitiativeAvatar";
import { EditedMark, RelativeTime } from "./RelativeTime";
import { iconProps, quietButton } from "./styles";
import { TextComposer } from "./TextComposer";
import { POST_MAX_LENGTH, type Post } from "./types";

export function postElementId(id: string) {
  return `post-${id}`;
}

export function PostCard({
  headingLevel = 3,
  onChange,
  onRemoved,
  post,
  token,
}: {
  headingLevel?: 2 | 3;
  onChange: (postId: string, update: (post: Post) => Post) => void;
  onRemoved: (post: Post) => void;
  post: Post;
  token: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const id = useId();
  const commentsId = `${id}-comments`;
  const fail = useFailure();
  const menuButton = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsShown, setCommentsShown] = useState(false);
  const [focusComposer, setFocusComposer] = useState(false);
  const [notice, setNotice] = useState("");
  const initiativeName = post.initiative.name || "Iniciativa sem nome";
  const actions: MenuAction[] = [];

  if (post.viewer_can_edit) {
    actions.push({
      label: "Editar",
      onSelect: () => {
        setNotice("");
        setEditing(true);
      },
    });
  }

  if (post.viewer_can_delete) {
    actions.push({ label: "Excluir", tone: "danger", onSelect: () => setConfirming(true) });
  }

  function finishEditing(updated?: Post) {
    flushSync(() => {
      if (updated) {
        onChange(updated.id, () => updated);
      }

      setEditing(false);
      setNotice(updated ? "Publicação atualizada." : "");
    });
    menuButton.current?.focus();
  }

  function toggleComments() {
    if (!commentsShown) {
      setFocusComposer(post.comments_count === 0);
      setCommentsShown(true);
    }

    setCommentsOpen(!commentsOpen);
  }

  return (
    <article
      id={postElementId(post.id)}
      tabIndex={-1}
      aria-labelledby={`${id}-title ${id}-meta`}
      className={`p-5 sm:p-6 ${surface} ${focusRing}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <InitiativeAvatar initiative={post.initiative} size="md" />
        <div className="min-w-0 flex-1">
          <Heading
            id={`${id}-title`}
            className="text-lg font-extrabold leading-tight [font-stretch:85%] wrap-break-word"
          >
            <Link
              href={`/initiatives/${post.initiative.id}`}
              className={`underline-offset-4 transition hover:text-[var(--color-link-hover)] hover:underline ${focusRing}`}
            >
              {initiativeName}
            </Link>
          </Heading>
          <p id={`${id}-meta`} className="mt-1 text-sm text-[var(--color-muted)]">
            <span className="wrap-anywhere">por {post.author.name}</span>
            <span aria-hidden="true"> · </span>
            <RelativeTime value={post.created_at} />
            <EditedMark value={post.edited_at} />
          </p>
        </div>
        {actions.length > 0 ? (
          <ActionsMenu
            actions={actions}
            buttonRef={menuButton}
            label={`Ações da publicação de ${initiativeName}`}
          />
        ) : null}
      </div>

      {editing ? (
        <TextComposer
          autoFocus
          className="mt-4"
          label="Editar publicação"
          labelHidden
          initialValue={post.body}
          maxLength={POST_MAX_LENGTH}
          emptyMessage="A publicação não pode ficar vazia."
          submitLabel="Salvar"
          pendingLabel="Salvando..."
          onCancel={() => finishEditing()}
          onSubmit={async (body) => finishEditing(await updatePost(token, post.id, body))}
        />
      ) : (
        <ExpandableText className="mt-4" text={post.body} />
      )}

      <div className="-mx-2 mt-4 border-t border-[var(--color-header-border)] pt-2">
        <button
          type="button"
          aria-expanded={commentsOpen}
          aria-controls={commentsId}
          onClick={toggleComments}
          className={quietButton}
        >
          <svg {...iconProps} className="size-4.5">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          {commentsLabel(post.comments_count)}
        </button>
      </div>

      <div id={commentsId} hidden={!commentsOpen}>
        {commentsShown ? (
          <CommentThread
            token={token}
            postId={post.id}
            autoFocus={focusComposer}
            onCountChange={(delta) =>
              onChange(post.id, (current) => ({
                ...current,
                comments_count: Math.max(0, current.comments_count + delta),
              }))
            }
          />
        ) : null}
      </div>

      {confirming ? (
        <ConfirmDialog
          title="Excluir publicação?"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          tone="danger"
          onClose={() => setConfirming(false)}
          onConfirm={async () => {
            try {
              await deletePost(token, post.id);
            } catch (error) {
              if (!isGone(error)) {
                fail(error, "");
                throw error;
              }
            }

            onRemoved(post);
          }}
        >
          A publicação e os comentários dela serão excluídos para todos. Essa ação
          não pode ser desfeita.
        </ConfirmDialog>
      ) : null}

      <p role="status" className="sr-only">
        {notice}
      </p>
    </article>
  );
}
