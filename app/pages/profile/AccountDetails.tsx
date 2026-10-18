import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { type SessionUser, useSession } from "@/components/SessionProvider";
import { secondaryButton } from "@/components/styles";
import { cityState, formatCep } from "@/lib/cep";
import { AccountForm } from "./AccountForm";
import { formatDate } from "./format";

export function AccountDetails({
  editing,
  onEditingChange,
  token,
  user,
}: {
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  token: string;
  user: SessionUser;
}) {
  const { updateUser } = useSession();
  const editButton = useRef<HTMLButtonElement>(null);
  const [message, setMessage] = useState("");
  const details = [
    { label: "Nome", value: user.name },
    { label: "E-mail", value: user.email },
    { label: "Endereço", value: user.address },
    { label: "Cidade", value: cityState(user) },
    { label: "CEP", value: formatCep(user.cep) },
    {
      label: "Membro desde",
      value: formatDate(user.created_at, { dateStyle: "long" }),
    },
  ];

  function finishEditing(savedUser?: SessionUser) {
    // Renders the details right away so focus can return to their button.
    flushSync(() => {
      if (savedUser) {
        updateUser(savedUser);
      }

      setMessage(savedUser ? "Dados atualizados." : "");
      onEditingChange(false);
    });
    editButton.current?.focus();
  }

  return (
    <div className="mt-6 max-w-3xl">
      {editing ? (
        <AccountForm
          token={token}
          user={user}
          onCancel={() => finishEditing()}
          onSaved={finishEditing}
        />
      ) : (
        <>
          <dl className="border-b border-[var(--color-header-border)]">
            {details.map(({ label, value }) => (
              <div
                key={label}
                className="grid gap-1 border-t border-[var(--color-header-border)] py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <dt className="text-[var(--color-muted)]">{label}</dt>
                <dd className={value ? "font-bold wrap-anywhere" : "text-[var(--color-muted)]"}>
                  {value || "Não informado"}
                </dd>
              </div>
            ))}
          </dl>
          <button
            ref={editButton}
            type="button"
            onClick={() => {
              setMessage("");
              onEditingChange(true);
            }}
            className={`mt-6 ${secondaryButton}`}
          >
            Editar dados
          </button>
        </>
      )}
      <p
        role="status"
        className={
          message
            ? "mt-4 border-l-4 border-[var(--color-success)] py-1 pl-3 text-sm font-semibold text-[var(--color-success)]"
            : undefined
        }
      >
        {message}
      </p>
    </div>
  );
}
