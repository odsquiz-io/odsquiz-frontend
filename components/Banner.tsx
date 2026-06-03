import Image from "next/image";
import sdgCircle from "../public/sdg-circle.png";
import bannerWordmark from "../public/odsquiz-logo-words-only.png";

export function Banner() {
  return (
    <section className="flex min-h-[calc(100vh_-_var(--size-banner-height-offset))] items-center justify-center bg-transparent px-[var(--size-banner-padding-x)]">
      <div className="flex w-full max-w-[var(--size-banner-content-max-width)] items-center justify-center gap-[var(--size-banner-content-gap)]">
        <div className="relative flex h-[var(--size-banner-circle)] w-[var(--size-banner-circle)] shrink-0 items-center justify-center">
          <Image
            src={sdgCircle}
            alt="ODS circle"
            priority
            className="absolute inset-0 h-full w-full animate-spin-slow object-contain"
          />

          <Image
            src={bannerWordmark}
            alt="ODS Quiz"
            priority
            className="relative z-10 h-auto w-[var(--size-banner-wordmark-width)] object-contain"
          />
        </div>

        <div className="max-w-[var(--size-banner-copy-max-width)] text-center">
          <h1 className="mx-auto max-w-[var(--size-banner-title-max-width)] text-[length:var(--size-banner-title-text)] font-extrabold leading-[var(--size-banner-title-line-height)] tracking-wide text-[var(--color-app-foreground)]">
            Descubra o quanto a sua comunidade progride para o desenvolvimento
            sustentável no Brasil
          </h1>

          <p className="mt-[var(--size-banner-body-margin-top)] text-[length:var(--size-banner-body-text)] text-[var(--color-app-foreground)]">
            Responda algumas perguntas e descubra o quanto a sua comunidade
            progride nos ODS.
          </p>

          <button className="mt-[var(--size-banner-button-margin-top)] rounded-[var(--size-banner-button-radius)] border border-[var(--color-app-foreground)] px-[var(--size-banner-button-padding-x)] py-[var(--size-banner-button-padding-y)] text-[length:var(--size-banner-button-text)] font-bold text-[var(--color-app-foreground)] transition hover:bg-[var(--color-app-foreground)] hover:text-[var(--color-button-hover-text)]">
            Responder agora
          </button>
        </div>
      </div>
    </section>
  );
}
