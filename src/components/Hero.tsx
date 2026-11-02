import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Monitor, Search } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/hooks/use-gsap";
import {
  dedupeForDirectory,
  fetchProfessionals,
  getProfessionalLocation,
  getProfessionalLocationParts,
  getProfessionalProfilePath,
  getResponsivePhotoAttrs,
} from "@/lib/professionals-api";

type Mode = "all" | "online" | "in_person";

export type DirectorySearchDetail = {
  query?: string;
  modality?: Mode;
  country?: string;
  city?: string;
  resetFilters?: boolean;
};

/** Sends criteria to the directory, updates the URL and scrolls to the results. */
export function goToDirectory(detail: DirectorySearchDetail) {
  const params = new URLSearchParams(window.location.search);
  ["q", "modalidade", "mode", "pais", "country", "cidade", "city", "idioma", "language", "especialidade", "specialty", "specialties"].forEach(
    (key) => params.delete(key),
  );
  if (detail.query?.trim()) params.set("q", detail.query.trim());
  if (detail.modality === "online") params.set("modalidade", "online");
  if (detail.modality === "in_person") params.set("modalidade", "presencial");
  if (detail.country) params.set("pais", detail.country);
  if (detail.city) params.set("cidade", detail.city);
  const search = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}#diretorio`);
  window.dispatchEvent(
    new CustomEvent("liz-directory-search", { detail: { ...detail, resetFilters: true } }),
  );
  document
    .getElementById("diretorio")
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  window.setTimeout(() => document.getElementById("directory-results")?.focus({ preventScroll: true }), 400);
}

function uniqueSorted(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((v) => v?.trim()).filter((v): v is string => Boolean(v)))).sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
}

export function Hero() {
  const [query, setQuery] = useState("");
  const [presencialOpen, setPresencialOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const rootRef = useRef<HTMLElement | null>(null);

  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals", "public"],
    queryFn: () => fetchProfessionals(),
    staleTime: 1000 * 60 * 5,
  });
  const listed = useMemo(() => dedupeForDirectory(professionals), [professionals]);

  // First 3 profiles with a photo, in the existing directory order (no ranking).
  const portraits = useMemo(() => listed.filter((p) => p.photo_url).slice(0, 3), [listed]);

  const inPerson = useMemo(() => listed.filter((p) => p.in_person), [listed]);
  const countries = useMemo(
    () => uniqueSorted(inPerson.map((p) => getProfessionalLocationParts(p)?.country)),
    [inPerson],
  );
  const cities = useMemo(
    () =>
      uniqueSorted(
        inPerson
          .filter((p) => !country || getProfessionalLocationParts(p)?.country === country)
          .map((p) => getProfessionalLocationParts(p)?.city),
      ),
    [inPerson, country],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-in]", { opacity: 0, y: 18, duration: 0.7, ease: "power2.out", stagger: 0.08 });
      gsap.from("[data-hero-portrait]", { opacity: 0, y: 28, duration: 0.9, ease: "power2.out", stagger: 0.12, delay: 0.15 });
    }, el);
    return () => ctx.revert();
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToDirectory({ query });
  };

  const choiceBase =
    "group flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracotta)]";
  const selectClass =
    "h-12 w-full rounded-xl border border-[var(--color-sepia)]/25 bg-[var(--color-parchment)] px-3 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)] focus:ring-2 focus:ring-[var(--color-terracotta)]/20";

  return (
    <section
      ref={rootRef}
      aria-labelledby="acolhida-titulo"
      className="relative z-10 overflow-hidden bg-[var(--color-parchment)] px-5 pb-12 pt-8 sm:px-8 md:pb-20 md:pt-14 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
        {/* Região 1 — acolhida e escolha */}
        <div className="flex min-w-0 flex-col justify-center">
          <h1
            id="acolhida-titulo"
            data-hero-in
            className="font-display text-[2.1rem] leading-[1.08] text-[var(--color-ink)] text-balance sm:text-5xl lg:text-[3.6rem]"
          >
            Encontre um profissional para o seu{" "}
            <em className="font-normal italic text-[var(--color-terracotta)]">próximo passo.</em>
          </h1>
          {/* No mobile o parágrafo integral desce para o fim da acolhida (order-last). */}
          <p data-hero-in className="order-last mt-6 max-w-[48ch] text-base leading-relaxed text-[var(--color-sepia)] lg:order-none lg:mt-4 lg:text-lg">
            Encontre profissionais indicados pelo Instituto LIZ para atendimentos online ou
            presenciais — comprometidos com a ética, o estudo contínuo e a excelência no
            acolhimento.
          </p>

          {/* Mobile: presença fotográfica já na abertura */}
          {portraits[0] && (
            <a
              data-hero-in
              href={getProfessionalProfilePath(portraits[0])}
              className="mt-5 flex items-end gap-4 lg:hidden"
            >
              <img
                {...getResponsivePhotoAttrs(portraits[0].photo_url, "180px")}
                alt={`Foto de ${portraits[0].name}`}
                className="block h-[220px] w-auto max-w-[58vw] rounded-2xl border border-[var(--color-sepia)]/15 object-contain"
                fetchPriority="high"
                decoding="async"
              />
              <span className="min-w-0 pb-1">
                <span className="block text-xs text-[var(--color-sepia)]">Uma das pessoas da rede</span>
                <span className="mt-1 block font-display text-lg leading-snug text-[var(--color-ink)]">
                  {portraits[0].name}
                </span>
                {getProfessionalLocation(portraits[0]) && (
                  <span className="mt-0.5 block text-xs text-[var(--color-sepia)]">
                    {getProfessionalLocation(portraits[0])}
                  </span>
                )}
              </span>
            </a>
          )}

          <p data-hero-in className="mt-5 font-display text-lg text-[var(--color-ink)] lg:mt-6">
            Como você prefere ser atendido(a)?
          </p>
          <div data-hero-in className="mt-3 grid gap-3 sm:grid-cols-2" role="group" aria-label="Escolha a modalidade">
            <button
              type="button"
              onClick={() => {
                setPresencialOpen(false);
                goToDirectory({ modality: "online" });
              }}
              className={`${choiceBase} border-[var(--color-sepia)]/20 bg-card hover:border-[var(--color-terracotta)]/60`}
            >
              <Monitor className="mt-1 size-5 shrink-0 text-[var(--color-terracotta)]" aria-hidden="true" />
              <span>
                <span className="block font-display text-xl text-[var(--color-ink)]">Online</span>
                <span className="mt-1 block text-sm leading-relaxed text-[var(--color-sepia)]">
                  Por vídeo, de onde você estiver. Mostra quem atende online.
                </span>
              </span>
            </button>
            <button
              type="button"
              aria-expanded={presencialOpen}
              aria-controls="presencial-etapa"
              onClick={() => setPresencialOpen((v) => !v)}
              className={`${choiceBase} ${
                presencialOpen
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)]"
                  : "border-[var(--color-sepia)]/20 bg-card hover:border-[var(--color-terracotta)]/60"
              }`}
            >
              <MapPin
                className={`mt-1 size-5 shrink-0 ${presencialOpen ? "text-[var(--color-gold)]" : "text-[var(--color-terracotta)]"}`}
                aria-hidden="true"
              />
              <span>
                <span className={`block font-display text-xl ${presencialOpen ? "" : "text-[var(--color-ink)]"}`}>
                  Presencial
                </span>
                <span
                  className={`mt-1 block text-sm leading-relaxed ${presencialOpen ? "text-[var(--color-parchment)]/85" : "text-[var(--color-sepia)]"}`}
                >
                  Em consultório. Escolha país e cidade, se quiser.
                </span>
              </span>
            </button>
          </div>

          {presencialOpen && (
            <div
              id="presencial-etapa"
              className="mt-3 rounded-2xl border border-[var(--color-ink)]/15 bg-card p-4 sm:p-5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="hero-pais" className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
                    País <span className="font-normal text-[var(--color-sepia)]">(opcional)</span>
                  </label>
                  <select
                    id="hero-pais"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setCity("");
                    }}
                    className={selectClass}
                  >
                    <option value="">Qualquer país</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="hero-cidade" className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
                    Cidade <span className="font-normal text-[var(--color-sepia)]">(opcional)</span>
                  </label>
                  <select id="hero-cidade" value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
                    <option value="">Qualquer cidade</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => goToDirectory({ modality: "in_person", country, city })}
                  className="btn-primary min-h-12"
                >
                  Ver profissionais
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCountry("");
                    setCity("");
                    goToDirectory({ modality: "in_person" });
                  }}
                  className="min-h-12 rounded-full px-4 text-sm font-semibold text-[var(--color-terracotta)] underline-offset-4 hover:underline"
                >
                  Explorar sem escolher local
                </button>
              </div>
            </div>
          )}

          <form data-hero-in onSubmit={handleSearch} role="search" className="mt-6">
            <label htmlFor="hero-directory-search" className="mb-1.5 block text-sm text-[var(--color-sepia)]">
              Já sabe quem procura? Busque pelo nome ou local.
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-sepia)]" aria-hidden="true" />
                <input
                  id="hero-directory-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nome, cidade ou país"
                  className="h-12 w-full rounded-full border border-[var(--color-sepia)]/25 bg-card pl-10 pr-4 text-base text-[var(--color-ink)] outline-none placeholder:text-[var(--color-sepia-soft)] focus:border-[var(--color-terracotta)] focus:ring-2 focus:ring-[var(--color-terracotta)]/20"
                />
              </div>
              <button type="submit" className="btn-primary min-h-12">
                Buscar
              </button>
            </div>
          </form>

          <div data-hero-in className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setPresencialOpen(false);
                goToDirectory({});
              }}
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[var(--color-ink)] underline decoration-[var(--color-gold)] decoration-2 underline-offset-4"
            >
              Explorar todos os profissionais
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <a
              href="#indicado"
              className="inline-flex min-h-11 items-center text-[var(--color-sepia)] underline-offset-4 hover:underline"
            >
              Conhecer a Formação
            </a>
          </div>
        </div>

        {/* Região 2 — pessoas reais da rede, ordem existente do diretório */}
        {portraits.length > 0 && (
          <div aria-labelledby="acolhida-pessoas" className="min-w-0 lg:pt-4">
            <h2 id="acolhida-pessoas" className="label-mono mb-4">
              Algumas pessoas da rede
            </h2>
            <ul className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-[1.5fr_1fr] lg:grid-rows-2 lg:gap-4 lg:overflow-visible">
              {portraits.map((p, i) => (
                <li
                  key={p.id}
                  data-hero-portrait
                  className={`w-[68vw] max-w-[280px] shrink-0 snap-start lg:w-auto lg:max-w-none ${
                    i === 0 ? "lg:row-span-2" : ""
                  }`}
                >
                  <a
                    href={getProfessionalProfilePath(p)}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-sepia)]/15 bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracotta)]"
                  >
                    <div
                      className={`flex items-center justify-center bg-[var(--color-ink)] ${
                        i === 0 ? "h-[260px] lg:h-auto lg:min-h-[420px] lg:flex-1" : "h-[260px] lg:h-[230px]"
                      }`}
                    >
                      <img
                        {...getResponsivePhotoAttrs(p.photo_url, "(min-width: 1024px) 320px, 62vw")}
                        alt={`Foto de ${p.name}`}
                        className="h-full w-full object-contain"
                        decoding="async"
                        fetchPriority={i === 0 ? "high" : "auto"}
                      />
                    </div>
                    <div className="px-4 py-3">
                      <span className="block font-display text-lg leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-terracotta)]">
                        {p.name}
                      </span>
                      {getProfessionalLocation(p) && (
                        <span className="mt-0.5 block text-xs text-[var(--color-sepia)]">
                          {getProfessionalLocation(p)}
                        </span>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
