import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Goals } from "./home/Goals";
import { Hero } from "./home/Hero";
import { Mission } from "./home/Mission";
import { Participate } from "./home/Participate";
import { Story } from "./home/Story";

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-[var(--color-app-background)] text-[var(--color-app-foreground)] transition-colors">
        <Hero />
        <Goals />
        <Story />
        <Mission />
        <Participate />
      </main>
      <Footer />
    </>
  );
}
