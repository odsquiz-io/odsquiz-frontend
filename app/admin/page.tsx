import type { Metadata } from "next";
import { Overview } from "@/app/pages/admin/overview/Overview";

export const metadata: Metadata = { title: "Visão geral" };

export default function Page() {
  return <Overview />;
}
