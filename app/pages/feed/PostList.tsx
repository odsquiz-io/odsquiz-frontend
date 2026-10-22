"use client";

import { useId, useState } from "react";
import { secondaryButton } from "@/components/styles";
import { Feedback } from "../initiatives/InitiativesList";
import { useFocusRequest } from "./hooks";
import { PostCard, postElementId } from "./PostCard";
import { pendingButton } from "./styles";
import type { Post } from "./types";
import type { Pages } from "./usePages";

export function PostList({
  emptyMessage,
  feed,
  headingLevel = 3,
  token,
}: {
  emptyMessage: string;
  feed: Pages<Post>;
  headingLevel?: 2 | 3;
  token: string;
}) {
  const emptyId = useId();
  const focus = useFocusRequest();
  const [notice, setNotice] = useState("");

  async function loadMore() {
    const [first] = await feed.loadMore();

    if (first) {
      focus(postElementId(first.id));
    }
  }

  function removed(post: Post) {
    const index = feed.items.findIndex((item) => item.id === post.id);
    const neighbor = feed.items[index + 1] ?? feed.items[index - 1];

    feed.remove(post.id);
    setNotice("Publicação excluída.");
    focus(neighbor ? postElementId(neighbor.id) : emptyId);
  }

  return (
    <div>
      {feed.status === "loading" ? (
        <Feedback tone="loading">Carregando atividades...</Feedback>
      ) : feed.status === "error" ? (
        <>
          <Feedback tone="error">{feed.error}</Feedback>
          <button type="button" onClick={feed.retry} className={`mt-4 ${secondaryButton}`}>
            Tentar de novo
          </button>
        </>
      ) : feed.items.length === 0 ? (
        <div id={emptyId} tabIndex={-1} className="outline-none">
          <Feedback>{emptyMessage}</Feedback>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {feed.items.map((post) => (
            <li key={post.id}>
              <PostCard
                post={post}
                token={token}
                headingLevel={headingLevel}
                onChange={feed.change}
                onRemoved={removed}
              />
            </li>
          ))}
        </ul>
      )}

      {feed.status === "ready" && feed.hasMore ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            aria-disabled={feed.loadingMore || undefined}
            onClick={() => void loadMore()}
            className={`${secondaryButton} ${pendingButton}`}
          >
            {feed.loadingMore ? "Carregando..." : "Carregar mais"}
          </button>
          {feed.moreError ? (
            <p role="alert" className="text-sm font-semibold text-[var(--color-error)]">
              {feed.moreError}
            </p>
          ) : null}
        </div>
      ) : null}

      <p role="status" className="sr-only">
        {notice}
      </p>
    </div>
  );
}
