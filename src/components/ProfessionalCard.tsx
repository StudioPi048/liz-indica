import type { Badge as BadgeType, Professional } from "@/data/professionals";

const badgeLabels: Record<BadgeType, { label: string; className: string }> = {
  destaque: {
    label: "⭐ Destaque LIZ",
    className: "bg-primary/10 text-primary-deep",
  },
  certificado: {
    label: "Certificado",
    className: "bg-muted text-muted-foreground",
  },
  internacional: {
    label: "🌍 Internacional",
    className: "bg-accent text-accent-foreground",
  },
  docente: {
    label: "🎓 Docente",
    className: "bg-primary-deep text-primary-foreground",
  },
};

export function ProfessionalCard({ pro }: { pro: Professional }) {
  const waMessage = encodeURIComponent(
    `Olá ${pro.name}, encontrei seu perfil no diretório LIZ INDICA.`,
  );

  return (
    <article className="group flex flex-col bg-card rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-1">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div
          className="size-20 rounded-full bg-primary-soft ring-4 ring-primary/5 shrink-0 grid place-items-center font-display text-2xl text-primary-deep"
          aria-hidden="true"
        >
          {pro.initials}
        </div>
        <div className="flex flex-col items-end gap-1.5 min-w-0">
          {pro.badges.slice(0, 1).map((b) => (
            <span
              key={b}
              className={`px-2 py-1 text-[10px] font-semibold rounded uppercase tracking-wider ${badgeLabels[b].className}`}
            >
              {badgeLabels[b].label}
            </span>
          ))}
          <span className="text-xs text-muted-foreground truncate">
            {pro.city} • {pro.country}
          </span>
        </div>
      </header>

      <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
        {pro.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">
        {pro.bio}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {pro.specialties.slice(0, 3).map((s) => (
          <span
            key={s}
            className="px-2 py-0.5 bg-muted text-[10px] rounded text-secondary-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          type="button"
          className="py-2.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Ver Perfil
        </button>
        <a
          href={`https://wa.me/?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 text-xs font-semibold text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--whatsapp)" }}
        >
          WhatsApp
        </a>
      </div>
    </article>
  );
}
