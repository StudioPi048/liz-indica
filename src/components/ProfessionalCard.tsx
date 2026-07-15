import { type Professional, getInitials } from "@/lib/professionals-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, MapPin } from "lucide-react";

function defaultWhatsApp(pro: Professional) {
  const msg = encodeURIComponent(
    `Olá ${pro.name}, encontrei seu perfil no diretório LIZ INDICA.`,
  );
  return `https://wa.me/?text=${msg}`;
}

function Linkify({ text }: { text: string }) {
  if (!text) return null;
  const regex = /((?:https?:\/\/|www\.)[^\s]+)|(@[\w.]+)/gi;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const matchedText = match[0];
    let href = matchedText;
    
    if (matchedText.startsWith('@')) {
      href = `https://instagram.com/${matchedText.substring(1)}`;
    } else if (matchedText.toLowerCase().startsWith('www.')) {
      href = `https://${matchedText}`;
    }
    
    parts.push(
      <a 
        key={match.index} 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline font-semibold"
        onClick={(e) => e.stopPropagation()}
      >
        {matchedText}
      </a>
    );
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts.length > 0 ? parts : text}</>;
}

export function ProfessionalCard({ pro }: { pro: Professional }) {
  const contactHref = pro.contact_url?.trim() || defaultWhatsApp(pro);

  return (
    <Dialog>
      {/* PROFESSIONAL CARD (Large Avatar, Clean Background) */}
      <article className="group flex flex-col bg-card rounded-[1.25rem] overflow-hidden border border-border/60 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 relative h-full cursor-pointer">
        
        {/* HUGE AVATAR HEADER */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {pro.photo_url ? (
            <img
              src={pro.photo_url}
              alt={pro.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-br from-primary-soft to-primary/20 grid place-items-center font-display text-7xl text-primary-deep"
              aria-hidden="true"
            >
              {getInitials(pro.name)}
            </div>
          )}
          
          {/* Floating Modality Badge */}
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider text-foreground shadow-sm">
            {pro.online && pro.in_person ? "Online & Presencial" : pro.online ? "Online" : "Presencial"}
          </div>
        </div>

        {/* CARD BODY */}
        <div className="p-6 md:p-8 flex-1 flex flex-col bg-card">
          {/* HEADER INFO */}
          <h3 className="font-display text-2xl md:text-3xl leading-tight text-primary-deep group-hover:text-primary transition-colors line-clamp-1 mb-2">
            {pro.name}
          </h3>
          
          <div className="text-[11px] font-sans tracking-wide text-muted-foreground flex items-center gap-1.5 mb-6 uppercase">
            {(pro.city || pro.country) ? (
              <>
                <MapPin className="size-3" />
                {[pro.city, pro.country].filter(Boolean).join(" · ")}
              </>
            ) : (
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/80">
                Mentorado · Instituto LIZ
              </span>
            )}
          </div>

          {/* SPECIALTIES PILLS (Monochrome / Clean) */}
          {pro.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
               {pro.specialties.slice(0, 3).map((s) => (
                 <span
                   key={s}
                   className="px-2.5 py-1 text-[11px] rounded-md bg-muted/60 text-muted-foreground font-medium border border-border/40"
                 >
                   {s}
                 </span>
               ))}
               {pro.specialties.length > 3 && (
                 <span className="px-2.5 py-1 text-[11px] rounded-md bg-muted/30 text-muted-foreground/70 font-medium border border-border/40">
                   +{pro.specialties.length - 3}
                 </span>
               )}
            </div>
          )}

          {/* BIO */}
          {pro.bio && (
            <p className="text-sm text-foreground/70 mb-8 line-clamp-2 leading-relaxed">
              {pro.bio}
            </p>
          )}
          
          {/* ACTIONS */}
          <div className="mt-auto flex flex-col gap-3 pt-5 border-t border-border/40">
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-3.5 text-sm font-semibold text-white rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-sm"
              style={{ backgroundColor: "var(--whatsapp, #25D366)" }}
              title="Entrar em contato via WhatsApp"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-4" />
              Falar no WhatsApp
            </a>
            <DialogTrigger asChild>
              <button className="w-full py-2.5 text-xs font-semibold text-primary hover:text-primary-deep hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center">
                Ver Currículo Completo
              </button>
            </DialogTrigger>
          </div>
        </div>
      </article>

      {/* MODAL FULL DETAILS */}
      <DialogContent className="sm:max-w-[700px] bg-background p-0 overflow-hidden border-border/50 shadow-2xl rounded-2xl">
        
        {/* MODAL HEADER (Dark Premium with White Text inside) */}
        <div className="w-full bg-gradient-to-br from-[#121B22] to-[#090D10] relative px-6 sm:px-10 pt-10 pb-12">
          <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
             {pro.photo_url ? (
                <img
                  src={pro.photo_url}
                  alt={pro.name}
                  className="size-32 sm:size-36 rounded-2xl object-cover ring-2 ring-white/10 shadow-xl shrink-0"
                />
              ) : (
                <div
                  className="size-32 sm:size-36 rounded-2xl bg-white/5 ring-2 ring-white/10 shadow-xl shrink-0 grid place-items-center font-display text-5xl text-white"
                >
                  {getInitials(pro.name)}
                </div>
              )}
              
              <div className="flex-1 pt-2">
                <DialogHeader>
                  <DialogTitle className="font-display text-3xl sm:text-4xl mb-3 text-balance leading-tight text-white">{pro.name}</DialogTitle>
                </DialogHeader>
                {(pro.city || pro.country) ? (
                  <span className="text-sm text-white/70 flex items-center justify-center sm:justify-start gap-1.5 mb-5">
                    <MapPin className="size-4 shrink-0" />
                    {[pro.city, pro.country].filter(Boolean).join(" · ")}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 block mb-5">
                    Mentorado Oficial Instituto LIZ
                  </span>
                )}
                {/* Modal Modality Badge */}
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-black bg-white/95 px-3.5 py-1.5 rounded-full shadow-sm">
                  {pro.online && pro.in_person ? "Online & Presencial" : pro.online ? "Atendimento Online" : "Atendimento Presencial"}
                </div>
              </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="px-6 sm:px-10 py-8 max-h-[55vh] overflow-y-auto custom-scrollbar bg-card">
          {pro.specialties.length > 0 && (
            <div className="mb-8">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Especialidades</h4>
              <div className="flex flex-wrap gap-2.5">
                {pro.specialties.map((s) => (
                  <span
                    key={s}
                    className="px-3.5 py-1.5 text-xs rounded-md bg-muted text-muted-foreground font-medium border border-border/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pro.bio ? (
            <div className="space-y-4 text-[15px] leading-relaxed text-foreground/80 font-light">
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
            <div className="mt-8 p-5 bg-muted/40 rounded-xl border border-border/50">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Redes Sociais & Links</h4>
              <p className="text-sm break-words text-foreground/80 leading-relaxed whitespace-pre-line"><Linkify text={pro.social_media} /></p>
            </div>
          )}

          <div className="mt-8 flex justify-end pt-6 border-t border-border/50">
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white rounded-xl hover:scale-105 hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-500/20"
              style={{ backgroundColor: "var(--whatsapp, #25D366)" }}
            >
              <MessageCircle className="size-5" />
              Entrar em Contato Agora
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
