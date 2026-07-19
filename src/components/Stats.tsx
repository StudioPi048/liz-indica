import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/hooks/use-gsap";

type Stat = { target: number; suffix?: string; label: string };

const stats: Stat[] = [
  { target: 500, suffix: "+", label: "Psicogenealogistas" },
  { target: 120, label: "Cidades atendidas" },
  { target: 8, label: "Países" },
  { target: 20, suffix: "k", label: "Horas de formação" },
  { target: 3, suffix: "k", label: "Alunos formados" },
];

export function Stats() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const nodes = el.querySelectorAll<HTMLElement>("[data-stat-value]");

      nodes.forEach((node) => {
        const target = Number(node.dataset.statValue ?? "0");
        const suffix = node.dataset.statSuffix ?? "";
        const counter = { value: 0 };

        gsap.to(counter, {
          value: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: node,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            node.textContent = `${Math.round(counter.value)}${suffix}`;
          },
        });
      });

      gsap.from(el.querySelectorAll("[data-stat-item]"), {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 85%" },
      });

      ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-card border-y border-border py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
        {stats.map((s) => (
          <div key={s.label} data-stat-item className="text-center md:text-left">
            <div
              data-stat-value={s.target}
              data-stat-suffix={s.suffix ?? ""}
              className="font-display text-4xl md:text-5xl font-bold text-primary mb-1 tabular-nums"
            >
              {`0${s.suffix ?? ""}`}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
