import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProfessionalCard } from "./ProfessionalCard";
import { fetchProfessionals, type Professional } from "@/lib/professionals-api";
import { Search, SlidersHorizontal, X } from "lucide-react";
import rootsBg from "@/assets/roots-soft.webp";
import { gsap, prefersReducedMotion } from "@/hooks/use-gsap";

type Modality = "all" | "online" | "in_person";

type DirectoryFilters = {
  query: string;
  modality: Modality;
  country: string;
  city: string;
  language: string;
  specialties: string[];
};

type WritableDirectoryFilters = Omit<DirectoryFilters, "specialties"> & {
  specialties: Set<string>;
};

type DirectorySearchEvent = CustomEvent<{ query?: string; resetFilters?: boolean }>;

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_COUNT = 12;

const emptyFilters: DirectoryFilters = {
  query: "",
  modality: "all",
  country: "",
  city: "",
  language: "",
  specialties: [],
};

function normalize(str: string | null | undefined) {
  return str
    ? str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    : "";
}

function parseModality(value: string | null): Modality {
  if (value === "online") return "online";
  if (value === "presencial" || value === "in_person") return "in_person";
  return "all";
}

function getInitialDirectoryFilters(): DirectoryFilters {
  if (typeof window === "undefined") return emptyFilters;

  const params = new URLSearchParams(window.location.search);
  const specialtyParams = [
    ...params.getAll("especialidade"),
    ...params.getAll("specialty"),
    ...(params.get("specialties")?.split(",") ?? []),
  ];

  return {
    query: params.get("q") ?? "",
    modality: parseModality(params.get("modalidade") ?? params.get("mode")),
    country: params.get("pais") ?? params.get("country") ?? "",
    city: params.get("cidade") ?? params.get("city") ?? "",
    language: params.get("idioma") ?? params.get("language") ?? "",
    specialties: specialtyParams.map((item) => item.trim()).filter(Boolean),
  };
}

function writeDirectoryUrl(filters: WritableDirectoryFilters) {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  [
    "q",
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

  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.modality === "online") params.set("modalidade", "online");
  if (filters.modality === "in_person") params.set("modalidade", "presencial");
  if (filters.country) params.set("pais", filters.country);
  if (filters.city) params.set("cidade", filters.city);
  if (filters.language) params.set("idioma", filters.language);

  Array.from(filters.specialties)
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .forEach((specialty) => params.append("especialidade", specialty));

  const search = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${search ? `?${search}` : ""}#diretorio`,
  );
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function hasCityInCountry(professionals: Professional[], nextCountry: string, currentCity: string) {
  if (!nextCountry || !currentCity) return true;
  return professionals.some((professional) => {
    return professional.country === nextCountry && professional.city === currentCity;
  });
}

export function Directory() {
  const [query, setQuery] = useState(() => getInitialDirectoryFilters().query);
  const [modality, setModality] = useState<Modality>(() => getInitialDirectoryFilters().modality);
  const [country, setCountry] = useState(() => getInitialDirectoryFilters().country);
  const [city, setCity] = useState(() => getInitialDirectoryFilters().city);
  const [language, setLanguage] = useState(() => getInitialDirectoryFilters().language);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(
    () => new Set(getInitialDirectoryFilters().specialties),
  );

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals", "public"],
    queryFn: () => fetchProfessionals(),
    staleTime: 1000 * 60 * 5,
  });

  const persistFilters = (overrides: Partial<WritableDirectoryFilters>) => {
    writeDirectoryUrl({
      query,
      modality,
      country,
      city,
      language,
      specialties: selectedSpecialties,
      ...overrides,
    });
  };

  useEffect(() => {
    const applyFilters = (next: DirectoryFilters) => {
      setQuery(next.query);
      setModality(next.modality);
      setCountry(next.country);
      setCity(next.city);
      setLanguage(next.language);
      setSelectedSpecialties(new Set(next.specialties));
    };

    const syncQuery = (event: Event) => {
      const customEvent = event as DirectorySearchEvent;
      if (customEvent.detail?.resetFilters) {
        applyFilters({
          ...emptyFilters,
          query: customEvent.detail.query ?? "",
        });
        return;
      }

      applyFilters({
        ...getInitialDirectoryFilters(),
        query: customEvent.detail?.query ?? getInitialDirectoryFilters().query,
      });
    };

    window.addEventListener("liz-directory-search", syncQuery);
    window.addEventListener("popstate", syncQuery);
    return () => {
      window.removeEventListener("liz-directory-search", syncQuery);
      window.removeEventListener("popstate", syncQuery);
    };
  }, []);

  const uniqueProfessionals = useMemo(() => {
    const list: Professional[] = [];
    const seen = new Set<string>();

    for (const professional of professionals) {
      const key = `${normalize(professional.name)}-${professional.photo_url || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(professional);
      }
    }

    return list;
  }, [professionals]);

  const allCountries = useMemo(() => {
    return uniqueSorted(uniqueProfessionals.map((professional) => professional.country));
  }, [uniqueProfessionals]);

  const allCities = useMemo(() => {
    return uniqueSorted(
      uniqueProfessionals
        .filter((professional) => !country || professional.country === country)
        .map((professional) => professional.city),
    );
  }, [country, uniqueProfessionals]);

  const allLanguages = useMemo(() => {
    return uniqueSorted(
      uniqueProfessionals.flatMap((professional) => professional.languages ?? []),
    );
  }, [uniqueProfessionals]);

  const allSpecialties = useMemo(() => {
    return uniqueSorted(
      uniqueProfessionals.flatMap((professional) => professional.specialties ?? []),
    );
  }, [uniqueProfessionals]);

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    persistFilters({ query: nextQuery });
  };

  const handleModalityChange = (nextModality: Modality) => {
    setModality(nextModality);
    persistFilters({ modality: nextModality });
  };

  const handleCountryChange = (nextCountry: string) => {
    const nextCity = hasCityInCountry(uniqueProfessionals, nextCountry, city) ? city : "";
    setCountry(nextCountry);
    setCity(nextCity);
    persistFilters({ country: nextCountry, city: nextCity });
  };

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    persistFilters({ city: nextCity });
  };

  const handleLanguageChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    persistFilters({ language: nextLanguage });
  };

  const toggleSpecialty = (specialty: string) => {
    const next = new Set(selectedSpecialties);
    if (next.has(specialty)) next.delete(specialty);
    else next.add(specialty);
    setSelectedSpecialties(next);
    persistFilters({ specialties: next });
  };

  const clearFilters = () => {
    setQuery("");
    setModality("all");
    setCountry("");
    setCity("");
    setLanguage("");
    setSelectedSpecialties(new Set());
    writeDirectoryUrl({ ...emptyFilters, specialties: new Set() });
  };

  const removeSpecialty = (specialty: string) => {
    const next = new Set(selectedSpecialties);
    next.delete(specialty);
    setSelectedSpecialties(next);
    persistFilters({ specialties: next });
  };

  const filtered = useMemo(() => {
    const q = normalize(query.trim());

    return uniqueProfessionals.filter((professional) => {
      const searchableText = [
        professional.name,
        professional.city,
        professional.country,
        professional.bio,
        ...(professional.specialties ?? []),
        ...(professional.languages ?? []),
      ]
        .map(normalize)
        .join(" ");

      const matchesText = !q || searchableText.includes(q);
      const matchesModality =
        modality === "all"
          ? true
          : modality === "online"
            ? professional.online
            : professional.in_person;
      const matchesCountry = !country || professional.country === country;
      const matchesCity = !city || professional.city === city;
      const matchesLanguage = !language || (professional.languages ?? []).includes(language);
      const matchesSpecialty =
        selectedSpecialties.size === 0
          ? true
          : (professional.specialties ?? []).some((specialty) =>
              selectedSpecialties.has(specialty),
            );

      return (
        matchesText &&
        matchesModality &&
        matchesCountry &&
        matchesCity &&
        matchesLanguage &&
        matchesSpecialty
      );
    });
  }, [city, country, language, modality, query, selectedSpecialties, uniqueProfessionals]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [city, country, language, modality, query, selectedSpecialties]);

  const visibleProfessionals = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const remainingProfessionals = Math.max(filtered.length - visibleProfessionals.length, 0);

  const activeFilters = [
    query
      ? {
          key: "query",
          label: `Busca: ${query}`,
          onRemove: () => handleQueryChange(""),
        }
      : null,
    modality !== "all"
      ? {
          key: "modality",
          label: modality === "online" ? "Online" : "Presencial",
          onRemove: () => handleModalityChange("all"),
        }
      : null,
    country
      ? {
          key: "country",
          label: country,
          onRemove: () => handleCountryChange(""),
        }
      : null,
    city
      ? {
          key: "city",
          label: city,
          onRemove: () => handleCityChange(""),
        }
      : null,
    language
      ? {
          key: "language",
          label: language,
          onRemove: () => handleLanguageChange(""),
        }
      : null,
    ...Array.from(selectedSpecialties).map((specialty) => ({
      key: `specialty-${specialty}`,
      label: specialty,
      onRemove: () => removeSpecialty(specialty),
    })),
  ].filter((filter): filter is { key: string; label: string; onRemove: () => void } =>
    Boolean(filter),
  );

  return (
    <section
      id="diretorio"
      className="relative py-12 md:py-20 px-6 sm:px-8 lg:px-12 bg-background/50 min-h-screen scroll-mt-20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none z-0"></div>
      <img
        src={rootsBg}
        alt=""
        className="absolute top-0 right-[-10%] w-[800px] opacity-[0.15] mix-blend-multiply pointer-events-none rotate-[15deg] z-0"
        aria-hidden="true"
      />
      <img
        src={rootsBg}
        alt=""
        className="absolute bottom-[-10%] left-[-15%] w-[900px] opacity-[0.10] mix-blend-multiply pointer-events-none -rotate-[45deg] z-0"
        aria-hidden="true"
      />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <header className="mb-8 md:mb-12 max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Diretório oficial
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-balance text-primary-deep">
            Mentorados do Instituto LIZ
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Todos os profissionais aqui presentes passaram pela formação do Instituto LIZ e integram
            nossa rede de especialistas comprometidos com a ética e a excelência.
          </p>
        </header>

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="mb-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary-deep shadow-sm transition-colors hover:bg-muted lg:hidden"
          aria-expanded={filtersOpen}
          aria-controls="directory-filters"
        >
          <SlidersHorizontal className="size-4" />
          Filtros
          {activeFilters.length > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">
              {activeFilters.length}
            </span>
          )}
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            id="directory-filters"
            className={`${filtersOpen ? "block" : "hidden"} lg:block lg:w-64 xl:w-72 shrink-0 space-y-7 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
          >
            <div className="space-y-3">
              <label
                htmlFor="directory-search"
                className="text-sm font-semibold uppercase tracking-wider text-primary-deep"
              >
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="directory-search"
                  type="search"
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  placeholder="Nome, cidade, idioma…"
                  className="w-full h-12 pl-10 pr-4 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary-deep">
                Modalidade
              </span>
              <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
                {[
                  ["all", "Todos"],
                  ["online", "Online"],
                  ["in_person", "Presencial"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleModalityChange(value as Modality)}
                    aria-pressed={modality === value}
                    className={`min-h-11 rounded-lg px-2 text-xs font-medium transition-colors ${
                      modality === value
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {allCountries.length > 0 && (
              <div className="space-y-3">
                <label
                  htmlFor="directory-country"
                  className="text-sm font-semibold uppercase tracking-wider text-primary-deep"
                >
                  País
                </label>
                <select
                  id="directory-country"
                  value={country}
                  onChange={(event) => handleCountryChange(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Todos os países</option>
                  {allCountries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {allCities.length > 0 && (
              <div className="space-y-3">
                <label
                  htmlFor="directory-city"
                  className="text-sm font-semibold uppercase tracking-wider text-primary-deep"
                >
                  Cidade
                </label>
                <select
                  id="directory-city"
                  value={city}
                  onChange={(event) => handleCityChange(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Todas as cidades</option>
                  {allCities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {allLanguages.length > 0 && (
              <div className="space-y-3">
                <label
                  htmlFor="directory-language"
                  className="text-sm font-semibold uppercase tracking-wider text-primary-deep"
                >
                  Idioma
                </label>
                <select
                  id="directory-language"
                  value={language}
                  onChange={(event) => handleLanguageChange(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Todos os idiomas</option>
                  {allLanguages.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {allSpecialties.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary-deep">
                  Especialidades
                </span>
                <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {allSpecialties.map((specialty) => {
                    const isSelected = selectedSpecialties.has(specialty);
                    return (
                      <label
                        key={specialty}
                        className="flex min-h-11 items-start gap-2.5 cursor-pointer group p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={isSelected}
                            onChange={() => toggleSpecialty(specialty)}
                          />
                          <div className="size-4 rounded border border-border bg-card peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
                          <svg
                            className={`absolute size-3 text-primary-foreground pointer-events-none transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm select-none ${isSelected ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                        >
                          {specialty}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-border/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-display text-primary-deep">
                  {isLoading
                    ? "Buscando…"
                    : `${filtered.length} mentorado${filtered.length !== 1 ? "s" : ""}`}
                </h3>

                {activeFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-11 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 self-start sm:self-auto"
                  >
                    <X className="size-3" /> Limpar filtros
                  </button>
                )}
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={filter.onRemove}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-deep transition-colors hover:bg-primary/15"
                    >
                      {filter.label}
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoading ? (
              <div
                className="grid gap-6"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))" }}
              >
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-[360px] bg-card rounded-2xl border border-border animate-pulse"
                  ></div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 bg-card/50 rounded-2xl border border-border/50">
                <p className="text-muted-foreground mb-4">
                  Nenhum mentorado encontrado com os filtros atuais.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-11 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <>
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
                  }}
                >
                  {visibleProfessionals.map((professional) => (
                    <ProfessionalCard key={professional.id} pro={professional} />
                  ))}
                </div>

                {remainingProfessionals > 0 && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
                      className="min-h-12 rounded-full border border-border bg-card px-6 text-sm font-semibold text-primary-deep shadow-sm transition-colors hover:bg-muted"
                    >
                      Mostrar mais {Math.min(LOAD_MORE_COUNT, remainingProfessionals)} mentorados
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
