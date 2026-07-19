import {
  type Professional,
  getContactHref,
  getInitials,
  getModalityLabel,
  getProfessionalLocation,
  getProfessionalProfilePath,
  getResponsivePhotoAttrs,
} from "@/lib/professionals-api";
import { BadgeCheck, Languages, MapPin, MessageCircle, UserRoundCheck } from "lucide-react";

function rememberDirectoryReturn() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    "liz-directory-return",
    `${window.location.pathname}${window.location.search}#diretorio`,
  );
}

export function ProfessionalCard({ pro }: { pro: Professional }) {
  const contactHref = getContactHref(pro.contact_url);
  const hasContact = Boolean(contactHref);
  const profilePath = getProfessionalProfilePath(pro);
  const location = getProfessionalLocation(pro);
  const hasModality = pro.online || pro.in_person;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/60 bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-gold)]/55 hover:shadow-xl hover:shadow-[var(--color-ink)]/10">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <a
          href={profilePath}
          onClick={rememberDirectoryReturn}
          className="block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`Ver perfil completo de ${pro.name}`}
        >
          {pro.photo_url ? (
            <img
              {...getResponsivePhotoAttrs(
                pro.photo_url,
                "(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw",
              )}
              alt={pro.name}
              className="photo-sepia h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              decoding="async"
              loading="lazy"
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center bg-gradient-to-br from-primary-soft to-primary/20 font-display text-7xl text-primary-deep"
              aria-hidden="true"
            >
              {getInitials(pro.name)}
            </div>
          )}
        </a>

        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm backdrop-blur-md">
          <BadgeCheck className="size-3 text-primary" aria-hidden="true" />
          Instituto LIZ
        </div>

        {hasModality && (
          <div className="absolute bottom-4 left-4 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
            {getModalityLabel(pro)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col bg-card p-6 md:p-8">
        <a href={profilePath} onClick={rememberDirectoryReturn} className="group/title">
          <h3 className="mb-2 line-clamp-2 font-display text-2xl leading-tight text-primary-deep transition-colors group-hover/title:text-primary md:text-3xl">
            {pro.name}
          </h3>
        </a>

        {(location || pro.languages.length > 0) && (
          <div className="mb-4 flex flex-col gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                {location}
              </span>
            )}

            {pro.languages.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Languages className="size-3 shrink-0" aria-hidden="true" />
                {pro.languages.slice(0, 3).join(", ")}
              </span>
            )}
          </div>
        )}

        {pro.specialties.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {pro.specialties.slice(0, 4).map((specialty) => (
              <span
                key={specialty}
                className="rounded-md border border-border/40 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {specialty}
              </span>
            ))}
            {pro.specialties.length > 4 && (
              <span className="rounded-md border border-border/40 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground/70">
                +{pro.specialties.length - 4}
              </span>
            )}
          </div>
        )}

        {pro.bio && (
          <p className="mb-8 line-clamp-3 text-sm leading-relaxed text-foreground/70">{pro.bio}</p>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-border/40 pt-5">
          {hasContact && (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.02] hover:bg-primary-deep"
              title={`Entrar em contato com ${pro.name}`}
              aria-label={`Entrar em contato com ${pro.name}`}
            >
              <MessageCircle className="size-4" />
              Entrar em contato
            </a>
          )}

        {pro.bio && (
          <p className="mb-8 line-clamp-3 text-sm leading-relaxed text-foreground/70">{pro.bio}</p>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-border/40 pt-5">
          {hasContact ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.02] hover:bg-primary-deep"
              title={`Entrar em contato com ${pro.name}`}
              aria-label={`Entrar em contato com ${pro.name}`}
            >
              <MessageCircle className="size-4" />
              Entrar em contato
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/70 py-3.5 text-sm font-semibold text-muted-foreground"
              title="Contato ainda não informado"
            >
              <MessageCircle className="size-4" />
              Contato em revisão
            </button>
          )}

          <a
            href={profilePath}
            onClick={rememberDirectoryReturn}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 hover:text-primary-deep"
          >
            <UserRoundCheck className="size-4" />
            Ver perfil completo
          </a>
        </div>
      </div>
    </article>
  );
}
