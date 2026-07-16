import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Loader2,
  LogOut,
  Send,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchOwnedProfessionalProfile,
  fetchProfileChangeRequests,
  getProfileCompletion,
  mergeProfessionalWithDraft,
  professionalToDraft,
  profileChangeStatusDescriptions,
  profileChangeStatusLabels,
  submitProfileChangeRequest,
  type ProfessionalProfileDraft,
} from "@/lib/professional-dashboard-api";
import {
  getInitials,
  getModalityLabel,
  getProfessionalLocation,
  getProfessionalProfilePath,
  getResponsivePhotoAttrs,
  type Professional,
} from "@/lib/professionals-api";

export const Route = createFileRoute("/profissional")({
  head: () => ({
    meta: [
      { title: "Área do profissional — LIZ INDICA" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProfessionalDashboardPage,
});

const emptyDraft: ProfessionalProfileDraft = {
  city: "",
  country: "",
  bio: "",
  specialties: "",
  languages: "",
  contactUrl: "",
  photoUrl: "",
  socialMedia: "",
  online: true,
  inPerson: false,
};

function ProfessionalDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [draft, setDraft] = useState<ProfessionalProfileDraft>(emptyDraft);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, navigate, user]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["owned-professional-profile", user?.id],
    queryFn: () => fetchOwnedProfessionalProfile(user!.id),
    enabled: Boolean(user),
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["professional-profile-requests", profile?.id],
    queryFn: () => fetchProfileChangeRequests(profile!.id),
    enabled: Boolean(profile?.id),
  });

  useEffect(() => {
    if (profile) setDraft(professionalToDraft(profile));
  }, [profile]);

  const pendingRequest = requests.find(
    (request) => request.status === "pending" || request.status === "reviewing",
  );
  const lastRequest = requests[0];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmitting(true);

    try {
      await submitProfileChangeRequest(profile, draft);
      setSubmitSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["professional-profile-requests", profile.id] });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro ao enviar alterações.");
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main
          id="conteudo-principal"
          tabIndex={-1}
          className="grid min-h-[60vh] place-items-center px-6"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando área do profissional…
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main
          id="conteudo-principal"
          tabIndex={-1}
          className="grid min-h-[70vh] place-items-center px-6 py-24"
        >
          <div className="max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
            <ShieldCheck className="mx-auto size-10 text-primary" />
            <h1 className="mt-4 font-display text-4xl text-primary-deep">
              Conta ainda não vinculada
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Você entrou como {user?.email}, mas esta conta ainda não está conectada a um perfil
              profissional. Peça à equipe LIZ para vincular seu e-mail ao seu perfil no painel
              administrativo.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="/#indicado"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Solicitar indicação
              </a>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-primary-deep hover:bg-muted"
              >
                Sair
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const completion = getProfileCompletion(profile);
  const previewProfile = mergeProfessionalWithDraft(profile, draft);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      <main id="conteudo-principal" tabIndex={-1} className="px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                Área do profissional
              </span>
              <h1 className="mt-3 font-display text-4xl text-primary-deep md:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Edite seu perfil e envie alterações para revisão da equipe LIZ.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.published && (
                <a
                  href={getProfessionalProfilePath(profile)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <Eye className="size-4" />
                  Ver perfil público
                </a>
              )}
              <button
                type="button"
                onClick={signOut}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)_360px]">
            <aside className="space-y-5">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl text-primary-deep">Completude</h2>
                    <p className="text-xs text-muted-foreground">Quanto mais completo, melhor.</p>
                  </div>
                  <div className="grid size-16 place-items-center rounded-full border border-primary/20 bg-primary/10 font-display text-2xl text-primary-deep">
                    {completion.score}%
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {completion.items.map((item) => (
                    <div key={item.key} className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        className={`size-4 ${item.done ? "text-primary" : "text-muted-foreground/50"}`}
                      />
                      <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-display text-2xl text-primary-deep">Revisão</h2>
                {requestsLoading ? (
                  <p className="mt-3 text-sm text-muted-foreground">Carregando pedidos…</p>
                ) : pendingRequest ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Clock3 className="size-4" />
                      {profileChangeStatusLabels[pendingRequest.status]}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed">
                      {profileChangeStatusDescriptions[pendingRequest.status]}
                    </p>
                  </div>
                ) : lastRequest ? (
                  <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="text-sm font-bold">
                      Último pedido: {profileChangeStatusLabels[lastRequest.status]}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {lastRequest.admin_notes ||
                        profileChangeStatusDescriptions[lastRequest.status]}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhuma alteração enviada para revisão ainda.
                  </p>
                )}
              </section>
            </aside>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-7"
            >
              <div className="mb-6 flex items-start gap-3">
                <FileCheck2 className="mt-1 size-5 text-primary" />
                <div>
                  <h2 className="font-display text-3xl text-primary-deep">Editar perfil</h2>
                  <p className="text-sm text-muted-foreground">
                    As alterações ficam pendentes até aprovação da equipe.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cidade" htmlFor="professional-city">
                  <input
                    id="professional-city"
                    value={draft.city}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, city: event.target.value }))
                    }
                    className="input"
                  />
                </Field>
                <Field label="País" htmlFor="professional-country">
                  <input
                    id="professional-country"
                    value={draft.country}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, country: event.target.value }))
                    }
                    className="input"
                  />
                </Field>
                <Field label="Especialidades" htmlFor="professional-specialties">
                  <input
                    id="professional-specialties"
                    value={draft.specialties}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, specialties: event.target.value }))
                    }
                    className="input"
                    placeholder="Separe por vírgula"
                  />
                </Field>
                <Field label="Idiomas" htmlFor="professional-languages">
                  <input
                    id="professional-languages"
                    value={draft.languages}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, languages: event.target.value }))
                    }
                    className="input"
                    placeholder="Português, Espanhol..."
                  />
                </Field>
                <Field
                  label="Link de contato"
                  htmlFor="professional-contact"
                  className="sm:col-span-2"
                >
                  <input
                    id="professional-contact"
                    value={draft.contactUrl}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, contactUrl: event.target.value }))
                    }
                    className="input"
                    placeholder="WhatsApp, agenda, site ou e-mail"
                  />
                </Field>
                <Field label="URL da foto" htmlFor="professional-photo" className="sm:col-span-2">
                  <input
                    id="professional-photo"
                    value={draft.photoUrl}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, photoUrl: event.target.value }))
                    }
                    className="input"
                    placeholder="https://..."
                  />
                </Field>
                <Field
                  label="Redes sociais e links"
                  htmlFor="professional-social"
                  className="sm:col-span-2"
                >
                  <input
                    id="professional-social"
                    value={draft.socialMedia}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, socialMedia: event.target.value }))
                    }
                    className="input"
                    placeholder="@instagram, site, página de agenda..."
                  />
                </Field>
                <Field
                  label="Resumo profissional"
                  htmlFor="professional-bio"
                  className="sm:col-span-2"
                >
                  <textarea
                    id="professional-bio"
                    value={draft.bio}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, bio: event.target.value }))
                    }
                    rows={7}
                    className="input"
                  />
                </Field>
              </div>

              <fieldset className="mt-5 rounded-xl border border-border/70 p-4">
                <legend className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Modalidade
                </legend>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-muted/40 px-4 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={draft.online}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, online: event.target.checked }))
                      }
                    />
                    Online
                  </label>
                  <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-muted/40 px-4 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={draft.inPerson}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, inPerson: event.target.checked }))
                      }
                    />
                    Presencial
                  </label>
                </div>
              </fieldset>

              {submitError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div
                  aria-live="polite"
                  className="mt-5 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary-deep"
                >
                  Alterações enviadas para revisão.
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDraft(professionalToDraft(profile))}
                  className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Restaurar dados atuais
                </button>
                <button
                  type="submit"
                  disabled={submitting || Boolean(pendingRequest)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {pendingRequest ? "Aguardando revisão" : "Enviar para revisão"}
                </button>
              </div>
            </form>

            <ProfilePreview profile={previewProfile} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfilePreview({ profile }: { profile: Professional }) {
  const location = getProfessionalLocation(profile);

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative aspect-[4/5] bg-muted">
          {profile.photo_url ? (
            <img
              {...getResponsivePhotoAttrs(profile.photo_url, "(min-width: 1024px) 360px, 92vw")}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-primary-soft font-display text-7xl text-primary-deep">
              {getInitials(profile.name)}
            </div>
          )}
          <div className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
            Preview
          </div>
        </div>
        <div className="p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-deep">
            <UserRoundCheck className="size-3.5" />
            {getModalityLabel(profile)}
          </div>
          <h2 className="font-display text-3xl leading-tight text-primary-deep">{profile.name}</h2>
          {location && (
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{location}</p>
          )}
          {profile.bio && (
            <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-foreground/72">
              {profile.bio}
            </p>
          )}
          {profile.specialties.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.specialties.slice(0, 5).map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-lg border border-border/50 bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
