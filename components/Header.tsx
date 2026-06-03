import Link from "next/link";
import Image from "next/image";

const navItems = [
  { label: "Home", href: "#" },
  { label: "Termômetro", href: "#" },
  { label: "Iniciativas", href: "#" },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 w-full px-4 pt-4">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between rounded-md border border-slate-800 bg-[#0b1220] px-8">
        <Link href="/" className="flex items-center" aria-label="ODSQuiz home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-12 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-base font-semibold text-white transition hover:text-indigo-400"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="#"
            className="text-base font-semibold text-white transition hover:text-indigo-400"
          >
            Log in <span aria-hidden="true"></span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <Image
      src="/ods-quiz-wordmark-transparent.png"
      alt="ODS Quiz"
      width={96}
      height={48}
      priority
      className="h-12 w-auto brightness-0 invert"
    />
  );
}
