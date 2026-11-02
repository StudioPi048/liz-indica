import instituteImage from "@/assets/hero-bg2.webp";

export function About() {
  return (
    <section
      aria-labelledby="instituto-titulo"
      className="relative z-10 border-y border-[var(--color-gold)]/45 bg-[var(--color-ink)] px-6 py-20 text-[var(--color-parchment)] md:py-28"
    >
      <div className="mx-auto mb-14 grid max-w-7xl items-center gap-8 border-b border-[var(--color-gold)]/25 pb-12 md:mb-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-12 md:pb-16">
        <p className="font-display text-3xl leading-[1.1] text-balance md:text-5xl">
          A Maior Rede de{" "}
          <em className="font-normal italic text-[var(--color-gold-soft)]">Psicogenealogistas</em> do
          Mundo
        </p>
        <figure className="overflow-hidden rounded-2xl border border-[var(--color-gold)]/30">
          <img
            src={instituteImage}
            alt="Corredor de arquivo com fotografias e cartas de família ligadas por fios dourados"
            width={1920}
            height={1071}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
          <figcaption className="px-4 py-3 text-sm text-[var(--color-parchment)]/75">
            O Instituto LIZ
          </figcaption>
        </figure>
      </div>
      <div className="mx-auto grid max-w-7xl items-start gap-16 md:grid-cols-2">
        <div>
          <h2 id="instituto-titulo" className="mb-8 font-display text-4xl leading-tight md:text-5xl">
            A autoridade por trás de cada indicação
          </h2>
          <p className="max-w-reading text-lg leading-relaxed text-[var(--color-parchment)]/80">
            O Instituto LIZ é referência mundial em formação de psicogenealogistas. Unimos rigor
            acadêmico, metodologia própria e sensibilidade humana para capacitar profissionais em
            mais de oito países.
          </p>
          <div className="mt-10 max-w-reading rounded-2xl border border-[var(--color-gold)]/30 p-6">
            <h3 className="font-display text-xl text-[var(--color-parchment)]">
              O que significa “indicado pelo Instituto LIZ”
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-parchment)]/80">
              Os profissionais deste diretório passaram pela formação do Instituto LIZ e integram
              sua rede de mentorados. Cada perfil traz as informações enviadas pelo próprio
              profissional; modalidade, valores e agenda são combinados diretamente com ele(a).
            </p>
          </div>
        </div>
        <ul className="space-y-6">
          {[
            {
              t: "Padrão Internacional",
              d: "Currículo unificado presente em 8 países, com docentes licenciados.",
            },
            {
              t: "Metodologia Própria",
              d: "Integração entre Psicogenealogia, Cabalá, Neurociência.",
            },
            {
              t: "Comunidade Ativa",
              d: "Supervisão técnica, estudo contínuo e ética para todos os indicados.",
            },
            {
              t: "Vitrine dos Alunos",
              d: "Visibilidade global para profissionais formados pelo Instituto.",
            },
          ].map((item) => (
            <li
              key={item.t}
              className="flex items-start gap-5 border-b border-[var(--color-gold)]/20 pb-6 last:border-0"
            >
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-[var(--color-gold)]/50 text-[11px] text-[var(--color-gold)]">
                ✓
              </span>
              <div>
                <h4 className="mb-1 font-display text-xl text-[var(--color-parchment)]">
                  {item.t}
                </h4>
                <p className="text-sm leading-relaxed text-[var(--color-parchment)]/65">{item.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
