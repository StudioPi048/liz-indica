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
    <section className="py-24 px-6 bg-primary-soft">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Como funciona
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-balance">
            Três passos até seu psicogenealogista
          </h2>
        </header>
        <div ref={gridRef} className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div
              key={s.n}
              data-step-card
              className="bg-card border border-border rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
            >
              <div className="font-mono text-xs text-primary mb-6">{s.n}</div>
              <h3 className="font-display text-2xl mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

