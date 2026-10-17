import InitiativeDetails from "../../pages/InitiativeDetails";

export default async function InitiativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InitiativeDetails id={id} />;
}
