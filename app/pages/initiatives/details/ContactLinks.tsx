import type { ReactNode } from "react";
import { eyebrow, focusRing } from "@/components/styles";
import { formatWhatsapp } from "../format";
import type { Initiative } from "../types";
import { Icon } from "./Icon";
import { ManageHint } from "./ManageHint";

type Contact = {
  external: boolean;
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
};

export function ContactLinks({
  initiative,
  manageHref,
}: {
  initiative: Initiative;
  manageHref?: string;
}) {
  const contacts = contactsOf(initiative);
  const missingSocial = !contacts.some((contact) => contact.external);

  return (
    <section aria-labelledby="contact-title">
      <h2 id="contact-title" className={eyebrow}>
        Contato
      </h2>

      {contacts.length > 0 ? (
        <ul className="mt-6 border-b border-[var(--color-header-border)]">
          {contacts.map((contact) => (
            <li key={contact.label} className="border-t border-[var(--color-header-border)]">
              <a
                href={contact.href}
                target={contact.external ? "_blank" : undefined}
                rel={contact.external ? "noreferrer" : undefined}
                className={`group flex items-center gap-3 py-3 transition hover:text-[var(--color-link-hover)] ${focusRing}`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--color-header-border)] bg-[var(--color-theme-toggle-background)] transition-colors group-hover:border-current">
                  {contact.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">{contact.label}</span>{" "}
                  <span className="block text-sm text-[var(--color-muted)] wrap-anywhere">
                    {contact.value}
                  </span>
                </span>
                {contact.external ? (
                  <>
                    <span aria-hidden="true" className="text-[var(--color-muted)]">
                      ↗
                    </span>
                    <span className="sr-only"> (abre em nova guia)</span>
                  </>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {manageHref && missingSocial ? (
        <ManageHint href={`${manageHref}?aba=dados`} label="adicione WhatsApp, Instagram ou site">
          Facilite o contato de quem visita:
        </ManageHint>
      ) : null}
    </section>
  );
}

function contactsOf({ email_owner, instagram, website, whatsapp }: Initiative) {
  const contacts: Contact[] = [];
  const phone = whatsapp?.replace(/\D/g, "");
  const site = siteOf(website);

  if (phone) {
    contacts.push({
      external: true,
      href: `https://wa.me/${phone}`,
      icon: (
        <Icon>
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </Icon>
      ),
      label: "WhatsApp",
      value: formatWhatsapp(phone),
    });
  }

  if (instagram) {
    contacts.push({
      external: true,
      href: `https://www.instagram.com/${encodeURIComponent(instagram)}`,
      icon: (
        <Icon>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </Icon>
      ),
      label: "Instagram",
      value: `@${instagram}`,
    });
  }

  if (site) {
    contacts.push({
      external: true,
      href: site.href,
      icon: (
        <Icon>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </Icon>
      ),
      label: "Site",
      value: site.label,
    });
  }

  if (email_owner) {
    contacts.push({
      external: false,
      href: `mailto:${email_owner}`,
      icon: (
        <Icon>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </Icon>
      ),
      label: "E-mail",
      value: email_owner,
    });
  }

  return contacts;
}

// Only http(s) links are rendered, whatever the stored value.
function siteOf(value?: string | null) {
  try {
    const url = new URL(value ?? "");

    return url.protocol === "https:" || url.protocol === "http:"
      ? { href: url.href, label: `${url.host}${url.pathname.replace(/\/$/, "")}` }
      : undefined;
  } catch {
    return undefined;
  }
}
