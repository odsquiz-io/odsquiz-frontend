import Link from "next/link";
import { PageHeader } from "../ui/PageHeader";
import { focusRing } from "../ui/styles";
import { RefreshButton } from "./RefreshButton";

export type ContentView = "posts" | "comments";

const views: { view: ContentView; label: string; href: string }[] = [
  { view: "posts", label: "Posts", href: "/admin/content" },
  { view: "comments", label: "Comentários", href: "/admin/content?view=comments" },
];

export function ContentHeader({ onRefresh, view }: { onRefresh: () => void; view: ContentView }) {
  return (
    <>
      <PageHeader
        title="Publicações"
        description="Revise os posts das iniciativas e os comentários feitos neles. Um conteúdo suspenso sai da página da iniciativa e do feed de atividades até ser reativado."
        actions={<RefreshButton onClick={onRefresh} />}
      />

      <nav aria-label="Tipo de publicação">
        <ul className="flex gap-1">
          {views.map((item) => (
            <li key={item.view}>
              <Link
                href={item.href}
                aria-current={item.view === view ? "page" : undefined}
                className={`flex h-9 items-center rounded-md px-3 text-sm text-[var(--admin-muted)] hover:bg-[var(--admin-raised)] hover:text-[var(--admin-text)] aria-[current=page]:bg-[var(--admin-accent-soft)] aria-[current=page]:font-medium aria-[current=page]:text-[var(--admin-accent)] motion-safe:transition-colors ${focusRing}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
