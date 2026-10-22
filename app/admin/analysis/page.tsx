import type { Metadata } from "next";
import { MetricsDashboard } from "@/app/pages/admin/metrics/MetricsDashboard";

export const metadata: Metadata = { title: "Análises" };

export default function Page() {
  return <MetricsDashboard />;
}
