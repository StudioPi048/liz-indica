import { type FormEvent, useEffect, useRef, useState } from "react";
import heroImage from "@/assets/hero-bg2.webp";
import { Play, Search } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/hooks/use-gsap";

export function Hero() {
  const [heroQuery, setHeroQuery] = useState("");
  const [heroModality, setHeroModality] = useState<"all" | "online" | "in_person">("all");
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Entrance timeline — sober, single ease/duration scale.
      const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.7 } });
      tl.from("[data-hero-eyebrow]", { opacity: 0, y: 12 })
        .from(
          "[data-hero-title] > *",
          { opacity: 0, y: 24, duration: 0.8, stagger: 0.08 },
          "-=0.3",
        )
        .from("[data-hero-lede]", { opacity: 0, y: 16 }, "-=0.5")
        .from("[data-hero-search]", { opacity: 0, y: 12 }, "-=0.4")
        .from("[data-hero-chip]", { opacity: 0, y: 8, duration: 0.4, stagger: 0.05 }, "-=0.4")
        .from("[data-hero-cta]", { opacity: 0, y: 12, stagger: 0.08 }, "-=0.3");
    }, el);

    return () => ctx.revert();
  }, []);

  const applyDirectorySearch = (term: string, mode: "all" | "online" | "in_person" = heroModality) => {
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
    if (mode === "online") params.set("modalidade", "online");
    if (mode === "in_person") params.set("modalidade", "presencial");

    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}#diretorio`,
    );
    window.dispatchEvent(
      new CustomEvent("liz-directory-search", { detail: { query, modality: mode, resetFilters: true } }),
    );
    const target = document.getElementById("diretorio");
    target?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("directory-search")?.focus({ preventScroll: true }), 50);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyDirectorySearch(heroQuery);
  };

  return (
    <section
      ref={rootRef}
      className="relative z-10 md:min-h-[90vh] flex items-center pt-24 pb-12 md:pb-20 overflow-hidden bg-[var(--color-ink)] border-b border-[var(--color-gold)]/70"
    >
      {/* Background Image (Immersive) — parallax removed for calmer feel */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover object-center opacity-90"
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
            className="inline-flex items-center gap-3 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/80 mb-5 md:mb-8 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm w-fit"
          >
            <span className="size-1.5 rounded-full bg-white motion-safe:animate-pulse" />
            Rede oficial Instituto LIZ
          </span>

          <h1
            data-hero-title
            className="font-display text-[2.1rem] sm:text-5xl md:text-7xl lg:text-[5rem] leading-[1.05] mb-4 md:mb-8 text-balance text-white drop-shadow-lg"
          >
            <span className="block">A Maior Rede de</span>
            <span className="block">
              <em className="italic font-normal" style={{ color: "var(--color-gold-soft)" }}>
                Psicogenealogistas
              </em>
            </span>
            <span className="block">do Mundo</span>
          </h1>

          <p
            data-hero-lede
            className="order-last md:order-none text-base md:text-xl text-white/80 mt-6 md:mt-0 mb-0 md:mb-10 leading-relaxed text-pretty font-light max-w-[45ch]"
          >
            Encontre profissionais indicados pelo Instituto LIZ para atendimentos online ou
            presenciais — comprometidos com a ética, o estudo contínuo e a excelência no
            acolhimento.
          </p>

          <form
            data-hero-search
            onSubmit={handleSubmit}
            className="mb-5 max-w-2xl rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-md"
          >
            <p className="px-2 pb-2 pt-1 font-display text-lg text-[var(--color-ink)]" id="hero-search-title">
              Encontre um(a) psicogenealogista
            </p>
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
                className="h-13 min-h-12 rounded-xl bg-[var(--color-ink)] text-[var(--color-parchment)] px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Buscar
              </button>
            </div>
            <div
              role="group"
              aria-label="Modalidade de atendimento"
              className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-muted/70 p-1"
            >
              {(
                [
                  ["all", "Todos"],
                  ["online", "Online"],
                  ["in_person", "Presencial"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={heroModality === value}
                  onClick={() => setHeroModality(value)}
                  className={`min-h-11 rounded-lg text-sm font-medium transition-colors ${
                    heroModality === value
                      ? "bg-[var(--color-ink)] text-[var(--color-parchment)]"
                      : "text-foreground/75 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </form>

          <div className="mb-6 md:mb-8 flex flex-wrap gap-2">
            {["Online", "São Paulo", "Portugal"].map((term) => (
              <button
                key={term}
                data-hero-chip
                type="button"
                onClick={() => {
                  setHeroQuery(term);
                  applyDirectorySearch(term, "all");
                }}
                className="rounded-full border border-white/20 bg-white/10 min-h-11 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <a
              data-hero-cta
              href="#diretorio"
              className="flex min-h-12 items-center justify-center px-6 md:px-8 py-3.5 md:py-4 bg-white text-black rounded-full text-sm md:text-base font-medium hover:bg-white/90 transition-all duration-300 shadow-xl"
            >
              Encontrar Profissional
            </a>
            <a
              data-hero-cta
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
