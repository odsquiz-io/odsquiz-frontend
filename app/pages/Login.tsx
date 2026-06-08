import { Header } from "@/components/Header";
import { AuthForm } from "./AuthForm";

export default function Login() {
  return (
    <main className="relative min-h-screen bg-[var(--color-app-background)] transition-colors">
      <Header />
      <AuthForm mode="login" />
    </main>
  );
}
