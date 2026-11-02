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

const tips = [
  {
    q: "Online ou presencial?",
    a: "Cada perfil mostra a modalidade informada pelo próprio profissional. No online o encontro é por vídeo; no presencial, veja a cidade e o país no perfil.",
  },
  {
    q: "O que olhar na formação?",
    a: "Todos os perfis do diretório são de profissionais formados pelo Instituto LIZ. Na biografia, cada um conta a própria trajetória e outras formações.",
  },
  {
    q: "Como entrar em contato?",
    a: "O perfil mostra o canal que o profissional cadastrou (WhatsApp, e-mail, Instagram ou site). Valores, agenda e formato são combinados diretamente com ele(a).",
  },
];

/** Compact orientation strip before the full directory. */
export function HowItWorks() {
  return (
    <section
      aria-labelledby="como-funciona-titulo"
      className="relative z-10 border-y border-[var(--color-gold)]/45 bg-[var(--color-ink)] px-5 py-12 text-[var(--color-parchment)] sm:px-8 md:py-16 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 id="como-funciona-titulo" className="font-display text-3xl text-balance md:text-4xl">
            Três passos até seu psicogenealogista
          </h2>
          <p className="mt-2 text-sm text-[var(--color-gold-soft)]">Como funciona o diretório</p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="border-t border-[var(--color-gold)]/40 pt-4">
                <span className="font-mono text-xs text-[var(--color-gold)]">{s.n}</span>
                <h3 className="mt-2 font-display text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-parchment)]/80">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-[var(--color-gold)]/30 p-5 md:p-6">
          <h2 className="font-display text-2xl">Como escolher?</h2>
          <p className="mt-1 text-sm text-[var(--color-parchment)]/75">
            Três perguntas simples para orientar sua escolha.
          </p>
          <div className="mt-4 divide-y divide-[var(--color-gold)]/20">
            {tips.map((t) => (
              <details key={t.q} className="group py-1">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-medium focus-visible:outline-2 focus-visible:outline-[var(--color-gold)] [&::-webkit-details-marker]:hidden">
                  {t.q}
                  <span aria-hidden="true" className="text-[var(--color-gold)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-3 text-sm leading-relaxed text-[var(--color-parchment)]/80">{t.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
