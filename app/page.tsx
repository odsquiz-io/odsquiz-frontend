import { Header } from "@/components/Header";
import { Banner } from "@/components/Banner";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[var(--color-app-background)] transition-colors">
      <Header />
      <Banner />
    </main>
  );
}
