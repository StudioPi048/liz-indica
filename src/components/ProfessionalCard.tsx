import type { Professional } from "@/data/professionals";

export function ProfessionalCard({ pro }: { pro: Professional }) {
  const waMessage = encodeURIComponent(
    `Olá ${pro.name}, encontrei seu perfil no diretório LIZ INDICA.`,
  );

  return (
    <article className="group flex flex-col bg-card rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-1">
      <header className="flex items-center gap-4 mb-5">
        <div
          className="size-16 rounded-full bg-primary-soft ring-4 ring-primary/5 shrink-0 grid place-items-center font-display text-xl text-primary-deep"
          aria-hidden="true"
        >
          {pro.initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-snug group-hover:text-primary transition-colors">
            {pro.name}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Mentorada · Instituto LIZ
          </span>
        </div>
      </header>

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
