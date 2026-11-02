import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  ExternalLink,
  Globe,
  Heart,
  Mail,
  Maximize2,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFavorites } from "@/hooks/use-favorites";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import {
  SITE_URL,
  type Professional,
  fetchProfessionalBySlug,
  type ContactChannel,
  getPrimaryContact,
  getInitials,
  getModalityLabel,
  getProfessionalDescription,
  getProfessionalLocation,
  getProfessionalProfilePath,
  getResponsivePhotoAttrs,
} from "@/lib/professionals-api";

export const Route = createFileRoute("/profissionais/$slug")({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["professional", params.slug],
      queryFn: () => fetchProfessionalBySlug(params.slug),
    });
  },
  head: ({ loaderData }) => {
    const professional = loaderData;
    const title = professional
      ? `${professional.name} — Profissional indicado pelo Instituto LIZ`
      : "Profissional não encontrado — LIZ INDICA";
    const description = professional
      ? getProfessionalDescription(professional)
      : "Perfil não encontrado no diretório oficial LIZ INDICA.";
    const canonical = professional
      ? `${SITE_URL}${getProfessionalProfilePath(professional)}`
      : `${SITE_URL}/profissionais`;
    const imageUrl = getAbsolutePublicUrl(professional?.photo_url);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: canonical },
        ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
        { name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: ProfessionalProfilePage,
});

function getAbsolutePublicUrl(url: string | null | undefined) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function parseExternalLinks(text: string | null) {
  if (!text) return [];
  const regex = /((?:https?:\/\/|www\.)[^\s,;]+)|(@[\w.]+)/gi;
  const links = new Map<string, string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const label = match[0].replace(/[.)]+$/, "");
    let href = label;
    if (label.startsWith("@")) href = `https://instagram.com/${label.substring(1)}`;
    else if (label.toLowerCase().startsWith("www.")) href = `https://${label}`;
    links.set(href, label);
  }

  return Array.from(links, ([href, label]) => ({ href, label }));
}

function getReturnFallback() {
  return "/#diretorio";
}

/** Bio paragraphs exactly as written — no inferred headings, no truncation. */
function splitBioParagraphs(bio: string | null): string[] {
  if (!bio) return [];
  return bio
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getJsonLd(professional: Professional, profileUrl: string) {
  const links = parseExternalLinks(professional.social_media).map((link) => link.href);
  const location = getProfessionalLocation(professional);

  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: professional.name,
      url: profileUrl,
      image: getAbsolutePublicUrl(professional.photo_url),
      description: getProfessionalDescription(professional),
      knowsAbout: professional.specialties,
      knowsLanguage: professional.languages,
      sameAs: links.length > 0 ? links : undefined,
      affiliation: {
        "@type": "Organization",
        name: "Instituto LIZ",
        url: SITE_URL,
      },
      address: location
        ? {
            "@type": "PostalAddress",
            addressLocality: professional.city ?? undefined,
            addressCountry: professional.country ?? undefined,
          }
        : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "LIZ INDICA",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: professional.name,
          item: profileUrl,
        },
      ],
    },
  ];
}

function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-parchment)] text-[var(--color-sepia)]">
      <SiteHeader />
      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="grid min-h-[70vh] place-items-center px-6 py-24"
      >
        <div className="max-w-lg text-center">
          <span className="label-mono">Perfil indisponível</span>
          <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
            Este profissional não foi encontrado
          </h1>
          <p className="mt-4 text-[var(--color-sepia)]">
            O perfil pode ter sido removido, estar em revisão ou ainda não estar publicado.
          </p>
          <a href="/#diretorio" className="btn-primary mt-8">
            Voltar ao diretório
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

const CHANNEL_ICON: Record<ContactChannel["kind"], typeof MessageCircle> = {
  whatsapp: MessageCircle,
  email: Mail,
  instagram: AtSign,
  site: Globe,
  phone: Phone,
};

function ContactButton({
  contact,
  name,
  className = "",
}: {
  contact: ContactChannel;
  name: string;
  className?: string;
}) {
  const Icon = CHANNEL_ICON[contact.kind];
  const external = contact.kind !== "email" && contact.kind !== "phone";
  return (
    <a
      href={contact.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={`${contact.label}: ${name}${external ? " (abre em nova aba)" : ""}`}
      className={`btn-primary min-h-12 ${className}`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {contact.label}
    </a>
  );
}

function ProfessionalProfilePage() {
  const professional = Route.useLoaderData();
  const [returnHref, setReturnHref] = useState(getReturnFallback);
  const [copied, setCopied] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const favorites = useFavorites();

  useEffect(() => {
    const stored = sessionStorage.getItem("liz-directory-return");
    if (stored) setReturnHref(stored);
  }, []);

  const contact = professional ? getPrimaryContact(professional) : null;
  const profileUrl = professional ? `${SITE_URL}${getProfessionalProfilePath(professional)}` : "";
  const location = professional ? getProfessionalLocation(professional) : "";
  const externalLinks = professional ? parseExternalLinks(professional.social_media) : [];
  const jsonLd = useMemo(
    () => (professional ? getJsonLd(professional, profileUrl) : null),
    [professional, profileUrl],
  );
  const paragraphs = useMemo(
    () => (professional ? splitBioParagraphs(professional.bio) : []),
    [professional],
  );

  if (!professional) return <ProfileNotFound />;

  const isFavorite = favorites.has(professional.id);

  const shareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${professional.name} — LIZ INDICA`,
          text: getProfessionalDescription(professional),
          url: profileUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no-op */
    }
  };

  const hasModality = professional.online || professional.in_person;
  const modalityLabel = hasModality ? getModalityLabel(professional) : null;

  // Lead: first sentence of bio (never modified) — repeated from the full bio below.
  const lead = professional.bio
    ? (professional.bio.match(/^[^.!?\n]+[.!?]?/)?.[0] ?? "").trim()
    : "";

  const chipDark = "chip !border-white/25 !bg-white/10 !text-[var(--color-parchment)]";

  return (
    <div
      className={`min-h-screen bg-[var(--color-parchment)] text-[var(--color-sepia)] selection:bg-[var(--color-gold)]/30 ${contact ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0" : ""}`}
    >
      <SiteHeader />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <main id="conteudo-principal" tabIndex={-1}>
        {/* CABEÇALHO — dossiê compacto em fundo ink */}
        <section
          aria-labelledby="perfil-nome"
          className="relative overflow-hidden bg-[var(--color-ink)] px-4 pb-8 pt-24 text-[var(--color-parchment)] sm:px-8 md:pb-16 md:pt-28 lg:px-12"
        >
          <div className="relative z-10 mx-auto max-w-6xl">
            <a
              href={returnHref}
              className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--color-parchment)]/85 transition-colors hover:text-[var(--color-gold)] md:mb-8"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar ao diretório
            </a>

            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
              {/* Retrato em arco — imagem inteira, ampliável */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => professional.photo_url && setPhotoOpen(true)}
                  disabled={!professional.photo_url}
                  aria-label={
                    professional.photo_url
                      ? `Ampliar foto de ${professional.name}`
                      : `Sem foto de ${professional.name}`
                  }
                  className="group block w-full rounded-[999px_999px_1rem_1rem] focus-visible:outline-[var(--color-gold)] disabled:cursor-default"
                >
                  <div className="arch-frame aspect-[3/4]">
                    {professional.photo_url ? (
                      <img
                        {...getResponsivePhotoAttrs(
                          professional.photo_url,
                          "(min-width: 1024px) 240px, (min-width: 640px) 160px, 104px",
                        )}
                        alt={professional.name}
                        className="photo-sepia h-full w-full object-contain"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="grid h-full w-full place-items-center font-display text-3xl text-[var(--color-parchment)] sm:text-5xl"
                        aria-hidden="true"
                      >
                        {getInitials(professional.name)}
                      </div>
                    )}
                  </div>
                  {professional.photo_url && (
                    <span className="absolute bottom-2 left-2 grid size-8 place-items-center rounded-full bg-[var(--color-ink)]/85 text-[var(--color-parchment)] sm:size-9">
                      <Maximize2 className="size-4" aria-hidden="true" />
                    </span>
                  )}
                </button>

                <div
                  role="img"
                  className="wax-seal -bottom-5 -right-5 hidden scale-75 sm:grid lg:scale-90"
                  aria-label="Selo — Indicado pelo Instituto LIZ"
                >
                  <span aria-hidden="true">
                    Indicado(a)
                    <br />
                    Instituto
                    <br />
                    LIZ
                  </span>
                </div>
              </div>

              {/* Ficha */}
              <div className="min-w-0">
                <span className="label-mono text-[var(--color-gold-soft)]">
                  Dossiê · Diretório Oficial
                </span>

                <h1
                  id="perfil-nome"
                  className="mt-2 font-display text-[1.65rem] leading-[1.1] text-[var(--color-parchment)] [overflow-wrap:anywhere] sm:text-5xl lg:text-6xl"
                >
                  {professional.name}
                </h1>

                <p className="mt-2 inline-flex items-center rounded-full border border-[var(--color-gold)]/50 px-3 py-1 text-xs text-[var(--color-gold-soft)] sm:hidden">
                  Indicado(a) Instituto LIZ
                </p>

                {(modalityLabel || location || professional.languages.length > 0) && (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Atendimento e localização">
                    {modalityLabel && <li className={chipDark}>{modalityLabel}</li>}
                    {location && <li className={chipDark}>{location}</li>}
                    {professional.languages.slice(0, 2).map((lang: string) => (
                      <li key={lang} className={`${chipDark} hidden sm:inline-flex`}>
                        {lang}
                      </li>
                    ))}
                  </ul>
                )}

                {lead && (
                  <p className="mt-6 hidden max-w-reading font-display text-xl leading-snug text-[var(--color-parchment)]/95 lg:block">
                    {lead}
                  </p>
                )}

                <div className="mt-5 hidden flex-wrap gap-3 sm:flex md:mt-8">
                  {contact && <ContactButton contact={contact} name={professional.name} />}
                  <button
                    type="button"
                    onClick={shareProfile}
                    className="btn-ghost-gold min-h-12 !text-[var(--color-parchment)] hover:!bg-white/10"
                  >
                    <Share2 className="size-4" aria-hidden="true" />
                    {copied ? "Link copiado" : "Compartilhar perfil"}
                  </button>
                  <button
                    type="button"
                    onClick={() => favorites.toggle(professional.id)}
                    aria-pressed={isFavorite}
                    className="btn-ghost-gold min-h-12 !text-[var(--color-parchment)] hover:!bg-white/10"
                  >
                    <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
                    {isFavorite ? "Salvo nos favoritos" : "Salvar nos favoritos"}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile actions — full width under the identity block */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:hidden">
              {contact && (
                <ContactButton contact={contact} name={professional.name} className="col-span-2 w-full" />
              )}
              <button
                type="button"
                onClick={shareProfile}
                className="btn-ghost-gold min-h-11 !px-3 !text-[var(--color-parchment)]"
              >
                <Share2 className="size-4" aria-hidden="true" />
                {copied ? "Copiado" : "Compartilhar"}
              </button>
              <button
                type="button"
                onClick={() => favorites.toggle(professional.id)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
                className="btn-ghost-gold min-h-11 !px-3 !text-[var(--color-parchment)]"
              >
                <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
                {isFavorite ? "Salvo" : "Favoritar"}
              </button>
            </div>

            {!contact && (
              <div
                role="note"
                className="mt-5 max-w-reading rounded-xl border border-[var(--color-gold)]/40 bg-white/5 p-4 text-sm leading-relaxed text-[var(--color-parchment)]/90"
              >
                Este perfil ainda não informou um canal de contato público. Você pode salvá-lo nos
                favoritos e{" "}
                <a href={returnHref} className="font-semibold text-[var(--color-gold-soft)] underline underline-offset-4">
                  ver outros profissionais no diretório
                </a>
                .
              </div>
            )}
          </div>

          <div className="hairline absolute inset-x-0 bottom-0" aria-hidden="true" />
        </section>

        {/* CORPO */}
        <div className="px-4 py-12 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section aria-labelledby="perfil-sobre">
              <h2 id="perfil-sobre" className="font-display text-2xl text-[var(--color-ink)] md:text-3xl">
                Sobre {professional.name.split(" ")[0]}
              </h2>
              {paragraphs.length > 0 ? (
                <div className="chapter-thread mt-6">
                  <span className="chapter-knot" aria-hidden="true" />
                  <div className="max-w-reading space-y-4 text-base leading-[1.75] text-[var(--color-sepia)]">
                    {paragraphs.map((line, i) => (
                      <p key={`p${i}`}>{line}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 max-w-reading text-base leading-[1.75] text-[var(--color-sepia)]">
                  Perfil em atualização pela equipe LIZ.
                </p>
              )}
            </section>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-label="Informações do perfil">
              <section className="card-linhagem p-6" aria-labelledby="perfil-resumo">
                <h2 id="perfil-resumo" className="label-mono">Resumo</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  {modalityLabel && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-[var(--color-sepia)]">
                        Atendimento
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">{modalityLabel}</dd>
                    </div>
                  )}
                  {location && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-[var(--color-sepia)]">
                        Localização
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">{location}</dd>
                    </div>
                  )}
                  {professional.languages.length > 0 && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-[var(--color-sepia)]">
                        Idiomas
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">
                        {professional.languages.join(", ")}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[var(--color-sepia)]">
                      Vínculo
                    </dt>
                    <dd className="mt-1 font-medium text-[var(--color-ink)]">
                      Profissional indicado pelo Instituto LIZ
                    </dd>
                  </div>
                </dl>
              </section>

              {professional.specialties.length > 0 && (
                <section className="card-linhagem p-6" aria-labelledby="perfil-especialidades">
                  <h2 id="perfil-especialidades" className="label-mono">Especialidades</h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {professional.specialties.map((specialty: string) => (
                      <li key={specialty} className="chip-terracotta">
                        {specialty}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {externalLinks.length > 0 && (
                <section className="card-linhagem p-6" aria-labelledby="perfil-links">
                  <h2 id="perfil-links" className="label-mono">Links</h2>
                  <ul className="mt-4 space-y-2">
                    {externalLinks.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[var(--color-sepia)]/15 bg-[var(--color-parchment)]/60 px-4 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-gold)]/55"
                        >
                          <span className="min-w-0 truncate">{link.label}</span>
                          <ExternalLink className="size-4 shrink-0 text-[var(--color-terracotta)]" aria-hidden="true" />
                          <span className="sr-only">(abre em nova aba)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {contact && (
                <ContactButton contact={contact} name={professional.name} className="hidden w-full md:inline-flex" />
              )}
            </aside>
          </div>
        </div>
      </main>

      {contact && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-gold)]/40 bg-[var(--color-parchment)]/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur md:hidden">
          <ContactButton contact={contact} name={professional.name} className="w-full" />
        </div>
      )}

      {professional.photo_url && (
        <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
          <DialogContent className="max-w-[min(92vw,720px)] bg-[var(--color-ink)] p-3 text-[var(--color-parchment)]">
            <DialogTitle className="sr-only">Foto de {professional.name}</DialogTitle>
            <DialogDescription className="sr-only">Imagem original em tamanho ampliado.</DialogDescription>
            <img
              src={professional.photo_url}
              alt={professional.name}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      )}

      <SiteFooter />
    </div>
  );
}
