import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Share2,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import {
  SITE_URL,
  type Professional,
  fetchProfessionalBySlug,
  getContactHref,
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

/**
 * Split a bio into paragraph blocks.
 * We ONLY assign chapter titles when the bio has 3+ substantial paragraphs
 * (structure is clearly present). Otherwise we return a single block —
 * never fabricating structure or content.
 */
function splitBioIntoChapters(bio: string | null): Array<{ title: string | null; text: string }> {
  if (!bio) return [];
  const raw = bio
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const paragraphs = raw.length >= 2
    ? raw
    : bio
        .split(/\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 40);

  const substantial = paragraphs.filter((p) => p.length > 40);
  if (substantial.length >= 3) {
    const titles = ["Trajetória", "Formação", "Como atende"];
    // Collapse paragraphs beyond the 3rd into the last chapter — never spawn "Continuação" blocks.
    const first = substantial.slice(0, 2);
    const rest = substantial.slice(2).join("\n\n");
    return [
      { title: titles[0], text: first[0] },
      { title: titles[1], text: first[1] },
      { title: titles[2], text: rest },
    ];
  }

  return [{ title: null, text: bio.trim() }];

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

function ProfessionalProfilePage() {
  const professional = Route.useLoaderData();
  const [returnHref, setReturnHref] = useState(getReturnFallback);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("liz-directory-return");
    if (stored) setReturnHref(stored);
  }, []);

  const contactHref = professional ? getContactHref(professional.contact_url) : "";
  const hasContact = Boolean(contactHref);
  const profileUrl = professional ? `${SITE_URL}${getProfessionalProfilePath(professional)}` : "";
  const location = professional ? getProfessionalLocation(professional) : "";
  const externalLinks = professional ? parseExternalLinks(professional.social_media) : [];
  const jsonLd = useMemo(
    () => (professional ? getJsonLd(professional, profileUrl) : null),
    [professional, profileUrl],
  );

  const chapters = useMemo(
    () => (professional ? splitBioIntoChapters(professional.bio) : []),
    [professional],
  );

  if (!professional) return <ProfileNotFound />;

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

  // Lead: first sentence of bio (never modified). Rest goes into chapters below.
  const lead = professional.bio
    ? (professional.bio.match(/^[^.!?\n]+[.!?]?/)?.[0] ?? "").trim()
    : "";

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pb-24 text-[var(--color-sepia)] selection:bg-[var(--color-gold)]/30 md:pb-0">
      <SiteHeader />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <main id="conteudo-principal" tabIndex={-1}>
        {/* CABEÇALHO — dossiê em fundo ink */}
        <section className="relative overflow-hidden bg-[var(--color-ink)] px-6 pb-20 pt-28 text-[var(--color-parchment)] sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" aria-hidden="true" />

          <div className="relative z-10 mx-auto max-w-6xl">
            <a
              href={returnHref}
              className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--color-parchment)]/75 transition-colors hover:text-[var(--color-gold)]"
            >
              <ArrowLeft className="size-4" />
              Voltar ao diretório
            </a>

            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)] lg:items-center">
              {/* Retrato em ARCO com selo de cera */}
              <div className="relative mx-auto w-full max-w-[320px] lg:mx-0">
                <div className="arch-frame aspect-[3/4]">
                  {professional.photo_url ? (
                    <img
                      {...getResponsivePhotoAttrs(
                        professional.photo_url,
                        "(min-width: 1024px) 320px, 80vw",
                      )}
                      alt={professional.name}
                      className="photo-sepia h-full w-full object-cover"
                      decoding="async"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center font-display text-7xl text-[var(--color-parchment)]">
                      {getInitials(professional.name)}
                    </div>
                  )}
                </div>

                <div
                  className="wax-seal -bottom-6 -right-3 sm:-right-6"
                  aria-label="Selo — Indicado pelo Instituto LIZ"
                >
                  <span>
                    Indicado(a)
                    <br />
                    Instituto
                    <br />
                    LIZ
                  </span>
                </div>
              </div>

              {/* Ficha à direita */}
              <div>
                <span className="label-mono text-[var(--color-gold-soft)]">
                  Dossiê · Diretório Oficial
                </span>

                <h1 className="mt-4 font-display text-5xl leading-[1.02] text-[var(--color-parchment)] sm:text-6xl lg:text-[4.25rem]">
                  {professional.name}
                </h1>

                {(modalityLabel || location) && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {modalityLabel && (
                      <span className="chip !border-white/20 !bg-white/10 !text-[var(--color-parchment)]/85">
                        {modalityLabel}
                      </span>
                    )}
                    {location && (
                      <span className="chip !border-white/20 !bg-white/10 !text-[var(--color-parchment)]/85">
                        {location}
                      </span>
                    )}
                    {professional.languages.slice(0, 2).map((lang: string) => (
                      <span
                        key={lang}
                        className="chip !border-white/20 !bg-white/10 !text-[var(--color-parchment)]/85"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                )}

                {lead && (
                  <p className="mt-8 max-w-reading font-display text-2xl leading-snug text-[var(--color-parchment)]/95 sm:text-[1.65rem]">
                    {lead}
                  </p>
                )}

                <div className="mt-10 flex flex-wrap gap-3">
                  {hasContact && (
                    <a
                      href={contactHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      aria-label={`Entrar em contato com ${professional.name}`}
                    >
                      <MessageCircle className="size-4" />
                      Entrar em contato
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={shareProfile}
                    className="btn-ghost-gold !text-[var(--color-parchment)] hover:!bg-white/10"
                  >
                    <Share2 className="size-4" />
                    {copied ? "Link copiado" : "Compartilhar perfil"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hairline absolute inset-x-0 bottom-0" aria-hidden="true" />
        </section>

        {/* CORPO — parchment em duas colunas */}
        <section className="px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Coluna principal — capítulos com fio dourado */}
            <div>
              {chapters.length > 0 ? (
                <div className="space-y-10">
                  {chapters.map((chapter, index) => (
                    <article
                      key={`${professional.id}-chapter-${index}`}
                      className={chapter.title ? "chapter-thread" : ""}
                    >
                      {chapter.title && (
                        <>
                          <span className="chapter-knot" aria-hidden="true" />
                          <span className="label-mono block">Capítulo {index + 1}</span>
                          <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)] md:text-4xl">
                            {chapter.title}
                          </h2>
                        </>
                      )}
                      <div
                        className={`${chapter.title ? "mt-5" : ""} max-w-reading space-y-4 text-[15px] leading-[1.75] text-[var(--color-sepia)]`}
                      >
                        {chapter.text.split(/\n/).map((line, i) =>
                          line.trim() ? (
                            <p key={`c${index}-p${i}`}>{line.trim()}</p>
                          ) : null,
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="max-w-reading text-[15px] leading-[1.75] text-[var(--color-sepia)]">
                  Perfil em atualização pela equipe LIZ.
                </p>
              )}
            </div>

            {/* Sidebar — cards */}
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <section className="card-linhagem p-6">
                <span className="label-mono">Resumo</span>
                <dl className="mt-4 space-y-4 text-sm">
                  {modalityLabel && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-[var(--color-sepia-soft)]">
                        Atendimento
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">
                        {modalityLabel}
                      </dd>
                    </div>
                  )}
                  {location && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-[var(--color-sepia-soft)]">
                        Localização
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">{location}</dd>
                    </div>
                  )}
                  {professional.languages.length > 0 && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-[var(--color-sepia-soft)]">
                        Idiomas
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">
                        {professional.languages.join(", ")}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[var(--color-sepia-soft)]">
                      Vínculo
                    </dt>
                    <dd className="mt-1 font-medium text-[var(--color-ink)]">
                      Profissional indicado pelo Instituto LIZ
                    </dd>
                  </div>
                </dl>
              </section>

              {professional.specialties.length > 0 && (
                <section className="card-linhagem p-6">
                  <span className="label-mono">Especialidades</span>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {professional.specialties.map((specialty: string) => (
                      <span key={specialty} className="chip-terracotta">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {externalLinks.length > 0 && (
                <section className="card-linhagem p-6">
                  <span className="label-mono">Links</span>
                  <div className="mt-4 space-y-2">
                    {externalLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[var(--color-sepia)]/15 bg-[var(--color-parchment)]/60 px-4 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-gold)]/55"
                      >
                        <span className="min-w-0 truncate">{link.label}</span>
                        <ExternalLink className="size-4 shrink-0 text-[var(--color-terracotta)]" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {hasContact && (
                <a
                  href={contactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Entrar em contato com ${professional.name}`}
                  className="btn-primary w-full"
                >
                  <MessageCircle className="size-4" />
                  Entrar em contato
                </a>
              )}
            </aside>
          </div>
        </section>
      </main>

      {hasContact && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-gold)]/40 bg-[var(--color-parchment)]/95 p-3 shadow-2xl backdrop-blur md:hidden">
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Entrar em contato com ${professional.name}`}
            className="btn-primary w-full"
          >
            <MessageCircle className="size-4" />
            Entrar em contato
          </a>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
