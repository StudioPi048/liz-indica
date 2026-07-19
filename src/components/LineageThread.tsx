import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/hooks/use-gsap";

/**
 * "O Fio da Linhagem" — vertical gold thread that runs down the home page,
 * with small knots at each section boundary. Desktop-only decoration.
 *
 * Reads `[data-thread-anchor]` markers placed around sections to position
 * the knots. With prefers-reduced-motion, the thread appears fully drawn
 * (no scrub). It is decorative and never receives pointer events.
 */
export function LineageThread() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const line = lineRef.current;
    if (!wrap || !line) return;

    // Place knots at each anchor, relative to the wrapper.
    const placeKnots = () => {
      wrap.querySelectorAll(".lineage-knot").forEach((n) => n.remove());
      const anchors = document.querySelectorAll<HTMLElement>("[data-thread-anchor]");
      const wrapRect = wrap.getBoundingClientRect();
      const scrollTop = window.scrollY;
      anchors.forEach((a) => {
        const rect = a.getBoundingClientRect();
        const top = rect.top + scrollTop - (wrapRect.top + scrollTop);
        const dot = document.createElement("span");
        dot.className = "lineage-knot";
        dot.style.top = `${top}px`;
        wrap.appendChild(dot);
      });
    };

    placeKnots();
    const ro = new ResizeObserver(() => {
      placeKnots();
      ScrollTrigger.refresh();
    });
    ro.observe(document.body);
    window.addEventListener("resize", placeKnots);

    let ctx: gsap.Context | null = null;
    if (!prefersReducedMotion()) {
      ctx = gsap.context(() => {
        gsap.set(line, { transformOrigin: "top center", scaleY: 0 });
        gsap.to(line, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
        });
      }, wrap);
    } else {
      line.style.transformOrigin = "top center";
      line.style.transform = "scaleY(1)";
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", placeKnots);
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-px -translate-x-1/2 md:block"
    >
      <div
        ref={lineRef}
        className="h-full w-px"
        style={{ background: "var(--color-gold)", opacity: 0.28 }}
      />
    </div>
  );
}
