import { type KeyboardEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/hooks/use-gsap";
import { getResponsivePhotoAttrs, type Professional } from "@/lib/professionals-api";
import { advanceOffset, cloneCount, initials, isAutoplayActive, wrapOffset } from "@/lib/carousel";

const SPEED = 26; // px/s, constant
const SIZES = "(min-width: 768px) 216px, 164px";

function Portrait({ person, eager }: { person: Professional; eager?: boolean }) {
  const attrs = getResponsivePhotoAttrs(person.photo_url, SIZES);
  return (
    <span className="flex h-[200px] w-[164px] items-center justify-center overflow-hidden rounded-[14px] bg-[var(--color-portrait)] md:h-[260px] md:w-[216px]">
      {attrs.src ? (
        <img
          {...attrs}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="h-full w-full object-contain object-center"
        />
      ) : (
        <span aria-hidden="true" className="font-display text-4xl text-[var(--color-sepia)]">
          {initials(person.name)}
        </span>
      )}
    </span>
  );
}

/**
 * Continuous full-bleed strip with every listed person (same set as the directory).
 * Native horizontal scroller; GSAP ticker advances scrollLeft at constant speed.
 * Trailing clones (aria-hidden, inert, no links) only fill the viewport at the seam.
 */
export function HeroCarousel({ people }: { people: Professional[] }) {
  const size = people.length;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef(0);
  const setWidthRef = useRef(0);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const touchTimer = useRef<number | undefined>(undefined);
  const startedRef = useRef(false);

  const [clones, setClones] = useState(8);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [touching, setTouching] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [rovingIndex, setRovingIndex] = useState(0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || size === 0) return;
    const first = track.querySelector<HTMLElement>("[data-strip-item]");
    const firstClone = track.querySelector<HTMLElement>("[data-strip-clone]");
    if (first) {
      const pitch = first.offsetWidth + parseFloat(getComputedStyle(first.parentElement!).columnGap || "0");
      setClones(cloneCount(track.clientWidth, pitch, size));
    }
    if (first && firstClone) setWidthRef.current = firstClone.offsetLeft - first.offsetLeft;
  }, [size]);

  useLayoutEffect(() => {
    measure();
  }, [measure, clones]);

  // Variable start per visit + reduced motion → no autoplay.
  useEffect(() => {
    if (startedRef.current || size === 0) return;
    startedRef.current = true;
    if (prefersReducedMotion()) setUserPaused(true);
    const track = trackRef.current;
    const start = Math.floor(Math.random() * size);
    const item = track?.querySelectorAll<HTMLElement>("[data-strip-item]")[start];
    if (track && item) {
      posRef.current = item.offsetLeft - (track.querySelector<HTMLElement>("[data-strip-item]")?.offsetLeft ?? 0);
      track.scrollLeft = posRef.current;
      setRovingIndex(start);
    }
  }, [size]);

  useEffect(() => {
    const track = trackRef.current;
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const io = track ? new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting)) : null;
    if (track && io) io.observe(track);
    const ro = track ? new ResizeObserver(() => measure()) : null;
    if (track && ro) ro.observe(track);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
      ro?.disconnect();
      window.clearTimeout(touchTimer.current);
    };
  }, [measure]);

  // Manual scroll (drag/trackpad/keyboard): keep our position in sync and wrap at the seam.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const sw = setWidthRef.current;
    if (Math.abs(track.scrollLeft - posRef.current) > 2) {
      posRef.current = track.scrollLeft;
      if (sw > 0 && posRef.current >= sw) {
        posRef.current = wrapOffset(posRef.current, sw);
        track.scrollLeft = posRef.current;
      }
    }
  };

  const active = isAutoplayActive({ userPaused, hover, focusWithin, touching, offscreen, tabHidden, size });

  useEffect(() => {
    if (!active) return;
    const track = trackRef.current;
    if (!track) return;
    posRef.current = track.scrollLeft;
    const tick = (_t: number, dt: number) => {
      const sw = setWidthRef.current;
      if (sw <= 0) return;
      posRef.current = advanceOffset(posRef.current, SPEED, Math.min(dt, 100), sw);
      track.scrollLeft = posRef.current;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [active]);

  const onKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % size;
    else if (e.key === "ArrowLeft") next = (i - 1 + size) % size;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = size - 1;
    if (next < 0) return;
    e.preventDefault();
    setRovingIndex(next);
    linkRefs.current[next]?.focus({ preventScroll: true });
    linkRefs.current[next]?.scrollIntoView({ inline: "nearest", block: "nearest" });
  };

  if (size === 0) return null;

  return (
    <div className="relative">
      <div className="mx-auto mb-3 flex max-w-7xl items-center gap-3 px-5 sm:px-8 lg:px-12">
        <h2 id="rede-titulo" className="font-display text-lg text-[var(--color-ink)]">
          Conheça a rede LIZ
        </h2>
        <button
          type="button"
          onClick={() => setUserPaused((v) => !v)}
          aria-pressed={userPaused}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm text-[var(--color-sepia)] underline-offset-4 hover:text-[var(--color-ink)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracotta)]"
        >
          {userPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
          {userPaused ? "Retomar" : "Pausar"}
        </button>
        <span className="hidden text-sm text-[var(--color-sepia)] md:inline">
          Passe o cursor ou use as setas para conhecer cada pessoa.
        </span>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-labelledby="rede-titulo"
        onScroll={onScroll}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          window.clearTimeout(touchTimer.current);
          setTouching(true);
        }}
        onPointerUp={(e) => {
          if (e.pointerType === "mouse") return;
          window.clearTimeout(touchTimer.current);
          touchTimer.current = window.setTimeout(() => setTouching(false), 2500);
        }}
        onFocus={() => setFocusWithin(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false);
        }}
        className="no-scrollbar overflow-x-auto overscroll-x-contain"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex w-max gap-3 px-5 sm:px-8 md:gap-4 lg:px-12">
          <ul className="contents">
            {people.map((p, i) => (
              <li key={p.id} data-strip-item className="w-[164px] shrink-0 md:w-[216px]">
                <Link
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  to="/profissionais/$slug"
                  params={{ slug: p.slug }}
                  tabIndex={i === rovingIndex ? 0 : -1}
                  onFocus={() => setRovingIndex(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  draggable={false}
                  className="group block rounded-[16px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-terracotta)]"
                >
                  <Portrait person={p} eager={i < 3} />
                  <span className="mt-2.5 block line-clamp-2 text-[0.95rem] leading-snug text-[var(--color-ink)] group-hover:underline group-hover:decoration-[var(--color-gold)] group-hover:underline-offset-4">
                    {p.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {people.slice(0, clones).map((p, i) => (
            <div
              key={`clone-${p.id}`}
              data-strip-clone={i === 0 ? "" : undefined}
              aria-hidden="true"
              // @ts-expect-error inert is a valid boolean attribute in React 19 DOM
              inert=""
              className="w-[164px] shrink-0 md:w-[216px]"
            >
              <Portrait person={p} />
              <span className="mt-2.5 block line-clamp-2 text-[0.95rem] leading-snug text-[var(--color-ink)]">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
