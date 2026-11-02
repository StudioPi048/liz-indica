import {
  type Professional,
  getInitials,
  getModalityLabel,
  getProfessionalLocation,
  getProfessionalProfilePath,
  getResponsivePhotoAttrs,
} from "@/lib/professionals-api";
import { ArrowRight, Heart, MapPin, Monitor } from "lucide-react";

function rememberDirectoryReturn() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    "liz-directory-return",
    `${window.location.pathname}${window.location.search}#diretorio`,
  );
}

const MAX_SPECIALTIES = 3;

/** Large, portrait-first card. Photo shown whole (object-contain), no filter. */
export function ProfessionalCard({
  pro,
  isFavorite = false,
  onToggleFavorite,
}: {
  pro: Professional;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  const profilePath = getProfessionalProfilePath(pro);
  const location = getProfessionalLocation(pro);
  const modality = pro.online || pro.in_person ? getModalityLabel(pro) : null;
  const extra = pro.specialties.length - MAX_SPECIALTIES;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-sepia)]/15 bg-card transition-shadow hover:shadow-lg">
      <a
        href={profilePath}
        onClick={rememberDirectoryReturn}
        tabIndex={-1}
        aria-hidden="true"
        className="flex h-[260px] items-center justify-center bg-[var(--color-ink)] sm:h-[280px]"
      >
        {pro.photo_url ? (
          <img
            {...getResponsivePhotoAttrs(pro.photo_url, "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw")}
            alt=""
            className="h-full w-full object-contain"
            decoding="async"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-6xl text-[var(--color-gold-soft)]">{getInitials(pro.name)}</span>
        )}
      </a>

      {onToggleFavorite && (
        <button
          type="button"
          onClick={() => onToggleFavorite(pro.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remover ${pro.name} dos favoritos` : `Salvar ${pro.name} nos favoritos`}
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-[var(--color-parchment)]/95 text-[var(--color-terracotta)] shadow-sm transition-colors hover:bg-[var(--color-parchment)]"
        >
          <Heart className={`size-5 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
        </button>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-snug text-[var(--color-ink)] [overflow-wrap:anywhere]">
          {pro.name}
        </h3>

        <ul className="mt-2 space-y-1 text-sm text-[var(--color-sepia)]">
          {location && (
            <li className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{location}</span>
            </li>
          )}
          {modality && (
            <li className="flex items-center gap-1.5">
              <Monitor className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{modality}</span>
            </li>
          )}
        </ul>

        {pro.specialties.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Especialidades">
            {pro.specialties.slice(0, MAX_SPECIALTIES).map((specialty) => (
              <li key={specialty} className="chip">
                {specialty}
              </li>
            ))}
            {extra > 0 && (
              <li className="chip text-[var(--color-sepia)]">
                +{extra} <span className="sr-only">especialidades</span>
              </li>
            )}
          </ul>
        )}

        <a
          href={profilePath}
          onClick={rememberDirectoryReturn}
          aria-label={`Ver perfil de ${pro.name}`}
          className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-4 text-sm font-semibold text-[var(--color-terracotta)] underline-offset-4 hover:underline"
        >
          Ver perfil
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
