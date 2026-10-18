import type { Metadata } from "next";
import { Bricolage_Grotesque, Lexend } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: { default: "ODS Quiz", template: "%s | ODS Quiz" },
  description:
    "Descubra como a sua comunidade se relaciona com os 17 Objetivos de Desenvolvimento Sustentável da ONU e encontre iniciativas locais que já fazem a diferença.",
};

const themeScript = `
(() => {
  try {
    const storageKey = "odsquiz-theme";
    const savedTheme = window.localStorage.getItem(storageKey);
    const theme = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";

    const root = document.documentElement;

    root.dataset.theme = theme;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
  } catch {
    const root = document.documentElement;

    root.dataset.theme = "dark";
    root.classList.add("dark");
    root.classList.remove("light");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${lexend.variable} ${bricolage.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Header />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
