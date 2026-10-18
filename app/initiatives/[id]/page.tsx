import type { Metadata } from "next";
import InitiativeDetails from "../../pages/InitiativeDetails";

export const metadata: Metadata = { title: "Iniciativa" };

export default async function InitiativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InitiativeDetails id={id} />;
}
