import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables, TablesUpdate } from "@/integrations/supabase/types";
import type { Professional } from "@/lib/professionals-api";
import { splitList } from "@/lib/applications-api";

export type ProfileChangeStatus = Tables<"professional_profile_change_requests">["status"];
export type ProfileChangeRequest = Tables<"professional_profile_change_requests">;

export type ProfessionalProfileDraft = {
  city: string;
  country: string;
  bio: string;
  specialties: string;
  languages: string;
  contactUrl: string;
  photoUrl: string;
  socialMedia: string;
  online: boolean;
  inPerson: boolean;
};

export type ProfileChangePayload = {
  city: string | null;
  country: string | null;
  bio: string | null;
  specialties: string[];
  languages: string[];
  contact_url: string | null;
  photo_url: string | null;
  social_media: string | null;
  online: boolean;
  in_person: boolean;
};

export const profileChangeStatusLabels: Record<ProfileChangeStatus, string> = {
  pending: "Pendente",
  reviewing: "Em análise",
  approved: "Aprovada",
  rejected: "Recusada",
};

export const profileChangeStatusDescriptions: Record<ProfileChangeStatus, string> = {
  pending: "A equipe LIZ ainda vai revisar esta alteração.",
  reviewing: "A alteração está em avaliação.",
  approved: "A alteração já foi aplicada ao perfil.",
  rejected: "A alteração não foi aplicada.",
};

const completionItems = [
  { key: "photo", label: "Foto de perfil" },
  { key: "bio", label: "Resumo profissional" },
  { key: "location", label: "Cidade e país" },
  { key: "languages", label: "Idiomas" },
  { key: "specialties", label: "Especialidades" },
  { key: "contact", label: "Contato válido" },
  { key: "links", label: "Redes sociais ou site" },
  { key: "modality", label: "Modalidade de atendimento" },
] as const;

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function professionalToDraft(professional: Professional): ProfessionalProfileDraft {
  return {
    city: professional.city ?? "",
    country: professional.country ?? "",
    bio: professional.bio ?? "",
    specialties: professional.specialties.join(", "),
    languages: professional.languages.join(", "),
    contactUrl: professional.contact_url ?? "",
    photoUrl: professional.photo_url ?? "",
    socialMedia: professional.social_media ?? "",
    online: professional.online,
    inPerson: professional.in_person,
  };
}

export function draftToProfilePayload(draft: ProfessionalProfileDraft): ProfileChangePayload {
  return {
    city: nullableText(draft.city),
    country: nullableText(draft.country),
    bio: nullableText(draft.bio),
    specialties: splitList(draft.specialties),
    languages: splitList(draft.languages),
    contact_url: nullableText(draft.contactUrl),
    photo_url: nullableText(draft.photoUrl),
    social_media: nullableText(draft.socialMedia),
    online: draft.online,
    in_person: draft.inPerson,
  };
}

export function mergeProfessionalWithDraft(
  professional: Professional,
  draft: ProfessionalProfileDraft,
): Professional {
  const payload = draftToProfilePayload(draft);
  return {
    ...professional,
    city: payload.city,
    country: payload.country,
    bio: payload.bio,
    specialties: payload.specialties,
    languages: payload.languages,
    contact_url: payload.contact_url,
    photo_url: payload.photo_url,
    social_media: payload.social_media,
    online: payload.online,
    in_person: payload.in_person,
  };
}

export function getProfileCompletion(professional: Professional) {
  const checks = {
    photo: Boolean(professional.photo_url),
    bio: Boolean(professional.bio && professional.bio.trim().length >= 80),
    location: Boolean(professional.city && professional.country),
    languages: professional.languages.length > 0,
    specialties: professional.specialties.length > 0,
    contact: Boolean(professional.contact_url),
    links: Boolean(professional.social_media),
    modality: professional.online || professional.in_person,
  };

  const done = completionItems.filter((item) => checks[item.key]).length;
  return {
    score: Math.round((done / completionItems.length) * 100),
    items: completionItems.map((item) => ({
      key: item.key,
      label: item.label,
      done: checks[item.key],
    })),
  };
}

export async function fetchOwnedProfessionalProfile(userId: string): Promise<Professional | null> {
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Professional | null;
}

export async function fetchProfileChangeRequests(professionalId: string) {
  const { data, error } = await supabase
    .from("professional_profile_change_requests")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchAllProfileChangeRequests() {
  const { data, error } = await supabase
    .from("professional_profile_change_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function submitProfileChangeRequest(
  professional: Professional,
  draft: ProfessionalProfileDraft,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Faça login para enviar alterações.");

  const payload = draftToProfilePayload(draft);
  if (!payload.online && !payload.in_person) {
    throw new Error("Selecione pelo menos uma modalidade de atendimento.");
  }

  const { error } = await supabase.from("professional_profile_change_requests").insert({
    professional_id: professional.id,
    requested_by: user.id,
    payload: payload as unknown as Json,
    status: "pending",
  });

  if (error) throw error;
}

function isRecord(value: Json): value is Record<string, Json> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringOrNull(value: Json | undefined) {
  return typeof value === "string" && value.trim() ? value : null;
}

function stringArray(value: Json | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function profilePayloadFromJson(value: Json): ProfileChangePayload {
  if (!isRecord(value)) {
    return {
      city: null,
      country: null,
      bio: null,
      specialties: [],
      languages: [],
      contact_url: null,
      photo_url: null,
      social_media: null,
      online: true,
      in_person: false,
    };
  }

  return {
    city: stringOrNull(value.city),
    country: stringOrNull(value.country),
    bio: stringOrNull(value.bio),
    specialties: stringArray(value.specialties),
    languages: stringArray(value.languages),
    contact_url: stringOrNull(value.contact_url),
    photo_url: stringOrNull(value.photo_url),
    social_media: stringOrNull(value.social_media),
    online: typeof value.online === "boolean" ? value.online : true,
    in_person: typeof value.in_person === "boolean" ? value.in_person : false,
  };
}

async function getReviewerPatch() {
  const { data } = await supabase.auth.getUser();
  return {
    reviewed_by: data.user?.id ?? null,
    reviewed_at: new Date().toISOString(),
  };
}

export async function updateProfileChangeRequest(
  id: string,
  patch: TablesUpdate<"professional_profile_change_requests">,
) {
  const reviewerPatch = await getReviewerPatch();
  const { error } = await supabase
    .from("professional_profile_change_requests")
    .update({ ...patch, ...reviewerPatch })
    .eq("id", id);

  if (error) throw error;
}

export async function approveProfileChangeRequest(
  request: ProfileChangeRequest,
  adminNotes: string,
) {
  const payload = profilePayloadFromJson(request.payload);
  const { error: updateError } = await supabase
    .from("professionals")
    .update(payload)
    .eq("id", request.professional_id);

  if (updateError) throw updateError;

  await updateProfileChangeRequest(request.id, {
    status: "approved",
    admin_notes: adminNotes.trim() || "Alteração aprovada e aplicada ao perfil.",
  });
}

export async function linkProfessionalOwnerByEmail(professionalId: string, email: string) {
  const { error } = await supabase.rpc("link_professional_owner_by_email", {
    _professional_id: professionalId,
    _email: email.trim().toLowerCase(),
  });

  if (error) throw error;
}
