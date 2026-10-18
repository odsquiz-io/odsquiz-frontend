import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AdminShell } from "@/app/pages/admin/shell/AdminShell";
import "./admin.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-admin",
});

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel ODS Quiz" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin ${geist.variable} flex flex-1 flex-col`}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
