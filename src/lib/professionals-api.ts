import { supabase } from "@/integrations/supabase/client";

export const SITE_URL = "https://liz-indica.lovable.app";

export interface Professional {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  bio: string | null;
  specialties: string[];
  languages: string[];
  photo_url: string | null;
  contact_url: string | null;
  social_media: string | null;
  online: boolean;
  in_person: boolean;
  owner_user_id: string | null;
  sort_order: number;
  published: boolean;
}

export function getInitials(name: string) {
  const parts = name.split(" ").filter((p) => p.length > 2);
  const first = parts[0]?.[0] ?? name[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getProfessionalSlug(professional: Pick<Professional, "id" | "name">) {
  const base = slugify(professional.name) || "profissional";
  return `${base}-${professional.id.slice(0, 8)}`;
}

export function getProfessionalProfilePath(professional: Pick<Professional, "id" | "name">) {
  return `/profissionais/${getProfessionalSlug(professional)}`;
}

export function getProfessionalLocation(professional: Pick<Professional, "city" | "country">) {
  return [professional.city, professional.country].filter(Boolean).join(" · ");
}

export function getModalityLabel(professional: Pick<Professional, "online" | "in_person">) {
  if (professional.online && professional.in_person) return "Online e presencial";
  if (professional.online) return "Online";
  if (professional.in_person) return "Presencial";
  return "Modalidade em revisão";
}

export function getContactHref(contactUrl: string | null) {
  const trimmed = contactUrl?.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("@")) return `https://instagram.com/${trimmed.substring(1)}`;
  if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(trimmed)) return trimmed;
  if (/^(?:www\.|wa\.me\/|api\.whatsapp\.com\/|[\w.-]+\.[a-z]{2,}\/?)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function getResponsivePhotoAttrs(photoUrl: string | null, sizes: string) {
  if (!photoUrl) return {};
  const localPhotoBase = photoUrl.match(/^(\/photos\/.+)\.(?:jpe?g|png)$/i)?.[1];
  if (!localPhotoBase) return { src: photoUrl, sizes };

  return {
    src: photoUrl,
    srcSet: `${localPhotoBase}-480.webp 480w, ${localPhotoBase}-960.webp 960w`,
    sizes,
  };
}

export function getProfessionalDescription(professional: Professional) {
  const location = getProfessionalLocation(professional);
  const specialties = professional.specialties.slice(0, 2).join(", ");
  const base = `Conheça ${professional.name}, profissional indicado pelo Instituto LIZ`;
  const details = [specialties, location, getModalityLabel(professional).toLowerCase()]
    .filter(Boolean)
    .join(" · ");
  return `${base}${details ? `: ${details}` : "."}`;
}

export async function fetchProfessionals({
  includeUnpublished = false,
}: {
  includeUnpublished?: boolean;
} = {}): Promise<Professional[]> {
  let query = supabase.from("professionals").select("*");
  if (!includeUnpublished) query = query.eq("published", true);

  const { data, error } = await query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Professional[];
}

export async function fetchProfessionalBySlug(slug: string): Promise<Professional | null> {
  const professionals = await fetchProfessionals();
  return (
    professionals.find((professional) => getProfessionalSlug(professional) === slug) ??
    professionals.find((professional) => slug.endsWith(professional.id.slice(0, 8))) ??
    null
  );
}
