import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const sfProText = localFont({
  variable: "--font-sf-pro-text",
  src: [
    {
      path: "../public/fonts/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Text-Heavy.otf",
      weight: "800",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "ODS Quiz",
  description: "Developed by Serra Hackclub, remastered by Kauan Peçanha",
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
      lang="en"
      className={`${sfProText.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
