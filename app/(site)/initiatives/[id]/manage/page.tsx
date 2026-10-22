import type { Metadata } from "next";
import { Suspense } from "react";
import ManageInitiative from "@/app/pages/initiatives/manage/ManageInitiative";

export const metadata: Metadata = { title: "Gerenciar iniciativa" };

export default async function ManageInitiativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The tabs read the query string, which needs a boundary when the page is prerendered.
  return (
    <Suspense>
      <ManageInitiative id={id} />
    </Suspense>
  );
}
