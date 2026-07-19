import {
  type Professional,
  getInitials,
  getModalityLabel,
  getProfessionalLocation,
  getProfessionalProfilePath,
  getResponsivePhotoAttrs,
} from "@/lib/professionals-api";
import { ArrowUpRight, MapPin } from "lucide-react";

function rememberDirectoryReturn() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    "liz-directory-return",
    `${window.location.pathname}${window.location.search}#diretorio`,
  );
}

export function ProfessionalCard({ pro }: { pro: Professional }) {
  const profilePath = getProfessionalProfilePath(pro);
  const location = getProfessionalLocation(pro);
  const hasModality = pro.online || pro.in_person;
  const modality = hasModality ? getModalityLabel(pro) : null;
  const metaLine = [modality, location].filter(Boolean).join(" · ");

  return (
    <a
      href={profilePath}
      onClick={rememberDirectoryReturn}
      aria-label={`Ver dossiê de ${pro.name}`}
      className="card-linhagem group flex h-full flex-col overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-ink)]">
        {pro.photo_url ? (
          <img
            {...getResponsivePhotoAttrs(
              pro.photo_url,
              "(min-width: 1280px) 320px, (min-width: 768px) 45vw, 100vw",
            )}
            alt={pro.name}
            className="photo-sepia h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
            decoding="async"
            loading="lazy"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center bg-[var(--color-ink)] font-display text-7xl text-[var(--color-parchment)]"
            aria-hidden="true"
          >
            {getInitials(pro.name)}
          </div>
        )}

        <span className="label-mono absolute left-4 top-4 rounded-full bg-[var(--color-parchment)]/95 px-3 py-1.5 text-[var(--color-ink)] shadow-sm backdrop-blur">
          Instituto LIZ
        </span>

        {location && (
          <span className="absolute bottom-4 left-4 right-4 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[var(--color-ink)]/78 px-3 py-2 text-xs font-medium text-[var(--color-parchment)] shadow-lg backdrop-blur">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col bg-white p-6 md:p-7">
        <h3 className="font-display text-2xl leading-tight text-[var(--color-ink)] md:text-[1.6rem]">
          {pro.name}
        </h3>

        {metaLine && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-sepia-soft)]">
            {location && <MapPin className="size-3 shrink-0" aria-hidden="true" />}
            <span className="truncate">{metaLine}</span>
          </p>
        )}

        {pro.specialties.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {pro.specialties.slice(0, 3).map((specialty) => (
              <span key={specialty} className="chip">
                {specialty}
              </span>
            ))}
            {pro.specialties.length > 3 && (
              <span className="chip text-[var(--color-sepia-soft)]">
                +{pro.specialties.length - 3}
              </span>
            )}
          </div>
        )}

        <span className="mt-auto flex items-center gap-1.5 pt-6 font-display text-sm italic text-[var(--color-terracotta)] transition-transform duration-300 group-hover:translate-x-1">
          Ver dossiê completo
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
