import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProfessionalCard, CATEGORY_COLORS, CATEGORY_GRADIENTS } from "./ProfessionalCard";
import { fetchProfessionals } from "@/lib/professionals-api";
import { Search, Filter, X } from "lucide-react";

export function Directory() {
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState<"all" | "online" | "in_person">("all");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals"],
    queryFn: () => fetchProfessionals(),
  });

  const allSpecialties = useMemo(() => {
    const specs = new Set<string>();
    professionals.forEach(p => p.specialties.forEach(s => specs.add(s)));
    return Array.from(specs).sort();
  }, [professionals]);

  const toggleSpecialty = (s: string) => {
    const next = new Set(selectedSpecialties);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setSelectedSpecialties(next);
  };

  const clearFilters = () => {
    setQuery("");
    setModality("all");
    setSelectedSpecialties(new Set());
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = professionals.filter((p) => p.published);
    
    return list.filter((p) => {
      // Name/City Match
      const matchesText = !q || 
        p.name.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.country ?? "").toLowerCase().includes(q);

      // Modality Match
      const matchesModality = 
        modality === "all" ? true :
        modality === "online" ? p.online :
        p.in_person;

      // Specialty Match
      const matchesSpecialty = 
        selectedSpecialties.size === 0 ? true :
        p.specialties.some(s => selectedSpecialties.has(s));

      return matchesText && matchesModality && matchesSpecialty;
    });
  }, [query, modality, selectedSpecialties, professionals]);

  return (
    <section id="diretorio" className="py-12 md:py-20 px-6 sm:px-8 lg:px-12 bg-slate-50/50 min-h-screen scroll-mt-20">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-10 md:mb-12 max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Diretório oficial
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-balance text-primary-deep">
            Mentorados do Instituto LIZ
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Todos os profissionais aqui presentes passaram pela formação do
            Instituto LIZ e integram nossa rede de especialistas comprometidos
            com a ética e a excelência.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR FILTERS */}
          <aside className={`lg:w-64 xl:w-72 shrink-0 space-y-8 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
            
            {/* Search */}
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-primary-deep">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nome, cidade ou país…"
                  className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Modality */}
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-primary-deep">Modalidade</label>
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                <button 
                  onClick={() => setModality("all")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${modality === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setModality("online")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${modality === "online" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Online
                </button>
                <button 
                  onClick={() => setModality("in_person")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${modality === "in_person" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Presencial
                </button>
              </div>
            </div>

            {/* Specialties */}
            {allSpecialties.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-primary-deep">Especialidades</label>
                <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {allSpecialties.map(s => {
                    const isSelected = selectedSpecialties.has(s);
                    return (
                      <label key={s} className="flex items-start gap-2.5 cursor-pointer group p-1 -ml-1 rounded hover:bg-muted/50 transition-colors">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input 
                            type="checkbox" 
                            className="peer sr-only"
                            checked={isSelected}
                            onChange={() => toggleSpecialty(s)}
                          />
                          <div className="size-4 rounded border border-border bg-card peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
                          <svg className={`absolute size-3 text-primary-foreground pointer-events-none transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className={`text-sm select-none ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                          {s}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display text-primary-deep">
                  {isLoading ? "Buscando…" : `${filtered.length} mentorado${filtered.length !== 1 ? 's' : ''}`}
                </h3>
                
                <div className="flex items-center gap-3">
                  {(query || modality !== "all" || selectedSpecialties.size > 0) && (
                    <button 
                      onClick={clearFilters}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <X className="size-3" /> Limpar Filtros
                    </button>
                  )}
                  <button 
                    onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                    className="lg:hidden flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-muted rounded-lg border border-border/50"
                  >
                    <Filter className="size-4" /> Filtros
                  </button>
                </div>
              </div>

              {/* Color Legend */}
              <div className="bg-card/50 p-3 rounded-xl border border-border/50 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 px-1">Cores de Atuação (Banners):</p>
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(CATEGORY_GRADIENTS).map(([name, gradient]) => (
                    <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 border border-border/30">
                      <div className={`size-3 rounded-full bg-gradient-to-r ${gradient} shadow-sm border border-black/5`}></div>
                      <span className="text-[11px] font-medium text-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[360px] bg-card rounded-2xl border border-border animate-pulse"></div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 bg-card/50 rounded-2xl border border-border/50">
                <p className="text-muted-foreground mb-4">Nenhum mentorado encontrado com os filtros atuais.</p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
                {filtered.map((p) => (
                  <ProfessionalCard key={p.id} pro={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
