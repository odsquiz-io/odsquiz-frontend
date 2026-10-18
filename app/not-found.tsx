import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import NotFound from "./pages/NotFound";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <NotFound />
      <Footer />
    </>
  );
}
