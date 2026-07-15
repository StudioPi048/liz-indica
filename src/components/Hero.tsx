import heroImage from "@/assets/hero-bg.jpg";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] lg:min-h-screen flex items-center pt-20 pb-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={heroImage}
          alt="Conexão e Ancestralidade - Instituto LIZ"
          className="w-full h-full object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite]"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-noise mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center">
        <div className="max-w-3xl animate-reveal">
          <span className="inline-flex items-center gap-3 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary mb-8 bg-card/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-primary/20 shadow-sm">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Rede oficial Instituto LIZ
          </span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-8 text-balance text-foreground drop-shadow-sm">
            A Maior Rede de{" "}
            <em className="italic text-primary not-italic font-normal relative inline-block">
              <span className="italic relative z-10">Psicogenealogistas</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -z-10 -rotate-1 rounded-sm blur-[1px]"></span>
            </em>{" "}
            do Mundo
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-[50ch] mb-12 leading-relaxed text-pretty font-light">
            Encontre profissionais indicados pelo Instituto LIZ para
            atendimentos online ou presenciais — comprometidos com a ética, o
            estudo contínuo e a excelência no acolhimento.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <a
              href="#diretorio"
              className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary-deep transition-all duration-300 shadow-xl overflow-hidden"
            >
              <span className="relative z-10">Encontrar Profissional</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </a>
            <a
              href="#indicado"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-primary/30 text-primary-deep rounded-full font-medium hover:bg-primary/5 transition-all duration-300 backdrop-blur-sm"
            >
              <Play className="size-4 fill-primary/80" />
              Conhecer a Formação
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
