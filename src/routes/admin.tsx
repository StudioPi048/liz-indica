import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  FileText,
  FilePenLine,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  UserPlus,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfessionals, getInitials, type Professional } from "@/lib/professionals-api";
import {
  applicationStatusDescriptions,
  applicationStatusLabels,
  approveApplicationAsProfessional,
  fetchProfessionalApplications,
  updateProfessionalApplication,
  type ApplicationStatus,
  type ProfessionalApplication,
} from "@/lib/applications-api";
import {
  approveProfileChangeRequest,
  fetchAllProfileChangeRequests,
  linkProfessionalOwnerByEmail,
  profileChangeStatusDescriptions,
  profileChangeStatusLabels,
  profilePayloadFromJson,
  updateProfileChangeRequest,
  type ProfileChangePayload,
  type ProfileChangeRequest,
  type ProfileChangeStatus,
} from "@/lib/professional-dashboard-api";

import { useAdmin } from "@/hooks/use-admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — LIZ INDICA" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdmin();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals", "admin"],
    queryFn: () => fetchProfessionals({ includeUnpublished: true }),
    enabled: isAdmin,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["professional-applications"],
    queryFn: () => fetchProfessionalApplications(),
    enabled: isAdmin,
  });

  const { data: profileRequests = [], isLoading: profileRequestsLoading } = useQuery({
    queryKey: ["professional-profile-change-requests"],
    queryFn: () => fetchAllProfileChangeRequests(),
    enabled: isAdmin,
  });

  const [editing, setEditing] = useState<Professional | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"applications" | "reviews" | "professionals">(
    "applications",
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl mb-2">Acesso negado</h1>
          <p className="text-muted-foreground mb-6">
            Sua conta não tem permissão de administrador.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="px-5 py-2.5 bg-foreground text-background rounded-full text-sm"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["professionals"] });
    queryClient.invalidateQueries({ queryKey: ["professional-applications"] });
    queryClient.invalidateQueries({ queryKey: ["professional-profile-change-requests"] });
  };

  const openApplicationsCount = applications.filter(
    (application) => application.status !== "approved" && application.status !== "rejected",
  ).length;
  const openProfileRequestsCount = profileRequests.filter(
    (request) => request.status === "pending" || request.status === "reviewing",
  ).length;
  const professionalsById = new Map(
    professionals.map((professional) => [professional.id, professional]),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl">Painel Admin · LIZ INDICA</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate({ to: "/" })}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
            >
              Ver site
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
              className="px-4 py-2 text-sm bg-foreground text-background rounded-lg"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo-principal" tabIndex={-1} className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-3xl text-primary-deep">Operação LIZ INDICA</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Revise novas solicitações e mantenha o diretório publicado.
            </p>
          </div>

          <div className="flex rounded-xl border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("applications")}
              className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${
                activeTab === "applications"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Solicitações
              {openApplicationsCount > 0 && (
                <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-[11px]">
                  {openApplicationsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${
                activeTab === "reviews"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Revisões
              {openProfileRequestsCount > 0 && (
                <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-[11px]">
                  {openProfileRequestsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("professionals")}
              className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${
                activeTab === "professionals"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Mentorados
            </button>
          </div>
        </div>

        {activeTab === "applications" ? (
          <ApplicationsPanel
            applications={applications}
            isLoading={applicationsLoading}
            onRefresh={refresh}
          />
        ) : activeTab === "reviews" ? (
          <ProfileReviewsPanel
            requests={profileRequests}
            professionalsById={professionalsById}
            isLoading={profileRequestsLoading}
            onRefresh={refresh}
          />
        ) : (
          <section>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl">Mentorados ({professionals.length})</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        "Tem certeza que deseja publicar TODOS os profissionais ocultos de uma vez?",
                      )
                    )
                      return;
                    const { error } = await supabase
                      .from("professionals")
                      .update({ published: true })
                      .eq("published", false);
                    if (error) alert("Erro: " + error.message);
                    else {
                      alert("Todos publicados com sucesso!");
                      refresh();
                    }
                  }}
                  className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Publicar todos
                </button>
                <button
                  onClick={() => setCreating(true)}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-deep"
                >
                  + Novo profissional
                </button>
              </div>
            </div>

            {isLoading ? (
              <p className="text-muted-foreground">Carregando…</p>
            ) : (
              <div className="grid gap-3">
                {professionals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setEditing(p)}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary"
                  >
                    {p.photo_url ? (
                      <img src={p.photo_url} alt="" className="size-12 rounded-full object-cover" />
                    ) : (
                      <div className="grid size-12 place-items-center rounded-full bg-primary-soft font-display text-sm text-primary-deep">
                        {getInitials(p.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {[p.city, p.country].filter(Boolean).join(" · ") || "Sem localização"}
                        {!p.published && " · oculto"}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Editar →</span>
                  </button>
                ))}
                {professionals.length === 0 && (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    Nenhum profissional cadastrado.
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {(editing || creating) && (
        <EditorDialog
          pro={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            refresh();
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

const statusOrder: Array<ApplicationStatus | "all"> = [
  "all",
  "received",
  "reviewing",
  "changes_requested",
  "approved",
  "rejected",
];

const statusStyles: Record<ApplicationStatus, string> = {
  received: "bg-blue-50 text-blue-700 border-blue-200",
  reviewing: "bg-amber-50 text-amber-700 border-amber-200",
  changes_requested: "bg-orange-50 text-orange-700 border-orange-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

function ApplicationsPanel({
  applications,
  isLoading,
  onRefresh,
}: {
  applications: ProfessionalApplication[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const visibleApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((application) => application.status === statusFilter);

  const countByStatus = (status: ApplicationStatus | "all") => {
    if (status === "all") return applications.length;
    return applications.filter((application) => application.status === status).length;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Carregando solicitações…
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl text-primary-deep">
            Solicitações ({applications.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A aprovação cria um perfil oculto para revisão antes de aparecer no site.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOrder.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`min-h-10 rounded-full border px-3 text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {status === "all" ? "Todas" : applicationStatusLabels[status]} (
              {countByStatus(status)})
            </button>
          ))}
        </div>
      </div>

      {visibleApplications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhuma solicitação encontrada neste filtro.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </section>
  );
}

function ApplicationCard({
  application,
  onRefresh,
}: {
  application: ProfessionalApplication;
  onRefresh: () => void;
}) {
  const [notes, setNotes] = useState(application.admin_notes ?? "");
  const [savingAction, setSavingAction] = useState<ApplicationStatus | "approve" | null>(null);

  useEffect(() => {
    setNotes(application.admin_notes ?? "");
  }, [application.admin_notes, application.id]);

  const changeStatus = async (status: ApplicationStatus) => {
    setSavingAction(status);
    try {
      await updateProfessionalApplication(application.id, {
        status,
        admin_notes: notes.trim() || null,
      });
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao atualizar solicitação");
    } finally {
      setSavingAction(null);
    }
  };

  const approve = async () => {
    if (
      !confirm(
        "Aprovar esta solicitação e criar um perfil oculto para revisão antes da publicação?",
      )
    ) {
      return;
    }

    setSavingAction("approve");
    try {
      await approveApplicationAsProfessional(application, notes);
      alert("Perfil oculto criado com sucesso.");
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao aprovar solicitação");
    } finally {
      setSavingAction(null);
    }
  };

  const saving = Boolean(savingAction);

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-bold ${statusStyles[application.status]}`}
            >
              {applicationStatusLabels[application.status]}
            </span>
            <span className="text-xs text-muted-foreground">
              {applicationStatusDescriptions[application.status]}
            </span>
          </div>
          <h3 className="font-display text-2xl text-primary-deep">{application.full_name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Enviada em {formatDate(application.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={() => changeStatus("reviewing")}
            disabled={saving || application.status === "reviewing"}
            loading={savingAction === "reviewing"}
          >
            <Clock3 className="size-4" />
            Em análise
          </ActionButton>
          <ActionButton
            onClick={() => changeStatus("changes_requested")}
            disabled={saving || application.status === "changes_requested"}
            loading={savingAction === "changes_requested"}
          >
            <Mail className="size-4" />
            Pedir ajustes
          </ActionButton>
          <ActionButton
            onClick={() => changeStatus("rejected")}
            disabled={saving || application.status === "rejected"}
            loading={savingAction === "rejected"}
          >
            <XCircle className="size-4" />
            Recusar
          </ActionButton>
          <button
            type="button"
            onClick={approve}
            disabled={saving || application.status === "approved"}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingAction === "approve" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Aprovar e criar perfil
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem icon={<Mail className="size-4" />} label="E-mail" value={application.email} />
            <InfoItem
              icon={<Phone className="size-4" />}
              label="Telefone"
              value={application.phone}
            />
            <InfoItem
              icon={<MapPin className="size-4" />}
              label="Localização"
              value={[application.city, application.country].filter(Boolean).join(" · ")}
            />
            <InfoItem
              icon={<CheckCircle2 className="size-4" />}
              label="Formação"
              value={application.formation}
            />
          </div>

          {application.bio && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Resumo
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-foreground/78">{application.bio}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TagGroup label="Especialidades" values={application.specialties} />
            <TagGroup label="Idiomas" values={application.languages} />
          </div>

          {application.links && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Links
              </h4>
              <p className="mt-2 break-words text-sm text-foreground/78">{application.links}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
          <label
            htmlFor={`notes-${application.id}`}
            className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Notas internas
          </label>
          <textarea
            id={`notes-${application.id}`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={7}
            className="input mt-2"
            placeholder="Anote pendências, decisão ou próximos passos."
          />
          <button
            type="button"
            onClick={() => changeStatus(application.status)}
            disabled={saving}
            className="mt-3 min-h-10 w-full rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Salvar notas
          </button>
        </div>
      </div>
    </article>
  );
}

const profileStatusOrder: Array<ProfileChangeStatus | "all"> = [
  "all",
  "pending",
  "reviewing",
  "approved",
  "rejected",
];

const profileStatusStyles: Record<ProfileChangeStatus, string> = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  reviewing: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

function ProfileReviewsPanel({
  requests,
  professionalsById,
  isLoading,
  onRefresh,
}: {
  requests: ProfileChangeRequest[];
  professionalsById: Map<string, Professional>;
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<ProfileChangeStatus | "all">("all");
  const visibleRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  const countByStatus = (status: ProfileChangeStatus | "all") => {
    if (status === "all") return requests.length;
    return requests.filter((request) => request.status === status).length;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Carregando revisões de perfil…
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl text-primary-deep">
            Revisões de perfil ({requests.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aprove alterações enviadas pelos profissionais antes de atualizar a vitrine pública.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {profileStatusOrder.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`min-h-10 rounded-full border px-3 text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {status === "all" ? "Todas" : profileChangeStatusLabels[status]} (
              {countByStatus(status)})
            </button>
          ))}
        </div>
      </div>

      {visibleRequests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <FilePenLine className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhuma revisão encontrada neste filtro.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleRequests.map((request) => (
            <ProfileReviewCard
              key={request.id}
              request={request}
              professional={professionalsById.get(request.professional_id)}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProfileReviewCard({
  request,
  professional,
  onRefresh,
}: {
  request: ProfileChangeRequest;
  professional?: Professional;
  onRefresh: () => void;
}) {
  const [notes, setNotes] = useState(request.admin_notes ?? "");
  const [savingAction, setSavingAction] = useState<ProfileChangeStatus | "approve" | null>(null);
  const payload = profilePayloadFromJson(request.payload);

  useEffect(() => {
    setNotes(request.admin_notes ?? "");
  }, [request.admin_notes, request.id]);

  const changeStatus = async (status: ProfileChangeStatus) => {
    setSavingAction(status);
    try {
      await updateProfileChangeRequest(request.id, {
        status,
        admin_notes: notes.trim() || null,
      });
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao atualizar revisão");
    } finally {
      setSavingAction(null);
    }
  };

  const approve = async () => {
    if (!confirm("Aprovar e aplicar estas alterações ao perfil público?")) return;

    setSavingAction("approve");
    try {
      await approveProfileChangeRequest(request, notes);
      alert("Alterações aprovadas e aplicadas ao perfil.");
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao aprovar revisão");
    } finally {
      setSavingAction(null);
    }
  };

  const saving = Boolean(savingAction);
  const isApproved = request.status === "approved";

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-bold ${profileStatusStyles[request.status]}`}
            >
              {profileChangeStatusLabels[request.status]}
            </span>
            <span className="text-xs text-muted-foreground">
              {profileChangeStatusDescriptions[request.status]}
            </span>
          </div>
          <h3 className="font-display text-2xl text-primary-deep">
            {professional?.name ?? "Perfil profissional"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Enviada em {formatDate(request.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={() => changeStatus("reviewing")}
            disabled={saving || isApproved || request.status === "reviewing"}
            loading={savingAction === "reviewing"}
          >
            <Clock3 className="size-4" />
            Em análise
          </ActionButton>
          <ActionButton
            onClick={() => changeStatus("rejected")}
            disabled={saving || isApproved || request.status === "rejected"}
            loading={savingAction === "rejected"}
          >
            <XCircle className="size-4" />
            Recusar
          </ActionButton>
          <button
            type="button"
            onClick={approve}
            disabled={saving || isApproved}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingAction === "approve" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FilePenLine className="size-4" />
            )}
            Aprovar alterações
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <ProfilePayloadDiff payload={payload} />

        <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
          <label
            htmlFor={`profile-notes-${request.id}`}
            className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Notas internas
          </label>
          <textarea
            id={`profile-notes-${request.id}`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={7}
            className="input mt-2"
            placeholder="Registre a decisão ou o motivo da recusa."
          />
          <button
            type="button"
            onClick={() => changeStatus(request.status)}
            disabled={saving}
            className="mt-3 min-h-10 w-full rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Salvar notas
          </button>
        </div>
      </div>
    </article>
  );
}

function ProfilePayloadDiff({ payload }: { payload: ProfileChangePayload }) {
  const modality =
    [payload.online ? "Online" : null, payload.in_person ? "Presencial" : null]
      .filter(Boolean)
      .join(" + ") || "Não informado";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ProfilePayloadItem label="Cidade" value={payload.city} />
      <ProfilePayloadItem label="País" value={payload.country} />
      <ProfilePayloadItem label="Especialidades" value={payload.specialties.join(", ")} />
      <ProfilePayloadItem label="Idiomas" value={payload.languages.join(", ")} />
      <ProfilePayloadItem label="Contato" value={payload.contact_url} />
      <ProfilePayloadItem label="Foto" value={payload.photo_url} />
      <ProfilePayloadItem label="Links" value={payload.social_media} />
      <ProfilePayloadItem label="Modalidade" value={modality} />
      <ProfilePayloadItem label="Resumo" value={payload.bio} className="sm:col-span-2" />
    </div>
  );
}

function ProfilePayloadItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border/60 bg-muted/25 p-3 ${className}`}>
      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </h4>
      <p className="mt-2 break-words text-sm leading-relaxed text-foreground/80">
        {value || "Não informado"}
      </p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-medium text-foreground">
        {value || "Não informado"}
      </p>
    </div>
  );
}

function TagGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </h4>
      {values.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-lg border border-primary/15 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-deep"
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Não informado</p>
      )}
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function EditorDialog({
  pro,
  onClose,
  onSaved,
}: {
  pro: Professional | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !pro;
  const [form, setForm] = useState({
    name: pro?.name ?? "",
    city: pro?.city ?? "",
    country: pro?.country ?? "",
    bio: pro?.bio ?? "",
    specialties: pro?.specialties.join(", ") ?? "",
    languages: pro?.languages.join(", ") ?? "",
    contact_url: pro?.contact_url ?? "",
    photo_url: pro?.photo_url ?? "",
    online: pro?.online ?? true,
    in_person: pro?.in_person ?? false,
    published: pro?.published ?? true,
    sort_order: pro?.sort_order ?? 999,
    social_media: pro?.social_media ?? "",
    owner_email: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("professional-photos")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("professional-photos").getPublicUrl(path);
      set("photo_url", data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        bio: form.bio.trim() || null,
        specialties: form.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        languages: form.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        contact_url: form.contact_url.trim() || null,
        photo_url: form.photo_url.trim() || null,
        online: form.online,
        in_person: form.in_person,
        published: form.published,
        sort_order: Number(form.sort_order) || 0,
        social_media: form.social_media.trim() || null,
      };
      if (isNew) {
        const { error } = await supabase.from("professionals").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("professionals").update(payload).eq("id", pro!.id);
        if (error) throw error;
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!pro) return;
    if (!confirm(`Remover ${pro.name}? Esta ação não pode ser desfeita.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("professionals").delete().eq("id", pro.id);
      if (error) throw error;
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover");
      setSaving(false);
    }
  };

  const linkOwner = async () => {
    if (!pro) return;
    const email = form.owner_email.trim();
    if (!email) {
      setError("Informe o e-mail de login do profissional.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await linkProfessionalOwnerByEmail(pro.id, email);
      alert("Perfil vinculado ao login profissional.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao vincular login profissional");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl border border-border p-6 max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl mb-6">
          {isNew ? "Novo profissional" : "Editar profissional"}
        </h2>

        <div className="space-y-4">
          <Field label="Nome">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cidade, Estado">
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="País">
              <input
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Bio curta">
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={3}
              className="input"
            />
          </Field>

          <Field label="Especialidades (separe por vírgula)">
            <input
              value={form.specialties}
              onChange={(e) => set("specialties", e.target.value)}
              placeholder="Psicogenealogia, Cabalá, …"
              className="input"
            />
          </Field>

          <Field label="Idiomas (separe por vírgula)">
            <input
              value={form.languages}
              onChange={(e) => set("languages", e.target.value)}
              placeholder="Português, Inglês, …"
              className="input"
            />
          </Field>

          <Field label="Link de contato (WhatsApp, site, etc.)">
            <input
              value={form.contact_url}
              onChange={(e) => set("contact_url", e.target.value)}
              placeholder="https://wa.me/55..."
              className="input"
            />
          </Field>

          <Field label="Redes Sociais (Instagram, Site)">
            <input
              value={form.social_media}
              onChange={(e) => set("social_media", e.target.value)}
              placeholder="@instagram, www.site.com"
              className="input"
            />
          </Field>

          {!isNew && (
            <Field label="Login do profissional">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  type="email"
                  autoComplete="email"
                  value={form.owner_email}
                  onChange={(e) => set("owner_email", e.target.value)}
                  placeholder="email cadastrado no login"
                  className="input"
                />
                <button
                  type="button"
                  onClick={linkOwner}
                  disabled={saving || !form.owner_email.trim()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Link2 className="size-4" />
                  Vincular
                </button>
              </div>
              {pro.owner_user_id ? (
                <p className="mt-2 text-xs text-primary-deep">
                  Este perfil já tem uma conta profissional vinculada.
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Use o mesmo e-mail que o profissional utiliza para entrar na plataforma.
                </p>
              )}
            </Field>
          )}

          <Field label="Foto">
            <div className="flex items-center gap-4">
              {form.photo_url && (
                <img
                  src={form.photo_url}
                  alt=""
                  className="size-16 rounded-full object-cover border border-border"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={upload}
                disabled={uploading}
                className="text-sm"
              />
              {form.photo_url && (
                <button
                  type="button"
                  onClick={() => set("photo_url", "")}
                  className="text-xs text-destructive"
                >
                  Remover
                </button>
              )}
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Ordem">
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
                className="input"
              />
            </Field>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.online}
                onChange={(e) => set("online", e.target.checked)}
              />
              Online
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.in_person}
                onChange={(e) => set("in_person", e.target.checked)}
              />
              Presencial
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Visível no site
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-3 mt-8">
          {!isNew ? (
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              className="text-sm text-destructive hover:underline"
            >
              Remover
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm border border-border rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || uploading || !form.name.trim()}
              className="px-5 py-2 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
