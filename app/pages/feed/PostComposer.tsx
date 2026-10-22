"use client";

import { surface } from "@/components/styles";
import { createPost } from "./api";
import { InitiativeAvatar } from "./InitiativeAvatar";
import { TextComposer } from "./TextComposer";
import { type AvatarSource, POST_MAX_LENGTH, type Post } from "./types";

export function PostComposer({
  initiative,
  initiativeId,
  onPublished,
  token,
}: {
  initiative: AvatarSource;
  initiativeId: string;
  onPublished: (post: Post) => void;
  token: string;
}) {
  return (
    <div className={`flex items-start gap-3 p-5 sm:gap-4 sm:p-6 ${surface}`}>
      <InitiativeAvatar initiative={initiative} size="md" />
      <TextComposer
        className="min-w-0 flex-1"
        label="Nova publicação"
        hint={`Aparece na página de ${initiative.name || "iniciativa"} e em Atividades.`}
        placeholder="Conte uma novidade, um resultado ou um convite..."
        maxLength={POST_MAX_LENGTH}
        emptyMessage="Escreva a publicação antes de publicar."
        submitLabel="Publicar"
        pendingLabel="Publicando..."
        resetOnSuccess
        successMessage="Publicação feita. Ela já aparece na lista."
        onSubmit={async (body) => onPublished(await createPost(token, initiativeId, body))}
      />
    </div>
  );
}
