import { Icon } from "../ui/Icon";

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-md bg-[var(--admin-text)] text-[var(--admin-canvas)]"
      >
        <Icon className="size-4">
          <path d="M8 17v-5M13 17V8M18 17v-8" />
        </Icon>
      </span>
      <span className="text-sm font-semibold">ODS Quiz</span>
      <span className="text-sm text-[var(--admin-muted)]">Painel</span>
    </div>
  );
}
