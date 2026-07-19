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

type LocationParts = {
  city: string;
  state?: string;
  country: string;
  searchTerms: string[];
};

const BRAZIL_DDD_LOCATIONS: Record<string, Omit<LocationParts, "country" | "searchTerms">> = {
  "11": { city: "São Paulo", state: "SP" },
  "12": { city: "Vale do Paraíba", state: "SP" },
  "13": { city: "Baixada Santista", state: "SP" },
  "14": { city: "Bauru", state: "SP" },
  "15": { city: "Sorocaba", state: "SP" },
  "16": { city: "Ribeirão Preto", state: "SP" },
  "17": { city: "São José do Rio Preto", state: "SP" },
  "18": { city: "Presidente Prudente", state: "SP" },
  "19": { city: "Campinas", state: "SP" },
  "21": { city: "Rio de Janeiro", state: "RJ" },
  "22": { city: "Campos dos Goytacazes", state: "RJ" },
  "24": { city: "Volta Redonda", state: "RJ" },
  "27": { city: "Vitória", state: "ES" },
  "28": { city: "Cachoeiro de Itapemirim", state: "ES" },
  "31": { city: "Belo Horizonte", state: "MG" },
  "32": { city: "Juiz de Fora", state: "MG" },
  "33": { city: "Governador Valadares", state: "MG" },
  "34": { city: "Uberlândia", state: "MG" },
  "35": { city: "Poços de Caldas", state: "MG" },
  "37": { city: "Divinópolis", state: "MG" },
  "38": { city: "Montes Claros", state: "MG" },
  "41": { city: "Curitiba", state: "PR" },
  "42": { city: "Ponta Grossa", state: "PR" },
  "43": { city: "Londrina", state: "PR" },
  "44": { city: "Maringá", state: "PR" },
  "45": { city: "Foz do Iguaçu", state: "PR" },
  "46": { city: "Pato Branco", state: "PR" },
  "47": { city: "Joinville", state: "SC" },
  "48": { city: "Florianópolis", state: "SC" },
  "49": { city: "Chapecó", state: "SC" },
  "51": { city: "Porto Alegre", state: "RS" },
  "53": { city: "Pelotas", state: "RS" },
  "54": { city: "Caxias do Sul", state: "RS" },
  "55": { city: "Santa Maria", state: "RS" },
  "61": { city: "Brasília", state: "DF" },
  "62": { city: "Goiânia", state: "GO" },
  "63": { city: "Palmas", state: "TO" },
  "64": { city: "Rio Verde", state: "GO" },
  "65": { city: "Cuiabá", state: "MT" },
  "66": { city: "Rondonópolis", state: "MT" },
  "67": { city: "Campo Grande", state: "MS" },
  "68": { city: "Rio Branco", state: "AC" },
  "69": { city: "Porto Velho", state: "RO" },
  "71": { city: "Salvador", state: "BA" },
  "73": { city: "Ilhéus", state: "BA" },
  "74": { city: "Juazeiro", state: "BA" },
  "75": { city: "Feira de Santana", state: "BA" },
  "77": { city: "Vitória da Conquista", state: "BA" },
  "79": { city: "Aracaju", state: "SE" },
  "81": { city: "Recife", state: "PE" },
  "82": { city: "Maceió", state: "AL" },
  "83": { city: "João Pessoa", state: "PB" },
  "84": { city: "Natal", state: "RN" },
  "85": { city: "Fortaleza", state: "CE" },
  "86": { city: "Teresina", state: "PI" },
  "87": { city: "Petrolina", state: "PE" },
  "88": { city: "Juazeiro do Norte", state: "CE" },
  "89": { city: "Picos", state: "PI" },
  "91": { city: "Belém", state: "PA" },
  "92": { city: "Manaus", state: "AM" },
  "93": { city: "Santarém", state: "PA" },
  "94": { city: "Marabá", state: "PA" },
  "95": { city: "Boa Vista", state: "RR" },
  "96": { city: "Macapá", state: "AP" },
  "97": { city: "Tefé", state: "AM" },
  "98": { city: "São Luís", state: "MA" },
  "99": { city: "Imperatriz", state: "MA" },
};

function getDigits(value: string | null | undefined) {
  return value?.replace(/\D/g, "") ?? "";
}

function getLocationFromPhone(value: string | null | undefined): LocationParts | null {
  const digits = getDigits(value);
  if (!digits) return null;

  if (digits.startsWith("351") || /^9\d{8}$/.test(digits)) {
    return {
      city: "Portugal",
      country: "Portugal",
      searchTerms: ["Portugal"],
    };
  }

  const brazilNumber = digits.startsWith("55") ? digits.slice(2) : digits;
  const ddd = brazilNumber.slice(0, 2);
  const location = BRAZIL_DDD_LOCATIONS[ddd];
  if (!location) return null;

  return {
    ...location,
    country: "Brasil",
    searchTerms: [location.city, location.state, "Brasil"].filter(Boolean) as string[],
  };
}

export function getProfessionalLocationParts(
  professional: Pick<Professional, "city" | "country" | "contact_url" | "social_media">,
): LocationParts | null {
  if (professional.city || professional.country) {
    return {
      city: professional.city ?? professional.country ?? "",
      country: professional.country ?? "",
      searchTerms: [professional.city, professional.country].filter(Boolean) as string[],
    };
  }

  return (
    getLocationFromPhone(professional.contact_url) ??
    getLocationFromPhone(professional.social_media)
  );
}

export function getProfessionalLocation(
  professional: Pick<Professional, "city" | "country" | "contact_url" | "social_media">,
) {
  const location = getProfessionalLocationParts(professional);
  if (!location) return "";
  return [location.city, location.state, location.country].filter(Boolean).join(" · ");
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
