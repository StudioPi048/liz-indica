import { type Professional, getInitials } from "@/lib/professionals-api";

function defaultWhatsApp(pro: Professional) {
  const msg = encodeURIComponent(
    `Olá ${pro.name}, encontrei seu perfil no diretório LIZ INDICA.`,
  );
  return `https://wa.me/?text=${msg}`;
}

export function ProfessionalCard({ pro }: { pro: Professional }) {
  const contactHref = pro.contact_url?.trim() || defaultWhatsApp(pro);

  return (
    <article className="group flex flex-col bg-card rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-1">
      <header className="flex items-center gap-4 mb-5">
        {pro.photo_url ? (
          <img
            src={pro.photo_url}
            alt={pro.name}
            className="size-16 rounded-full object-cover ring-4 ring-primary/5 shrink-0"
            loading="lazy"
          />
        ) : (
          <div
            className="size-16 rounded-full bg-primary-soft ring-4 ring-primary/5 shrink-0 grid place-items-center font-display text-xl text-primary-deep"
            aria-hidden="true"
          >
            {getInitials(pro.name)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-snug group-hover:text-primary transition-colors">
            {pro.name}
          </h3>
          {(pro.city || pro.country) && (
            <span className="text-xs text-muted-foreground">
              {[pro.city, pro.country].filter(Boolean).join(" · ")}
            </span>
          )}
          {!pro.city && !pro.country && (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Mentorado · Instituto LIZ
            </span>
          )}
        </div>
      </header>

      {pro.bio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {pro.bio}
        </p>
      )}

      {pro.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {pro.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 bg-muted text-[10px] rounded text-secondary-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <a
        href={contactHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto py-2.5 text-xs font-semibold text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--whatsapp)" }}
      >
        Entrar em contato
      </a>
    </article>
  );
}
