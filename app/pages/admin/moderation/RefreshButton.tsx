import { Icon } from "../ui/Icon";
import { buttonClass } from "../ui/styles";

export function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={buttonClass()}>
      <Icon>
        <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
        <path d="M21 3v5h-5" />
      </Icon>
      Atualizar
    </button>
  );
}
