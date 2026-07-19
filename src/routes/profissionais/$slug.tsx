import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Copy,
  ExternalLink,
  Globe2,
  Languages,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
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
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="grid min-h-[70vh] place-items-center px-6 py-24"
      >
        <div className="max-w-lg text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Perfil indisponível
          </span>
          <h1 className="mt-3 font-display text-4xl text-primary-deep">
            Este profissional não foi encontrado
          </h1>
          <p className="mt-4 text-muted-foreground">
            O perfil pode ter sido removido, estar em revisão ou ainda não estar publicado.
          </p>
          <a
            href="/#diretorio"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
          >
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

  if (!professional) return <ProfileNotFound />;

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareProfile = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${professional.name} — LIZ INDICA`,
        text: getProfessionalDescription(professional),
        url: profileUrl,
      });
      return;
    }
    await copyProfileLink();
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground selection:bg-primary/20 md:pb-0">
      <SiteHeader />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <main id="conteudo-principal" tabIndex={-1}>
        <section className="relative overflow-hidden bg-[#15120f] px-6 pb-14 pt-28 text-white sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay"></div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--color-gold)]/75"></div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <a
              href={returnHref}
              className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-medium text-white/85 backdrop-blur-md transition-colors hover:bg-white/15"
            >
              <ArrowLeft className="size-4" />
              Voltar ao diretório
            </a>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:items-end">
              <div className="relative mx-auto w-full max-w-md lg:mx-0">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
                  {professional.photo_url ? (
                    <img
                      {...getResponsivePhotoAttrs(
                        professional.photo_url,
                        "(min-width: 1024px) 420px, 92vw",
                      )}
                      alt={professional.name}
                      className="photo-sepia h-full w-full object-cover"
                      decoding="async"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-white/5 font-display text-8xl text-white">
                      {getInitials(professional.name)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-white/95 p-4 text-primary-deep shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
                    <ShieldCheck className="size-4 text-primary" />
                    Indicado Instituto LIZ
                  </div>
                </div>
              </div>

              <div className="pt-8 lg:pt-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                  <BadgeCheck className="size-3.5" />
                  Perfil público oficial
                </span>

                <h1 className="mt-6 max-w-4xl text-balance font-display text-5xl leading-[0.98] text-white sm:text-6xl lg:text-7xl">
                  {professional.name}
                </h1>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/78">
                  {location && (
                    <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 backdrop-blur-md">
                      <MapPin className="size-4" />
                      {location}
                    </span>
                  )}
                  <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 backdrop-blur-md">
                    <Globe2 className="size-4" />
                    {getModalityLabel(professional)}
                  </span>
                  {professional.languages.length > 0 && (
                    <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 backdrop-blur-md">
                      <Languages className="size-4" />
                      {professional.languages.join(", ")}
                    </span>
                  )}
                </div>

                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/76">
                  {professional.bio ||
                    "Perfil em atualização pela equipe LIZ. As informações públicas serão ampliadas em breve."}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {hasContact && (
                    <a
                      href={contactHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Entrar em contato com ${professional.name}`}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-xl shadow-black/20 transition-colors hover:bg-primary-deep"
                    >
                      <MessageCircle className="size-4" />
                      Entrar em contato
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={shareProfile}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
                  >
                    <Share2 className="size-4" />
                    Compartilhar perfil
                  </button>

                  <button
                    type="button"
                    onClick={copyProfileLink}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
                  >
                    <Copy className="size-4" />
                    {copied ? "Link copiado" : "Copiar link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-8">
              <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <Sparkles className="size-5 text-primary" />
                  <h2 className="font-display text-3xl text-primary-deep">Sobre o atendimento</h2>
                </div>
                {professional.bio ? (
                  <div className="space-y-4 text-[15px] leading-relaxed text-foreground/78">
                    {professional.bio.split("\n").map((paragraph: string, index: number) => (
                      <p key={`${professional.id}-bio-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Este perfil ainda não recebeu uma descrição completa.
                  </p>
                )}
              </section>

              {professional.specialties.length > 0 && (
                <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <UserRoundCheck className="size-5 text-primary" />
                    <h2 className="font-display text-3xl text-primary-deep">Especialidades</h2>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {professional.specialties.map((specialty: string) => (
                      <span
                        key={specialty}
                        className="rounded-xl border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-deep"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <h2 className="font-display text-3xl text-primary-deep">Vínculo com a LIZ</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Rede
                    </span>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      Profissional indicado pelo Instituto LIZ
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Perfil
                    </span>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      Informações públicas mantidas pela plataforma LIZ INDICA
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="font-display text-2xl text-primary-deep">Resumo</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Atendimento
                    </dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {getModalityLabel(professional)}
                    </dd>
                  </div>
                  {location && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Localização
                      </dt>
                      <dd className="mt-1 font-medium text-foreground">{location}</dd>
                    </div>
                  )}
                  {professional.languages.length > 0 && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Idiomas
                      </dt>
                      <dd className="mt-1 font-medium text-foreground">
                        {professional.languages.join(", ")}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-6 border-t border-border/50 pt-5">
                  {hasContact ? (
                    <a
                      href={contactHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Entrar em contato com ${professional.name}`}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                    >
                      <MessageCircle className="size-4" />
                      Entrar em contato
                    </a>
                  ) : (
                    <div className="rounded-xl border border-border/60 bg-muted/50 px-5 py-3 text-center text-sm text-muted-foreground">
                      Contato ainda não informado pela equipe LIZ.
                    </div>
                  )}
                </div>
              </section>

              {externalLinks.length > 0 && (
                <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                  <h2 className="font-display text-2xl text-primary-deep">Links</h2>
                  <div className="mt-4 space-y-2">
                    {externalLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                      >
                        <span className="min-w-0 truncate">{link.label}</span>
                        <ExternalLink className="size-4 shrink-0 text-primary" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </section>
      </main>

      {hasContact && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 p-3 shadow-2xl backdrop-blur-md md:hidden">
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Entrar em contato com ${professional.name}`}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
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
