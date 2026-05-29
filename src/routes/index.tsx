import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { HowItWorks } from "@/components/HowItWorks";
import { Directory } from "@/components/Directory";
import { About } from "@/components/About";
import { BecomeIndicated } from "@/components/BecomeIndicated";

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
        content:
          "A maior rede mundial de psicogenealogistas indicados pelo Instituto LIZ.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      <main>
        <Hero />
        <Stats />
        <Directory />
        <HowItWorks />
        <section id="instituto">
          <About />
        </section>
        <BecomeIndicated />
      </main>
      <SiteFooter />
    </div>
  );
}
