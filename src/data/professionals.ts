import { rawProfessionalsData } from "./professionals-raw";

export type Badge = "destaque" | "certificado" | "internacional" | "docente";

export interface Professional {
  id: string;
  name: string;
  initials: string;
  badges: Badge[];
  bio?: string;
  contact_url?: string;
  social_media?: string;
}

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

// Clean up contact string to only digits for whatsapp link, or keep original if it's an email/link
function extractContactUrl(contact: string) {
  if (!contact) return undefined;
  
  // If it's just "Opção 1" or similar generic text, ignore
  if (contact.toLowerCase().includes("opção 1") && contact.length < 10) return undefined;
  
  // Extract first sequence of digits (at least 8)
  const phoneMatch = contact.replace(/\D/g, "");
  if (phoneMatch.length >= 10 && !contact.includes("@")) {
    // Basic phone number formatting
    let phone = phoneMatch;
    if (phone.length === 10 || phone.length === 11) {
      phone = "55" + phone;
    }
    return `https://wa.me/${phone}`;
  }
  
  return contact; // could be email or messy string, just return it
}

export const professionals: Professional[] = rawProfessionalsData.map((data) => ({
  id: slugOf(data.name),
  name: data.name,
  initials: initialsOf(data.name),
  badges: ["certificado"],
  bio: data.bio,
  contact_url: extractContactUrl(data.contact),
  social_media: data.socialMedia !== "Opção 1" ? data.socialMedia : undefined,
}));
