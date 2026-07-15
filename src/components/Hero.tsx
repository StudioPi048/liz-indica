import heroImage from "@/assets/hero-bg2.jpg";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden bg-black">
      {/* Background Image (Immersive) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={heroImage}
          alt="Conexão e Ancestralidade - Instituto LIZ"
          className="w-full h-full object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite] opacity-90"
        />
        {/* Dark Gradients tailored for text readability preserving original image color */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent w-full md:w-[70%]" />
        
        <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30" />
      </div>
      
      {/* TEXT CONTENT (Left) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-2xl animate-reveal flex flex-col justify-center">
          <span className="inline-flex items-center gap-3 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/80 mb-8 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm w-fit">
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            Rede oficial Instituto LIZ
          </span>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5rem] leading-[1.05] mb-8 text-balance text-white drop-shadow-lg">
            A Maior Rede de{" "}
            <em className="italic text-primary-light not-italic font-normal" style={{ color: "#F1DFD1" }}>
              Psicogenealogistas
            </em>{" "}
            do Mundo
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed text-pretty font-light max-w-[45ch]">
            Encontre profissionais indicados pelo Instituto LIZ para
            atendimentos online ou presenciais — comprometidos com a ética, o
            estudo contínuo e a excelência no acolhimento.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <a
              href="#diretorio"
              className="flex items-center justify-center px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all duration-300 shadow-xl"
            >
              Encontrar Profissional
            </a>
            <a
              href="#indicado"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-black/30 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              <Play className="size-4 fill-white" />
              Conhecer a Formação
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
