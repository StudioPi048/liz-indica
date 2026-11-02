import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/hooks/use-gsap";
import {
  getProfessionalLocation,
  getProfessionalProfilePath,
  getResponsivePhotoAttrs,
  type Professional,
} from "@/lib/professionals-api";
import { initials, isAutoplayActive, prefetchIndices, visibleWindow, wrapIndex } from "@/lib/carousel";

const STEP_MS = 5500;
const DESKTOP_COUNT = 3;

/**
 * Rotating carousel with every listed person (same set as the directory).
 * Equal timing per step; start point chosen after mount so SSR markup stays stable.
 */
export function HeroCarousel({ people, className = "" }: { people: Professional[]; className?: string }) {
  const size = people.length;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [announce, setAnnounce] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLUListElement | null>(null);
  const startedRef = useRef(false);
  const touchX = useRef<number | null>(null);

  // Variable start per visit, once, client-only.
  useEffect(() => {
    if (startedRef.current || size === 0) return;
    startedRef.current = true;
    setIndex(Math.floor(Math.random() * size));
    if (prefersReducedMotion()) setUserPaused(true);
  }, [size]);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const el = rootRef.current;
    const io = el ? new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting)) : null;
    if (el && io) io.observe(el);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, []);

  const active = isAutoplayActive({ userPaused, hover, focusWithin, offscreen, tabHidden, size, count: DESKTOP_COUNT });

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => setIndex((i) => wrapIndex(i + 1, size)), STEP_MS);
    return () => window.clearTimeout(t);
  }, [active, index, size]);

  // Discreet transition on every step.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion() || !startedRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(track, { opacity: 0.35 }, { opacity: 1, duration: 0.5, ease: "power1.out" });
    }, track);
    return () => ctx.revert();
  }, [index]);

  // Warm only the next entering photo.
  useEffect(() => {
    for (const i of prefetchIndices(index, size, DESKTOP_COUNT)) {
      const url = people[i]?.photo_url;
      if (!url) continue;
      const img = new Image();
      const attrs = getResponsivePhotoAttrs(url, "(min-width: 1024px) 200px, 200px");
      if (attrs.srcSet) img.srcset = attrs.srcSet;
      img.sizes = attrs.sizes ?? "";
      img.src = url;
    }
  }, [index, size, people]);

  if (size === 0) return null;

  const go = (delta: number) => {
    const next = wrapIndex(index + delta, size);
    setIndex(next);
    setAnnounce(`${people[next].name}, ${next + 1} de ${size}`);
  };

  const shown = visibleWindow(index, size, DESKTOP_COUNT);
  const btn =
    "grid size-11 place-items-center rounded-full border border-[var(--color-sepia)]/25 bg-card text-[var(--color-ink)] hover:border-[var(--color-terracotta)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracotta)]";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Conheça nossa rede"
      className={`min-w-0 ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        const end = e.changedTouches[0]?.clientX;
        if (start == null || end == null || Math.abs(end - start) < 40) return;
        go(end < start ? 1 : -1);
      }}
    >
      <p className="mb-3 hidden text-sm text-[var(--color-sepia)] lg:block">Conheça nossa rede</p>
      <div className="flex gap-4 lg:block">
        <ul ref={trackRef} className="flex shrink-0 gap-4 lg:grid lg:grid-cols-3">
          {shown.map((i, slot) => {
            const p = people[i];
            const location = getProfessionalLocation(p);
            return (
              <li
                key={`${slot}-${p.id}`}
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${size}`}
                className={slot === 0 ? "" : "hidden lg:block"}
              >
                <a
                  href={getProfessionalProfilePath(p)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-sepia)]/15 bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracotta)]"
                >
                  <div className="flex h-[220px] items-center justify-center lg:h-[240px]">
                    {p.photo_url ? (
                      <img
                        key={p.id}
                        {...getResponsivePhotoAttrs(p.photo_url, "(min-width: 1024px) 200px, 200px")}
                        alt={`Foto de ${p.name}`}
                        className="block h-full w-auto max-w-[52vw] lg:h-auto lg:max-h-full lg:w-full lg:max-w-full"
                        decoding="async"
                        loading={slot === 0 ? "eager" : "lazy"}
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="grid h-full w-[180px] place-items-center bg-[var(--color-ink)] font-display text-4xl text-[var(--color-gold-soft)] lg:w-full"
                      >
                        {initials(p.name)}
                      </span>
                    )}
                  </div>
                  <span className="hidden px-3 py-3 lg:block">
                    <span className="block font-display text-base leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-terracotta)]">
                      {p.name}
                    </span>
                    {location && <span className="mt-0.5 block text-xs text-[var(--color-sepia)]">{location}</span>}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Mobile: identity of the visible card beside the photo */}
        <div className="flex min-w-0 flex-col justify-between lg:hidden">
          <div>
            <span className="block text-xs text-[var(--color-sepia)]">Conheça nossa rede</span>
            <a
              href={getProfessionalProfilePath(people[shown[0]])}
              className="mt-1 block font-display text-lg leading-snug text-[var(--color-ink)] underline-offset-4 hover:underline"
            >
              {people[shown[0]].name}
            </a>
            {getProfessionalLocation(people[shown[0]]) && (
              <span className="mt-0.5 block text-xs text-[var(--color-sepia)]">
                {getProfessionalLocation(people[shown[0]])}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button type="button" className={btn} onClick={() => go(-1)} aria-label="Anterior">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button type="button" className={btn} onClick={() => go(1)} aria-label="Próxima">
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => setUserPaused((v) => !v)}
          aria-label={userPaused ? "Retomar" : "Pausar"}
          aria-pressed={userPaused}
        >
          {userPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
        </button>
        <span className="ml-1 text-sm tabular-nums text-[var(--color-sepia)]" data-carousel-count>
          {index + 1} de {size}
        </span>
        <span className="sr-only" aria-live="polite">
          {announce}
        </span>
      </div>
    </div>
  );
}
