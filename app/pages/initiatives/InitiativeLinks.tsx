import Link from "next/link";

export function InitiativeLinks({
  className = "",
  id,
}: {
  className?: string;
  id?: string;
}) {
  if (!id) {
    return null;
  }

  const href = `/initiatives/${id}`;

  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
      <Link href={href} className={className}>
        Ver iniciativa<span aria-hidden="true"> →</span>
      </Link>
      <Link href={href} target="_blank" className={className}>
        Abrir em nova guia
      </Link>
    </div>
  );
}
