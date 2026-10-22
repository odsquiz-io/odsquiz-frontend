"use client";

import { PostComposer } from "./PostComposer";
import { PostList } from "./PostList";
import type { AvatarSource } from "./types";
import { usePostPages } from "./usePages";

// The initiative's activity: composer for its owner and members, then its posts.
export function InitiativePosts({
  canPublish,
  headingLevel = 3,
  initiative,
  initiativeId,
  token,
}: {
  canPublish: boolean;
  headingLevel?: 2 | 3;
  initiative: AvatarSource;
  initiativeId: string;
  token: string;
}) {
  const feed = usePostPages(token, initiativeId);

  return (
    <div className="grid grid-cols-1 gap-6">
      {canPublish ? (
        <PostComposer
          token={token}
          initiativeId={initiativeId}
          initiative={initiative}
          onPublished={feed.add}
        />
      ) : null}
      <PostList
        token={token}
        feed={feed}
        headingLevel={headingLevel}
        emptyMessage={
          canPublish
            ? "Nenhuma publicação ainda. Conte a primeira novidade da iniciativa."
            : "Esta iniciativa ainda não publicou atividades."
        }
      />
    </div>
  );
}
