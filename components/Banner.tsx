import Image from "next/image";

export function Banner() {
  return (
    <section className="flex min-h-[calc(100vh-20rem)] items-center justify-center bg-transparent px-6">
      <div className="flex w-full max-w-5xl items-center justify-center gap-12">
        <div className="relative flex h-64 w-64 shrink-0 items-center justify-center">
          <Image
            src="/sdg-circle.png"
            alt="ODS circle"
            width={256}
            height={256}
            priority
            className="absolute inset-0 h-full w-full animate-spin-slow object-contain"
          />

          <Image
            src="/odsquiz-logo-words-only.png"
            alt="ODS Quiz"
            width={95}
            height={70}
            priority
            className="relative z-10 h-auto w-[75%] object-contain"
          />
        </div>

        <div className="max-w-xl text-center">
          <h1 className="mx-auto max-w-[560px] text-3xl font-extrabold leading-tight tracking-wide text-white">
            Descubra o quanto a sua comunidade progride para o desenvolvimento
            sustentável no Brasil
          </h1>

          <p className="mt-4 text-xl text-white">
            Responda algumas perguntas e descubra o quanto a sua comunidade
            progride nos ODS.
          </p>

          <button className="mt-6 rounded-md border border-white px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-slate-950">
            Responder agora
          </button>
        </div>
      </div>
    </section>
  );
}
