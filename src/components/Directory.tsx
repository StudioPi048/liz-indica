import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProfessionalCard } from "./ProfessionalCard";
import {
  dedupeForDirectory,
  fetchProfessionals,
  getProfessionalLocation,
  getProfessionalLocationParts,
  type Professional,
} from "@/lib/professionals-api";
import { Heart, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useFavorites } from "@/hooks/use-favorites";
import { useIsMobile } from "@/hooks/use-mobile";
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

type DirectorySearchEvent = CustomEvent<{
  query?: string;
  modality?: Modality;
  country?: string;
  city?: string;
  resetFilters?: boolean;
}>;

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 6;

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
    const location = getProfessionalLocationParts(professional);
    return location?.country === nextCountry && location.city === currentCity;
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

  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const favorites = useFavorites();
  const isMobile = useIsMobile();

  const {
    data: professionals = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
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
          modality: customEvent.detail.modality ?? "all",
          country: customEvent.detail.country ?? "",
          city: customEvent.detail.city ?? "",
        });
        setOnlyFavorites(false);
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

  const uniqueProfessionals = useMemo(() => dedupeForDirectory(professionals), [professionals]);

  const allCountries = useMemo(() => {
    return uniqueSorted(
      uniqueProfessionals.map((professional) => getProfessionalLocationParts(professional)?.country),
    );
  }, [uniqueProfessionals]);

  const allCities = useMemo(() => {
    return uniqueSorted(
      uniqueProfessionals
        .filter((professional) => {
          const location = getProfessionalLocationParts(professional);
          return !country || location?.country === country;
        })
        .map((professional) => getProfessionalLocationParts(professional)?.city),
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
    setOnlyFavorites(false);
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
      const location = getProfessionalLocationParts(professional);
      const locationLabel = getProfessionalLocation(professional);
      const searchableText = [
        professional.name,
        professional.city,
        professional.country,
        locationLabel,
        location?.city,
        location?.state,
        location?.country,
        ...(location?.searchTerms ?? []),
        professional.bio,
        professional.contact_url,
        professional.social_media,
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
      const matchesCountry = !country || location?.country === country;
      const matchesCity = !city || location?.city === city;
      const matchesLanguage = !language || (professional.languages ?? []).includes(language);
      const matchesSpecialty =
        selectedSpecialties.size === 0
          ? true
          : (professional.specialties ?? []).some((specialty) =>
              selectedSpecialties.has(specialty),
            );

      const matchesFavorite = !onlyFavorites || favorites.ids.includes(professional.id);

      return (
        matchesFavorite &&
        matchesText &&
        matchesModality &&
        matchesCountry &&
        matchesCity &&
        matchesLanguage &&
        matchesSpecialty
      );
    });
  }, [
    city,
    country,
    language,
    modality,
    query,
    selectedSpecialties,
    uniqueProfessionals,
    onlyFavorites,
    favorites.ids,
  ]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [city, country, language, modality, query, selectedSpecialties, onlyFavorites]);

  const visibleProfessionals = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const remainingProfessionals = Math.max(filtered.length - visibleProfessionals.length, 0);

  const gridRef = useRef<HTMLUListElement | null>(null);
  const prevVisibleCountRef = useRef(0);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (prefersReducedMotion()) {
      prevVisibleCountRef.current = visibleProfessionals.length;
      return;
    }

    const cards = grid.querySelectorAll<HTMLElement>("[data-pro-card]");
    if (!cards.length) return;

    const prevCount = prevVisibleCountRef.current;
    // Animate new (or all) cards
    const targets = prevCount === 0 ? Array.from(cards) : Array.from(cards).slice(prevCount);

    if (targets.length) {
      gsap.from(targets, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: prevCount === 0
          ? { trigger: grid, start: "top 85%" }
          : undefined,
      });
    }

    prevVisibleCountRef.current = visibleProfessionals.length;
  }, [visibleProfessionals]);


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

  const secondaryCount =
    (country ? 1 : 0) + (city ? 1 : 0) + (language ? 1 : 0) + selectedSpecialties.size;
  const hasAnyFilter = activeFilters.length > 0 || onlyFavorites;
  const countLabel = `${filtered.length} profissiona${filtered.length !== 1 ? "is" : "l"}`;

  const labelClass = "text-sm font-semibold uppercase tracking-wider text-primary-deep";
  const selectClass =
    "h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

  const renderSecondaryFilters = (prefix: string) => (
    <div className="space-y-7">
      {allCountries.length > 0 && (
        <div className="space-y-3">
          <label htmlFor={`${prefix}-country`} className={labelClass}>
            País
          </label>
          <select
            id={`${prefix}-country`}
            value={country}
            onChange={(event) => handleCountryChange(event.target.value)}
            className={selectClass}
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
          <label htmlFor={`${prefix}-city`} className={labelClass}>
            Cidade
          </label>
          <select
            id={`${prefix}-city`}
            value={city}
            onChange={(event) => handleCityChange(event.target.value)}
            className={selectClass}
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
          <label htmlFor={`${prefix}-language`} className={labelClass}>
            Idioma
          </label>
          <select
            id={`${prefix}-language`}
            value={language}
            onChange={(event) => handleLanguageChange(event.target.value)}
            className={selectClass}
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
        <fieldset className="space-y-3">
          <legend className={labelClass}>Especialidades</legend>
          <p id={`${prefix}-spec-help`} className="text-xs leading-relaxed text-muted-foreground">
            Termos informados por cada profissional. Um perfil pode aparecer em mais de uma
            especialidade; marque várias para ampliar a busca.
          </p>
          <div
            className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
            aria-describedby={`${prefix}-spec-help`}
          >
            {allSpecialties.map((specialty) => {
              const isSelected = selectedSpecialties.has(specialty);
              return (
                <label
                  key={specialty}
                  className="flex min-h-11 items-center gap-3 cursor-pointer rounded-lg p-2 -ml-2 hover:bg-muted/50 transition-colors focus-within:bg-muted/60"
                >
                  <input
                    type="checkbox"
                    className="size-5 shrink-0 accent-[var(--color-terracotta)]"
                    checked={isSelected}
                    onChange={() => toggleSpecialty(specialty)}
                  />
                  <span
                    className={`text-sm select-none ${isSelected ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {specialty}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );

  return (
    <section
      id="diretorio"
      aria-labelledby="diretorio-titulo"
      className="relative z-10 border-t border-[var(--color-gold)]/45 py-12 md:py-20 px-4 sm:px-8 lg:px-12 bg-[var(--color-parchment)] scroll-mt-20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-6 md:mb-10 max-w-3xl">
          <span className="label-mono text-[var(--color-terracotta)]">
            Diretório oficial · Mentorados do Instituto LIZ
          </span>
          <h2
            id="diretorio-titulo"
            className="font-display text-3xl md:text-5xl mt-3 mb-4 text-balance text-[var(--color-ink)]"
          >
            Conheça as pessoas da rede
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Todos os profissionais aqui presentes passaram pela formação do Instituto LIZ e integram
            nossa rede de especialistas comprometidos com a ética e a excelência.
          </p>
        </header>

        {/* Primary controls — always visible on every viewport */}
        <div
          role="search"
          aria-label="Buscar no diretório"
          className="mb-6 grid gap-3 rounded-2xl border border-border/70 bg-card/90 p-3 shadow-sm md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:p-4"
        >
          <div>
            <label htmlFor="directory-search" className="sr-only">
              Buscar por nome, cidade, país ou especialidade
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="directory-search"
                type="search"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="Nome, cidade, país ou especialidade"
                className="w-full h-12 pl-10 pr-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-base shadow-sm"
              />
            </div>
          </div>

          <div role="group" aria-label="Modalidade de atendimento">
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/50 p-1">
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
                  className={`min-h-11 rounded-lg px-3 text-sm font-medium transition-colors ${
                    modality === value
                      ? "bg-[var(--color-ink)] text-[var(--color-parchment)] shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-haspopup="dialog"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary-deep "
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Mais filtros
              {secondaryCount > 0 && (
                <span className="rounded-full bg-[var(--color-ink)] px-2 py-0.5 text-[11px] text-[var(--color-parchment)]">
                  {secondaryCount}
                  <span className="sr-only"> ativos</span>
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setOnlyFavorites((v) => !v)}
              aria-pressed={onlyFavorites}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold lg:flex-none ${
                onlyFavorites
                  ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)] text-[var(--color-parchment)]"
                  : "border-border bg-background text-primary-deep"
              }`}
            >
              <Heart className={`size-4 ${onlyFavorites ? "fill-current" : ""}`} aria-hidden="true" />
              Favoritos ({favorites.ids.length})
            </button>
          </div>
        </div>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side={isMobile ? "bottom" : "right"} className={`flex flex-col p-0 ${isMobile ? "max-h-[88dvh]" : "w-full sm:max-w-md"}`}>
            <SheetHeader className="border-b border-border px-5 py-4 text-left">
              <SheetTitle>Mais filtros</SheetTitle>
              <SheetDescription>
                País, cidade, idioma e especialidades. Os resultados atualizam na hora.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-5 py-5">{renderSecondaryFilters("m-directory")}</div>
            <SheetFooter className="flex-row gap-2 border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-12 flex-1 rounded-xl border border-border text-sm font-semibold text-primary-deep"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="btn-primary min-h-12 flex-[2]"
              >
                Ver {countLabel}
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <div>
          <div className="min-w-0">
            <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p
                  id="directory-results"
                  tabIndex={-1}
                  aria-live="polite"
                  aria-atomic="true"
                  className="text-lg font-display text-primary-deep"
                >
                  {isLoading
                    ? "Buscando profissionais…"
                    : isError
                      ? "Não foi possível carregar o diretório"
                      : filtered.length === 0
                        ? "Nenhum profissional encontrado"
                        : `${countLabel} encontrado${filtered.length !== 1 ? "s" : ""}`}
                </p>

                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-11 rounded-lg px-2 text-sm text-primary-deep underline-offset-4 hover:underline flex items-center gap-1"
                  >
                    <X className="size-4" aria-hidden="true" /> Limpar filtros
                  </button>
                )}
              </div>

              {(activeFilters.length > 0 || onlyFavorites) && (
                <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos">
                  {onlyFavorites && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setOnlyFavorites(false)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary-deep"
                        aria-label="Remover filtro: somente favoritos"
                      >
                        Somente favoritos
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </li>
                  )}
                  {activeFilters.map((filter) => (
                    <li key={filter.key}>
                      <button
                        type="button"
                        onClick={filter.onRemove}
                        aria-label={`Remover filtro: ${filter.label}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary-deep transition-colors hover:bg-primary/15"
                      >
                        {filter.label}
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isLoading ? (
              <div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                aria-hidden="true"
              >
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-[440px] bg-card rounded-2xl border border-border motion-safe:animate-pulse"
                  ></div>
                ))}
              </div>
            ) : isError ? (
              <div role="alert" className="text-center py-16 bg-card/60 rounded-2xl border border-border/50 px-6">
                <p className="text-muted-foreground mb-4">
                  Houve uma falha de conexão. Seus filtros foram mantidos.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="btn-primary"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {isFetching ? "Tentando…" : "Tentar novamente"}
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-card/50 rounded-2xl border border-border/50 px-6">
                <p className="text-muted-foreground mb-4">
                  {onlyFavorites && favorites.ids.length === 0
                    ? "Você ainda não salvou favoritos neste dispositivo. Use o coração em um perfil para salvá-lo."
                    : "Nenhum mentorado encontrado com os filtros atuais."}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <>
                <ul
                  ref={gridRef}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  aria-label="Profissionais"
                >
                  {visibleProfessionals.map((professional) => (
                    <li key={professional.id} data-pro-card>
                      <ProfessionalCard
                        pro={professional}
                        isFavorite={favorites.has(professional.id)}
                        onToggleFavorite={favorites.toggle}
                      />
                    </li>
                  ))}
                </ul>

                {remainingProfessionals > 0 && (
                  <div className="mt-10 flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {visibleProfessionals.length} de {filtered.length}
                    </p>
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
