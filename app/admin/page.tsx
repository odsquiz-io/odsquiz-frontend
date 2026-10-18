import type { Metadata } from "next";
import { MetricsDashboard } from "@/app/pages/admin/metrics/MetricsDashboard";

export const metadata: Metadata = { title: "Visão geral" };

export default function Page() {
  return <MetricsDashboard />;
}
