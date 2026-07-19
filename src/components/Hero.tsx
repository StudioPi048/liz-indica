import { type FormEvent, useEffect, useRef, useState } from "react";
import heroImage from "@/assets/hero-bg2.webp";
import { Play, Search } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/hooks/use-gsap";

export function Hero() {
  const [heroQuery, setHeroQuery] = useState("");
  const rootRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-eyebrow]", { opacity: 0, y: 16, duration: 0.7 })
        .from(
          "[data-hero-title] > *",
          { opacity: 0, y: 40, duration: 1.0, stagger: 0.12 },
          "-=0.4",
        )
        .from("[data-hero-lede]", { opacity: 0, y: 24, duration: 0.8 }, "-=0.6")
        .from("[data-hero-search]", { opacity: 0, y: 20, duration: 0.7 }, "-=0.5")
        .from(
          "[data-hero-chip]",
          { opacity: 0, y: 12, duration: 0.5, stagger: 0.06 },
          "-=0.4",
        )
        .from(
          "[data-hero-cta]",
          { opacity: 0, y: 20, duration: 0.6, stagger: 0.1 },
          "-=0.3",
        );

      // Parallax background
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  const applyDirectorySearch = (term: string) => {
    const query = term.trim();
    const params = new URLSearchParams(window.location.search);
    [
      "modalidade",
      "mode",
      "pais",
      "country",
      "cidade",
      "city",
      "idioma",
      "language",
      "especialidade",
      "specialty",
      "specialties",
    ].forEach((key) => params.delete(key));

    if (query) params.set("q", query);
    else params.delete("q");

    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}#diretorio`,
    );
    window.dispatchEvent(
      new CustomEvent("liz-directory-search", { detail: { query, resetFilters: true } }),
    );
    document.getElementById("diretorio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyDirectorySearch(heroQuery);
  };

  return (
    <section
      ref={rootRef}
      className="relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden bg-black"
    >
      {/* Background Image (Immersive) */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full z-0 will-change-transform">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover object-center scale-110 opacity-90"
        />
        {/* Dark Gradients tailored for text readability preserving original image color */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/30 md:bg-gradient-to-r md:from-black/90 md:via-black/50 md:to-transparent w-full md:w-[70%]" />

        <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30" />
      </div>

      {/* TEXT CONTENT (Left) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-2xl flex flex-col justify-center">
          <span
            data-hero-eyebrow
            className="inline-flex items-center gap-3 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/80 mb-8 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm w-fit"
          >
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            Rede oficial Instituto LIZ
          </span>

          <h1
            data-hero-title
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-[5rem] leading-[1.05] mb-6 md:mb-8 text-balance text-white drop-shadow-lg"
          >
            <span className="block">A Maior Rede de</span>
            <span className="block">
              <em
                className="italic not-italic font-normal hero-shimmer"
                style={{ color: "#F1DFD1" }}
              >
                Psicogenealogistas
              </em>
            </span>
            <span className="block">do Mundo</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed text-pretty font-light max-w-[45ch]">
            Encontre profissionais indicados pelo Instituto LIZ para atendimentos online ou
            presenciais — comprometidos com a ética, o estudo contínuo e a excelência no
            acolhimento.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mb-5 max-w-2xl rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-md"
          >
            <label htmlFor="hero-directory-search" className="sr-only">
              Buscar psicogenealogista por nome, cidade ou país
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" />
                <input
                  id="hero-directory-search"
                  type="search"
                  value={heroQuery}
                  onChange={(event) => setHeroQuery(event.target.value)}
                  placeholder="Busque por nome, cidade ou país"
                  className="h-13 w-full rounded-xl border border-transparent bg-transparent pl-12 pr-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/30 focus:bg-background"
                />
              </div>
              <button
                type="submit"
                className="h-13 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Buscar
              </button>
            </div>
          </form>

          <div className="mb-8 flex flex-wrap gap-2">
            {["Online", "São Paulo", "Portugal"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setHeroQuery(term);
                  applyDirectorySearch(term);
                }}
                className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <a
              href="#diretorio"
              className="flex min-h-12 items-center justify-center px-6 md:px-8 py-3.5 md:py-4 bg-white text-black rounded-full text-sm md:text-base font-medium hover:bg-white/90 transition-all duration-300 shadow-xl"
            >
              Encontrar Profissional
            </a>
            <a
              href="#indicado"
              className="flex min-h-12 items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-black/30 border border-white/30 text-white rounded-full text-sm md:text-base font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
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
