export function About() {
  return (
    <section className="py-32 px-6 bg-foreground text-background">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary-soft/70">
            O Instituto LIZ
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-8 leading-tight">
            A autoridade por trás de cada indicação
          </h2>
          <p className="text-lg text-background/70 leading-relaxed">
            O Instituto LIZ é referência mundial em formação de
            psicogenealogistas. Unimos rigor acadêmico, metodologia própria e
            sensibilidade humana para capacitar profissionais em mais de oito
            países.
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
              d: "Integração entre Psicogenealogia, Cabalá, Neurociência e Constelação.",
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
              className="flex gap-5 items-start border-b border-background/10 pb-6 last:border-0"
            >
              <span className="size-7 rounded-full bg-primary/20 text-primary-soft flex items-center justify-center text-xs shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <h4 className="font-semibold mb-1">{item.t}</h4>
                <p className="text-sm text-background/60 leading-relaxed">
                  {item.d}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
