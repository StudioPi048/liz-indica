import { type Professional, getInitials } from "@/lib/professionals-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, ExternalLink, MapPin } from "lucide-react";

function defaultWhatsApp(pro: Professional) {
  const msg = encodeURIComponent(
    `Olá ${pro.name}, encontrei seu perfil no diretório LIZ INDICA.`,
  );
  return `https://wa.me/?text=${msg}`;
}

export function ProfessionalCard({ pro }: { pro: Professional }) {
  const contactHref = pro.contact_url?.trim() || defaultWhatsApp(pro);

  return (
    <Dialog>
      <article className="group flex flex-col bg-card rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-1 relative h-full">
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
            <h3 className="font-display text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {pro.name}
            </h3>
            {(pro.city || pro.country) && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="size-3" />
                {[pro.city, pro.country].filter(Boolean).join(" · ")}
              </span>
            )}
            {!pro.city && !pro.country && (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground inline-block mt-1">
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

        {pro.social_media && (
          <div className="mb-4">
            <span className="text-xs font-medium text-muted-foreground block mb-1">Mídias Sociais:</span>
            <p className="text-sm text-primary line-clamp-1">{pro.social_media}</p>
          </div>
        )}

        {pro.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
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

        <div className="mt-auto flex gap-2 pt-4 border-t border-border/50">
          <DialogTrigger asChild>
            <button className="flex-1 py-2.5 text-xs font-semibold bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              Ver Currículo Completo
            </button>
          </DialogTrigger>
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none px-4 py-2.5 text-xs font-semibold text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            style={{ backgroundColor: "var(--whatsapp)" }}
            title="Entrar em contato via WhatsApp"
          >
            <MessageCircle className="size-4" />
          </a>
        </div>
      </article>

      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            {pro.photo_url ? (
              <img
                src={pro.photo_url}
                alt={pro.name}
                className="size-20 rounded-full object-cover ring-4 ring-primary/10 shrink-0"
              />
            ) : (
              <div
                className="size-20 rounded-full bg-primary-soft ring-4 ring-primary/10 shrink-0 grid place-items-center font-display text-3xl text-primary-deep"
              >
                {getInitials(pro.name)}
              </div>
            )}
            <div>
              <DialogTitle className="font-display text-2xl mb-1">{pro.name}</DialogTitle>
              {(pro.city || pro.country) ? (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-4" />
                  {[pro.city, pro.country].filter(Boolean).join(" · ")}
                </span>
              ) : (
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Mentorado Oficial Instituto LIZ
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {pro.bio ? (
            <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
              {pro.bio.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Este profissional não disponibilizou um currículo completo.
            </p>
          )}

          {pro.social_media && (
            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Redes Sociais & Links</h4>
              <p className="text-sm break-words">{pro.social_media}</p>
            </div>
          )}

          {pro.specialties.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Especialidades</h4>
              <div className="flex flex-wrap gap-2">
                {pro.specialties.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-primary/5 text-primary text-xs rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-primary-foreground rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            style={{ backgroundColor: "var(--whatsapp)" }}
          >
            <MessageCircle className="size-5" />
            Entrar em Contato Agora
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
