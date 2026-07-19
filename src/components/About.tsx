export function About() {
  return (
    <section className="relative z-10 border-y border-[var(--color-gold)]/45 bg-[var(--color-ink)] px-6 py-32 text-[var(--color-parchment)]">
      <div className="mx-auto grid max-w-7xl items-start gap-16 md:grid-cols-2">
        <div>
          <span className="label-mono text-[var(--color-gold-soft)]">O Instituto LIZ</span>
          <h2 className="mt-3 mb-8 font-display text-4xl leading-tight md:text-5xl">
            A autoridade por trás de cada indicação
          </h2>
          <p className="max-w-reading text-lg leading-relaxed text-[var(--color-parchment)]/80">
            O Instituto LIZ é referência mundial em formação de psicogenealogistas. Unimos rigor
            acadêmico, metodologia própria e sensibilidade humana para capacitar profissionais em
            mais de oito países.
          </p>
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
