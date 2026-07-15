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
  "Psicogenealogia": "bg-[#F3F6F8] text-[#2C485A] border-[#9DB5C4]/40",
  "Constelação Familiar": "bg-[#F9F4F5] text-[#6E2C3F] border-[#C495A2]/40",
  "Terapias Manuais": "bg-[#F4F6F3] text-[#3D5A40] border-[#A3B8A5]/40",
  "Ciência & Mente": "bg-[#FDF9F1] text-[#9A6D2C] border-[#E8C589]/40",
  "Energético & Espiritual": "bg-[#F6F4F8] text-[#543864] border-[#B59FBF]/40",
  "Medicina & Saúde": "bg-[#FDF6F4] text-[#8C3E2D] border-[#D99A8C]/40",
};

export const CATEGORY_GRADIENTS: Record<string, string> = {
  "Psicogenealogia": "from-[#597F97] to-[#3B5D73]",
  "Constelação Familiar": "from-[#944458] to-[#6E2C3F]",
  "Terapias Manuais": "from-[#5C7E60] to-[#3D5A40]",
  "Ciência & Mente": "from-[#C49141] to-[#9A6D2C]",
  "Energético & Espiritual": "from-[#78538C] to-[#543864]",
  "Medicina & Saúde": "from-[#B85741] to-[#8C3E2D]",
};

function getGradient(specialties: string[]) {
  if (!specialties || specialties.length === 0) return "from-primary/10 to-primary/5";
  if (specialties.length === 1) {
    return CATEGORY_GRADIENTS[specialties[0]] || "from-primary/10 to-primary/5";
  }
  // Se tiver mais de uma, mesclamos o início da primeira com o final da segunda
  const c1 = CATEGORY_GRADIENTS[specialties[0]]?.split(' ')[0] || "from-primary/10";
  const c2 = CATEGORY_GRADIENTS[specialties[1]]?.split(' ')[1] || "to-primary/5";
  return `${c1} ${c2}`;
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
      <article className="group flex flex-col bg-card/60 backdrop-blur-xl rounded-xl overflow-hidden border border-border/40 shadow-sm hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1 relative h-full cursor-pointer">
        {/* INNER FRAME (Premium detail) */}
        <div className="absolute inset-2 border border-border/30 rounded-lg pointer-events-none z-20 mix-blend-overlay"></div>
        
        {/* TOP COVER */}
        <div className={`h-24 w-full bg-gradient-to-r ${getGradient(pro.specialties)} relative opacity-70 group-hover:opacity-90 transition-opacity duration-500`}>
          <div className="absolute inset-0 bg-noise opacity-50 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/60"></div>
        </div>
        
        {/* AVATAR OVERLAPPING COVER */}
        <div className="px-6 relative flex justify-between items-start -mt-10 mb-3 z-10">
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

        <div className="px-6 flex-1 flex flex-col relative z-10">
          {/* HEADER INFO */}
          <h3 className="font-display text-2xl leading-tight text-primary-deep group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
            {pro.name}
          </h3>
          
          <div className="text-[11px] font-sans tracking-wide text-muted-foreground flex items-center gap-1.5 mb-5 uppercase">
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
          <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-border/50 pb-5 md:pb-6 relative z-10">
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-sm"
              style={{ backgroundColor: "var(--whatsapp, #25D366)" }}
              title="Entrar em contato via WhatsApp"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-4" />
              Falar no WhatsApp
            </a>
            <DialogTrigger asChild>
              <button className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors flex items-center justify-center">
                Ver Currículo Completo
              </button>
            </DialogTrigger>
          </div>
        </div>
      </article>

      {/* MODAL */}
      <DialogContent className="sm:max-w-[600px] bg-background p-0 overflow-hidden border-border/50 shadow-2xl">
        {/* MODAL COVER */}
        <div className={`h-32 w-full bg-gradient-to-r ${getGradient(pro.specialties)} relative opacity-90`}>
          <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
        </div>

        <div className="px-6 pb-6 relative -mt-12 sm:-mt-16">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-6">
              {pro.photo_url ? (
                <img
                  src={pro.photo_url}
                  alt={pro.name}
                  className="size-24 sm:size-28 rounded-2xl object-cover ring-4 ring-background shadow-lg shrink-0 bg-background"
                />
              ) : (
                <div
                  className="size-24 sm:size-28 rounded-2xl bg-gradient-to-br from-primary-soft to-primary/20 ring-4 ring-background shadow-lg shrink-0 grid place-items-center font-display text-4xl text-primary-deep"
                >
                  {getInitials(pro.name)}
                </div>
              )}
              <div className="flex-1 pb-1 text-left">
                <DialogTitle className="font-display text-2xl sm:text-3xl mb-2 text-balance leading-tight">{pro.name}</DialogTitle>
                {(pro.city || pro.country) ? (
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2.5">
                    <MapPin className="size-4 shrink-0" />
                    {[pro.city, pro.country].filter(Boolean).join(" · ")}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground block mb-2.5">
                    Mentorado Oficial Instituto LIZ
                  </span>
                )}
                {/* Modal Modality Badge */}
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                  {pro.online && pro.in_person ? "Online & Presencial" : pro.online ? "Atendimento Online" : "Atendimento Presencial"}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
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
              <p className="text-sm break-words text-foreground/90 leading-relaxed whitespace-pre-line"><Linkify text={pro.social_media} /></p>
            </div>
          )}
        </div>

          <div className="mt-6 flex justify-end pt-4 border-t border-border/50">
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
