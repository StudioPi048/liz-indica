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

const MAX_SPECIALTIES = 4;

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
    <article className="card-linhagem relative flex h-full gap-4 p-4 sm:p-5">
      <a
        href={profilePath}
        onClick={rememberDirectoryReturn}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block w-24 shrink-0 self-start overflow-hidden rounded-xl bg-[var(--color-ink)] sm:w-28"
      >
        <div className="aspect-[4/5] w-full">
          {pro.photo_url ? (
            <img
              {...getResponsivePhotoAttrs(pro.photo_url, "112px")}
              alt=""
              className="photo-sepia h-full w-full object-contain"
              decoding="async"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center font-display text-3xl text-[var(--color-parchment)]">
              {getInitials(pro.name)}
            </div>
          )}
        </div>
      </a>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 font-display text-lg leading-snug text-[var(--color-ink)] sm:text-xl">
            {pro.name}
          </h3>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(pro.id)}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? `Remover ${pro.name} dos favoritos`
                  : `Salvar ${pro.name} nos favoritos`
              }
              className="-mr-2 -mt-2 grid size-11 shrink-0 place-items-center rounded-full text-[var(--color-terracotta)] transition-colors hover:bg-[var(--color-terracotta)]/10"
            >
              <Heart className={`size-5 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
            </button>
          )}
        </div>

        <span className="label-mono mt-1">Instituto LIZ</span>

        <ul className="mt-2 space-y-1 text-sm text-[var(--color-sepia)]">
          {modality && (
            <li className="flex items-center gap-1.5">
              <Monitor className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{modality}</span>
            </li>
          )}
          {location && (
            <li className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{location}</span>
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
          className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-3 text-sm font-semibold text-[var(--color-terracotta)] underline-offset-4 hover:underline"
        >
          Ver perfil
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
