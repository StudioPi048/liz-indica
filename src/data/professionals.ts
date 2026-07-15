import { rawProfessionalsData } from "./professionals-raw";
import { Professional } from "../lib/professionals-api";

export type Badge = "destaque" | "certificado" | "internacional" | "docente";

function initialsOf(name: string) {
  const parts = name.split(" ").filter((p) => p.length > 2);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function slugOf(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractContactUrl(contact: string) {
  if (!contact) return null;
  if (contact.toLowerCase().includes("opção 1") && contact.length < 10) return null;
  
  const phoneMatch = contact.replace(/\D/g, "");
  if (phoneMatch.length >= 10 && !contact.includes("@")) {
    let phone = phoneMatch;
    if (phone.length === 10 || phone.length === 11) {
      phone = "55" + phone;
    }
    return `https://wa.me/${phone}`;
  }
  return contact;
}

const CATEGORIES = {
  "Psicogenealogia": ["psicogenealog", "genossociograma"],
  "Constelação Familiar": ["constela", "sistemica", "sistêmica", "sistêmico", "sistemico"],
  "Terapias Manuais": ["fisioterap", "microfisioterapia", "massoterapia", "osteopata", "acupuntura", "reiki", "quiropraxia"],
  "Ciência & Mente": ["neurociência", "psicanal", "psicolog", "hipnoterap", "pnl", "coach", "neuro"],
  "Energético & Espiritual": ["cabala", "cabalá", "tarô", "astrolog", "radiestesia", "thetahealing", "holística", "espiritual"],
  "Medicina & Saúde": ["medicina germânica", "leitura biológica", "biologia", "odontologia", "enfermagem", "saúde"]
};

function extractSpecialties(bio: string): string[] {
  if (!bio) return [];
  const lowerBio = bio.toLowerCase();
  const found = new Set<string>();
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => lowerBio.includes(k))) {
      found.add(category);
    }
  }
  
  return Array.from(found);
}

export const professionals: Professional[] = rawProfessionalsData.map((data, index) => {
  const specialties = extractSpecialties(data.bio);
  
  // Basic heuristic: if it mentions specific locations or has a non-BR phone, might be international or specific
  // For now, we leave city/country null as they are too complex to parse from these unstructured bios
  
  // Default to both online and in person for maximum reach unless specified
  const isOnline = data.bio?.toLowerCase().includes("online") ?? true;
  const inPerson = data.bio?.toLowerCase().includes("presencial") ?? true;

  return {
    id: slugOf(data.name),
    name: data.name,
    city: null,
    country: null,
    bio: data.bio,
    specialties: specialties,
    languages: [],
    photo_url: null, // We don't have real photos yet
    contact_url: extractContactUrl(data.contact),
    social_media: data.socialMedia !== "Opção 1" ? data.socialMedia : null,
    online: isOnline || (!isOnline && !inPerson), // Default to true if neither is found
    in_person: inPerson || (!isOnline && !inPerson), // Default to true if neither is found
    sort_order: index,
    published: true,
  };
});
