import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type ApplicationStatus = Tables<"professional_applications">["status"];
export type ProfessionalApplication = Tables<"professional_applications">;

export type ProfessionalApplicationFormValues = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  formation: string;
  specialties: string;
  languages: string;
  bio: string;
  links: string;
  online: boolean;
  inPerson: boolean;
};

export type ApplicationValidationErrors = Partial<
  Record<keyof ProfessionalApplicationFormValues | "modality", string>
>;

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  received: "Recebida",
  reviewing: "Em análise",
  changes_requested: "Ajustes solicitados",
  approved: "Aprovada",
  rejected: "Recusada",
};

export const applicationStatusDescriptions: Record<ApplicationStatus, string> = {
  received: "A equipe LIZ ainda vai iniciar a análise.",
  reviewing: "A solicitação está em avaliação.",
  changes_requested: "A equipe precisa de informações complementares.",
  approved: "A solicitação foi aprovada e pode virar perfil.",
  rejected: "A solicitação foi recusada.",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function splitList(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clean(value: string) {
  return value.trim();
}

function nullableText(value: string) {
  const trimmed = clean(value);
  return trimmed ? trimmed : null;
}

export function validateProfessionalApplication(values: ProfessionalApplicationFormValues) {
  const errors: ApplicationValidationErrors = {};

  if (clean(values.fullName).length < 3) errors.fullName = "Informe seu nome completo.";
  if (!emailPattern.test(clean(values.email))) errors.email = "Informe um e-mail válido.";
  if (clean(values.phone).length < 8) errors.phone = "Informe um telefone de contato.";
  if (clean(values.city).length < 2) errors.city = "Informe sua cidade.";
  if (clean(values.country).length < 2) errors.country = "Informe seu país.";
  if (clean(values.formation).length < 3) {
    errors.formation = "Informe a formação realizada no Instituto LIZ.";
  }
  if (clean(values.bio).length < 40) {
    errors.bio = "Escreva um resumo com pelo menos 40 caracteres.";
  }
  if (!values.online && !values.inPerson) {
    errors.modality = "Selecione pelo menos uma modalidade de atendimento.";
  }

  return errors;
}

export function toProfessionalApplicationInsert(
  values: ProfessionalApplicationFormValues,
): TablesInsert<"professional_applications"> {
  return {
    full_name: clean(values.fullName),
    email: clean(values.email).toLowerCase(),
    phone: nullableText(values.phone),
    city: nullableText(values.city),
    country: nullableText(values.country),
    formation: clean(values.formation),
    specialties: splitList(values.specialties),
    languages: splitList(values.languages),
    bio: nullableText(values.bio),
    links: nullableText(values.links),
    online: values.online,
    in_person: values.inPerson,
    status: "received",
  };
}

export async function submitProfessionalApplication(values: ProfessionalApplicationFormValues) {
  const errors = validateProfessionalApplication(values);
  if (Object.keys(errors).length > 0) {
    throw new Error("Revise os campos destacados antes de enviar.");
  }

  const { error } = await supabase
    .from("professional_applications")
    .insert(toProfessionalApplicationInsert(values));

  if (error) throw error;
}

export async function fetchProfessionalApplications(): Promise<ProfessionalApplication[]> {
  const { data, error } = await supabase
    .from("professional_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function getReviewerPatch() {
  const { data } = await supabase.auth.getUser();
  return {
    reviewed_by: data.user?.id ?? null,
    reviewed_at: new Date().toISOString(),
  };
}

export async function updateProfessionalApplication(
  id: string,
  patch: TablesUpdate<"professional_applications">,
) {
  const reviewerPatch = await getReviewerPatch();
  const { error } = await supabase
    .from("professional_applications")
    .update({ ...patch, ...reviewerPatch })
    .eq("id", id);

  if (error) throw error;
}

export async function approveApplicationAsProfessional(
  application: ProfessionalApplication,
  adminNotes: string,
) {
  const { error: insertError } = await supabase.from("professionals").insert({
    name: application.full_name,
    city: application.city,
    country: application.country,
    bio: application.bio,
    specialties: application.specialties,
    languages: application.languages,
    contact_url: null,
    photo_url: null,
    online: application.online,
    in_person: application.in_person,
    published: false,
    sort_order: 999,
    social_media: application.links,
  });

  if (insertError) throw insertError;

  await updateProfessionalApplication(application.id, {
    status: "approved",
    admin_notes: adminNotes.trim() || "Aprovada e convertida em perfil não publicado.",
  });
}
