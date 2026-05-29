const stats = [
  { value: "500+", label: "Psicogenealogistas" },
  { value: "120", label: "Cidades atendidas" },
  { value: "8", label: "Países" },
  { value: "20k", label: "Horas de formação" },
  { value: "3k", label: "Alunos formados" },
];

export function Stats() {
  return (
    <section className="bg-card border-y border-border py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-1">
              {s.value}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
