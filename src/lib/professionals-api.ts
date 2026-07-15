import { supabase } from "@/integrations/supabase/client";

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
  sort_order: number;
  published: boolean;
}

export function getInitials(name: string) {
  const parts = name.split(" ").filter((p) => p.length > 2);
  const first = parts[0]?.[0] ?? name[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

const fallbackDirectory: Professional[] = fallbackProfessionals;

export async function fetchProfessionals(options?: {
  fallbackOnEmpty?: boolean;
  fallbackOnError?: boolean;
}): Promise<Professional[]> {
  const fallbackOnEmpty = options?.fallbackOnEmpty ?? true;
  const fallbackOnError = options?.fallbackOnError ?? true;

  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    if (fallbackOnError) return fallbackDirectory;
    throw error;
  }
  if ((!data || data.length === 0) && fallbackOnEmpty) return fallbackDirectory;
  return (data ?? []) as Professional[];
}
