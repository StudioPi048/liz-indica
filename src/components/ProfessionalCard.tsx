import { type Professional, getInitials } from "@/lib/professionals-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, MapPin } from "lucide-react";

function defaultWhatsApp(pro: Professional) {
  const msg = encodeURIComponent(
    `Olá ${pro.name}, encontrei seu perfil no diretório LIZ INDICA.`,
  );
  return `https://wa.me/?text=${msg}`;
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Psicogenealogia": "bg-blue-50 text-blue-800 border-blue-200",
  "Constelação Familiar": "bg-purple-50 text-purple-800 border-purple-200",
  "Terapias Manuais": "bg-green-50 text-green-800 border-green-200",
  "Ciência & Mente": "bg-amber-50 text-amber-800 border-amber-200",
  "Energético & Espiritual": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "Medicina & Saúde": "bg-rose-50 text-rose-800 border-rose-200",
};

export function ProfessionalCard({ pro }: { pro: Professional }) {
  const contactHref = pro.contact_url?.trim() || defaultWhatsApp(pro);

  return (
    <Dialog>
      <article className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative h-full">
        {/* TOP COVER */}
        <div className="h-28 w-full bg-gradient-to-r from-primary/10 to-primary/5 relative">
          {/* We can add a subtle pattern here if desired */}
        </div>
        
        {/* AVATAR OVERLAPPING COVER */}
        <div className="px-5 md:px-6 relative flex justify-between items-start -mt-12 mb-3">
          {pro.photo_url ? (
            <img
              src={pro.photo_url}
              alt={pro.name}
              className="size-20 rounded-xl object-cover ring-4 ring-card bg-card shadow-sm shrink-0"
              loading="lazy"
            />
          ) : (
            <div
              className="size-20 rounded-xl bg-gradient-to-br from-primary-soft to-primary/20 ring-4 ring-card shadow-sm shrink-0 grid place-items-center font-display text-2xl text-primary-deep"
              aria-hidden="true"
            >
              {getInitials(pro.name)}
            </div>
          )}
          
          {/* Modality Badge */}
          <div className="mt-14 flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground bg-muted/80 px-2 py-1 rounded">
            {pro.online && pro.in_person ? "Online & Presencial" : pro.online ? "Online" : "Presencial"}
          </div>
        </div>

        <div className="px-5 md:px-6 flex-1 flex flex-col">
          {/* HEADER INFO */}
          <h3 className="font-display text-xl leading-tight group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {pro.name}
          </h3>
          
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
            {(pro.city || pro.country) ? (
              <>
                <MapPin className="size-3.5" />
                {[pro.city, pro.country].filter(Boolean).join(" · ")}
              </>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/80">
                Mentorado · Instituto LIZ
              </span>
            )}
          </div>

          {/* SPECIALTIES PILLS */}
          {pro.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
               {pro.specialties.slice(0, 3).map((s) => {
                 const colorClass = CATEGORY_COLORS[s] || "bg-slate-50 text-slate-700 border-slate-200";
                 return (
                   <span
                     key={s}
                     className={`px-2 py-0.5 text-[10px] rounded border ${colorClass} font-medium`}
                   >
                     {s}
                   </span>
                 );
               })}
               {pro.specialties.length > 3 && (
                 <span className="px-2 py-0.5 text-[10px] rounded border bg-slate-50 text-slate-500 font-medium border-slate-200">
                   +{pro.specialties.length - 3}
                 </span>
               )}
            </div>
          )}

          {/* BIO */}
          {pro.bio && (
            <p className="text-sm text-foreground/80 mb-6 line-clamp-3 leading-relaxed">
              {pro.bio}
            </p>
          )}
          
          {/* ACTIONS */}
          <div className="mt-auto flex gap-2 pt-4 border-t border-border/50 pb-5 md:pb-6">
            <DialogTrigger asChild>
              <button className="flex-1 py-2 text-xs font-semibold bg-secondary/80 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors flex items-center justify-center">
                Ver Currículo Completo
              </button>
            </DialogTrigger>
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
              style={{ backgroundColor: "var(--whatsapp, #25D366)" }}
              title="Entrar em contato via WhatsApp"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>
        </div>
      </article>

      {/* MODAL */}
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
              {/* Modal Modality Badge */}
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                {pro.online && pro.in_person ? "Online & Presencial" : pro.online ? "Atendimento Online" : "Atendimento Presencial"}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {pro.specialties.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Especialidades</h4>
              <div className="flex flex-wrap gap-2">
                {pro.specialties.map((s) => {
                  const colorClass = CATEGORY_COLORS[s] || "bg-slate-50 text-slate-700 border-slate-200";
                  return (
                    <span
                      key={s}
                      className={`px-3 py-1 text-xs rounded-full border ${colorClass} font-medium`}
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

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
        </div>

        <div className="mt-6 flex justify-end">
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            style={{ backgroundColor: "var(--whatsapp, #25D366)" }}
          >
            <MessageCircle className="size-5" />
            Entrar em Contato Agora
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
