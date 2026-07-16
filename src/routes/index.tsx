import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import heroImage from "@/assets/hero-bg2.webp";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { HowItWorks } from "@/components/HowItWorks";
import { Directory } from "@/components/Directory";
import { About } from "@/components/About";
import { LazyOnVisible } from "@/components/LazyOnVisible";
import { SITE_URL } from "@/lib/professionals-api";

const LazyBecomeIndicated = lazy(() =>
  import("@/components/BecomeIndicated").then((module) => ({
    default: module.BecomeIndicated,
  })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LIZ INDICA — Diretório Oficial de Psicogenealogistas" },
      {
        name: "description",
        content:
          "Encontre psicogenealogistas indicados pelo Instituto LIZ. A maior rede mundial de especialistas em Psicogenealogia, com atendimentos online e presenciais.",
      },
      {
        property: "og:title",
        content: "LIZ INDICA — Diretório Oficial de Psicogenealogistas",
      },
      {
        property: "og:description",
        content: "A maior rede mundial de psicogenealogistas indicados pelo Instituto LIZ.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}/og-liz-indica.svg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "LIZ INDICA — Diretório Oficial de Psicogenealogistas" },
      {
        name: "twitter:description",
        content: "Encontre profissionais indicados pelo Instituto LIZ.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-liz-indica.svg` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "preload", href: heroImage, as: "image" },
    ],
  }),
  component: Index,
});

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "LIZ INDICA",
  url: `${SITE_URL}/`,
  description:
    "Diretório oficial de psicogenealogistas indicados pelo Instituto LIZ para atendimentos online e presenciais.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: {
    "@type": "Thing",
    name: "Psicogenealogia",
  },
};

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      <main id="conteudo-principal" tabIndex={-1}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c") }}
        />
        <Hero />
        <Stats />
        <Directory />
        <HowItWorks />
        <section id="instituto">
          <About />
        </section>
        <LazyOnVisible
          id="indicado"
          label="Carregando formulário de indicação"
          loadOnIdle
          minHeight={860}
          rootMargin="720px 0px"
        >
          <LazyBecomeIndicated sectionId={null} />
        </LazyOnVisible>
      </main>
      <SiteFooter />
    </div>
  );
}
