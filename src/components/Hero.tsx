import heroImage from "@/assets/hero-bg2.jpg";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none z-0"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* TEXT CONTENT (Left) */}
        <div className="lg:col-span-5 animate-reveal order-2 lg:order-1 flex flex-col justify-center">
          <span className="inline-flex items-center gap-3 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary mb-8">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Rede oficial Instituto LIZ
          </span>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-8 text-balance text-primary-deep">
            A Maior Rede de{" "}
            <em className="italic text-primary not-italic font-normal">
              Psicogenealogistas
            </em>{" "}
            do Mundo
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed text-pretty font-light">
            Encontre profissionais indicados pelo Instituto LIZ para
            atendimentos online ou presenciais — comprometidos com a ética, o
            estudo contínuo e a excelência no acolhimento.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <a
              href="#diretorio"
              className="flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary-deep transition-all duration-300 shadow-md"
            >
              Encontrar Profissional
            </a>
            <a
              href="#indicado"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-primary/30 text-primary-deep rounded-full font-medium hover:bg-primary/10 transition-all duration-300"
            >
              <Play className="size-4 fill-primary/80" />
              Conhecer a Formação
            </a>
          </div>
        </div>

        {/* IMAGE (Right) */}
        <div className="lg:col-span-7 relative animate-reveal [animation-delay:200ms] order-1 lg:order-2">
           <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-card">
              <img
                src={heroImage}
                alt="Conexão e Ancestralidade"
                className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay"></div>
              <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.15)] pointer-events-none"></div>
           </div>
        </div>
        
      </div>
    </section>
  );
}
