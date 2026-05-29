import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchProfessionals,
  getInitials,
  type Professional,
} from "@/lib/professionals-api";
import { useAdmin } from "@/hooks/use-admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LIZ INDICA" },
      { name: "robots", content: "noindex,nofollow" },
    ],
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
    queryKey: ["professionals"],
    queryFn: () => fetchProfessionals({ fallbackOnEmpty: false, fallbackOnError: false }),
    enabled: isAdmin,
  });

  const [editing, setEditing] = useState<Professional | null>(null);
  const [creating, setCreating] = useState(false);

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
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

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["professionals"] });

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

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">
            Mentorados ({professionals.length})
          </h2>
          <button
            onClick={() => setCreating(true)}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary-deep"
          >
            + Novo profissional
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : (
          <div className="grid gap-3">
            {professionals.map((p) => (
              <button
                key={p.id}
                onClick={() => setEditing(p)}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl text-left hover:border-primary transition-colors"
              >
                {p.photo_url ? (
                  <img src={p.photo_url} alt="" className="size-12 rounded-full object-cover" />
                ) : (
                  <div className="size-12 rounded-full bg-primary-soft grid place-items-center font-display text-sm text-primary-deep">
                    {getInitials(p.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[p.city, p.country].filter(Boolean).join(" · ") || "Sem localização"}
                    {!p.published && " · oculto"}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Editar →</span>
              </button>
            ))}
          </div>
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
      const { data } = supabase.storage
        .from("professional-photos")
        .getPublicUrl(path);
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
      };
      if (isNew) {
        const { error } = await supabase.from("professionals").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("professionals")
          .update(payload)
          .eq("id", pro!.id);
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
      const { error } = await supabase
        .from("professionals")
        .delete()
        .eq("id", pro.id);
      if (error) throw error;
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover");
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
            <Field label="Cidade">
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
          ) : <span />}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
