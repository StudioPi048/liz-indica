import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { dedupeForDirectory, fetchProfessionals } from "@/lib/professionals-api";
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
  const { data: professionals } = useQuery({
    queryKey: ["professionals", "public"],
    queryFn: () => fetchProfessionals(),
    staleTime: 1000 * 60 * 5,
  });
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

        node.textContent = `0${suffix}`;
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
    <section
      ref={sectionRef}
      className="relative z-10 border-y border-[var(--color-gold)]/45 bg-[var(--color-parchment)] py-14"
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="mb-6 text-center font-display text-xl text-[var(--color-ink)] md:text-left">
          Alcance institucional do Instituto LIZ
        </h2>
      </div>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
        {stats.map((s) => (
          <div key={s.label} data-stat-item className="text-center md:text-left">
            <div
              data-stat-value={s.target}
              data-stat-suffix={s.suffix ?? ""}
              className="font-display text-4xl md:text-5xl text-[var(--color-ink)] mb-1 tabular-nums"
            >
              {`${s.target}${s.suffix ?? ""}`}
            </div>
            <div className="label-mono">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <p className="max-w-7xl mx-auto mt-8 px-6 text-center text-sm text-[var(--color-sepia)] md:text-left">
        Números da rede e da formação do Instituto, não da listagem abaixo.{" "}
        {professionals ? (
          <a href="#diretorio" className="font-semibold text-[var(--color-ink)] underline underline-offset-4">
            Neste diretório agora: {dedupeForDirectory(professionals).length} perfis listados.
          </a>
        ) : null}
      </p>
    </section>
  );
}
