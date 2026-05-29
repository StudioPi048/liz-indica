import { useMemo, useState } from "react";
import { ProfessionalCard } from "./ProfessionalCard";
import {
  allLanguages,
  allSpecialties,
  professionals,
} from "@/data/professionals";

export function Directory() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [online, setOnline] = useState(false);
  const [inPerson, setInPerson] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return professionals.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.city} ${p.country}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (specialty !== "all" && !p.specialties.includes(specialty)) return false;
      if (language !== "all" && !p.languages.includes(language)) return false;
      if (online && !p.online) return false;
      if (inPerson && !p.inPerson) return false;
      return true;
    });
  }, [query, specialty, language, online, inPerson]);

  return (
    <section id="diretorio" className="py-24 px-6 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Diretório oficial
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-balance">
            Encontre seu psicogenealogista
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Todos os profissionais aqui presentes passaram pela formação do
            Instituto LIZ e integram nossa rede de especialistas comprometidos
            com a ética e a excelência.
          </p>
        </header>

        <div className="bg-card rounded-2xl border border-border p-4 md:p-5 mb-10 shadow-[var(--shadow-soft)]">
          <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, cidade ou país…"
              className="h-12 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all text-sm"
            />
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="h-12 px-4 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-ring text-sm min-w-44"
              aria-label="Especialidade"
            >
              <option value="all">Todas especialidades</option>
              {allSpecialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-12 px-4 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-ring text-sm min-w-36"
              aria-label="Idioma"
            >
              <option value="all">Todos idiomas</option>
              {allLanguages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={online}
                onChange={(e) => setOnline(e.target.checked)}
                className="size-4 accent-primary"
              />
              Atendimento online
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={inPerson}
                onChange={(e) => setInPerson(e.target.checked)}
                className="size-4 accent-primary"
              />
              Atendimento presencial
            </label>
            <span className="ml-auto text-xs text-muted-foreground self-center">
              {filtered.length} profissionais encontrados
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum profissional encontrado com esses filtros.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProfessionalCard key={p.id} pro={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
