import { useScrollReveal } from "@/hooks/use-gsap";

const steps = [
  {
    n: "01",
    title: "Escolha um profissional",
    text: "Use a busca e os filtros para encontrar especialistas alinhados às suas necessidades.",
  },
  {
    n: "02",
    title: "Conheça sua trajetória",
    text: "Analise formações, especialidades, idiomas e a certificação pelo Instituto LIZ.",
  },
  {
    n: "03",
    title: "Entre em contato direto",
    text: "Inicie sua jornada via WhatsApp, redes sociais ou agendamento online.",
  },
];

export function HowItWorks() {
  const gridRef = useScrollReveal<HTMLDivElement>({
    selector: "[data-step-card]",
    y: 48,
    stagger: 0.15,
  });

  return (
    <section className="relative z-10 border-t border-[var(--color-gold)]/45 bg-[var(--color-parchment)] px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 max-w-2xl">
          <span className="label-mono">Como funciona</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-balance text-[var(--color-ink)]">
            Três passos até seu psicogenealogista
          </h2>
        </header>
        <div ref={gridRef} className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div
              key={s.n}
              data-step-card
              className="card-linhagem p-8"
            >
              <div className="label-mono mb-6 text-[var(--color-terracotta)]">{s.n}</div>
              <h3 className="font-display text-2xl mb-3 text-[var(--color-ink)]">{s.title}</h3>
              <p className="text-[var(--color-sepia)] leading-relaxed text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

