import { useMemo, useState } from "react";
import { ProfessionalCard } from "./ProfessionalCard";
import { professionals } from "@/data/professionals";

export function Directory() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return professionals;
    return professionals.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <section id="diretorio" className="py-24 px-6 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Diretório oficial
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-balance">
            Mentorados do Instituto LIZ
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Todos os profissionais aqui presentes passaram pela formação do
            Instituto LIZ e integram nossa rede de especialistas comprometidos
            com a ética e a excelência.
          </p>
        </header>

        <div className="bg-card rounded-2xl border border-border p-4 md:p-5 mb-10 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome…"
              className="flex-1 h-12 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all text-sm"
            />
            <span className="text-xs text-muted-foreground md:ml-auto">
              {filtered.length} mentorados encontrados
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum mentorado encontrado.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProfessionalCard key={p.id} pro={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
