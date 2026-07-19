import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };

/** Scroll-triggered reveal: fade + translateY on children (or the element itself). */
export function useScrollReveal<T extends HTMLElement>(
  options: {
    selector?: string; // children to stagger; if omitted, animates ref itself
    y?: number;
    stagger?: number;
    duration?: number;
    start?: string;
    once?: boolean;
  } = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const {
    selector,
    y = 40,
    stagger = 0.08,
    duration = 0.9,
    start = "top 85%",
    once = true,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const targets = selector ? el.querySelectorAll<HTMLElement>(selector) : [el];
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y,
        duration,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [selector, y, stagger, duration, start, once]);

  return ref;
}
