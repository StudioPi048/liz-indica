import heroImage from "@/assets/hero-tree.jpg";

export function Hero() {
  return (
    <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="animate-reveal">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-6">
            <span className="size-1.5 rounded-full bg-primary" />
            Rede oficial Instituto LIZ
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 text-balance">
            A Maior Rede de{" "}
            <em className="italic text-primary not-italic font-normal">
              <span className="italic">Psicogenealogistas</span>
            </em>{" "}
            do Mundo
          </h1>
          <p className="text-lg text-muted-foreground max-w-[55ch] mb-10 leading-relaxed text-pretty">
            Encontre profissionais indicados pelo Instituto LIZ para
            atendimentos online ou presenciais — comprometidos com a ética, o
            estudo contínuo e a excelência no acolhimento.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#diretorio"
              className="px-7 py-3.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary-deep transition-all shadow-[var(--shadow-glow)]"
            >
              Encontrar Profissional
            </a>
            <a
              href="#indicado"
              className="px-7 py-3.5 border border-border bg-card rounded-full font-medium hover:bg-muted transition-all"
            >
              Quero Ser Indicado
            </a>
          </div>
        </div>
        <div className="relative animate-reveal [animation-delay:200ms]">
          <img
            src={heroImage}
            alt="Conexão e Ancestralidade - Instituto LIZ"
            width={1600}
            height={900}
            className="w-full aspect-[4/3] object-cover rounded-[2rem] shadow-[var(--shadow-card)] ring-2 ring-primary/20"
          />
          <div className="absolute -bottom-6 -left-6 md:-left-10 bg-card p-6 rounded-2xl shadow-xl max-w-[16rem] border border-border/50">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">
              Processo Oficial
            </div>
            <p className="text-sm leading-relaxed">
              Todos os indicados passam por validação ética e técnica do
              Instituto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
