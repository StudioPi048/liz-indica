import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import {
  submitProfessionalApplication,
  validateProfessionalApplication,
  type ApplicationValidationErrors,
  type ProfessionalApplicationFormValues,
} from "@/lib/applications-api";

const initialForm: ProfessionalApplicationFormValues = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  formation: "",
  specialties: "",
  languages: "",
  bio: "",
  links: "",
  online: true,
  inPerson: false,
};

type BecomeIndicatedProps = {
  sectionId?: string | null;
};

export function BecomeIndicated({ sectionId = "indicado" }: BecomeIndicatedProps = {}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<ApplicationValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  const set = <K extends keyof ProfessionalApplicationFormValues>(
    key: K,
    value: ProfessionalApplicationFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (website) {
      setSubmitted(true);
      return;
    }

    const nextErrors = validateProfessionalApplication(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitProfessionalApplication(form);
      setSubmitted(true);
      setForm(initialForm);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Não foi possível enviar sua solicitação agora.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id={sectionId ?? undefined} className="relative z-10 scroll-mt-20 bg-background px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Quero ser indicado
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl text-primary-deep md:text-5xl">
            Solicite sua entrada na rede LIZ INDICA
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Se você concluiu formação no Instituto LIZ, envie seus dados para análise da equipe. A
            publicação no diretório acontece após curadoria e conferência das informações.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Solicitação registrada diretamente na fila administrativa.",
              "Perfil aprovado nasce oculto para revisão final.",
              "Contato e dados públicos passam por validação antes da publicação.",
            ].map((item) => (
              <div key={item} className="flex gap-3 text-sm text-foreground/78">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-[var(--shadow-card)] md:p-10">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <div className="mt-4 font-display text-3xl text-primary-deep">Solicitação recebida</div>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Seus dados foram enviados para a equipe LIZ. A próxima etapa é a análise interna e, se
              necessário, o pedido de ajustes antes da publicação.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-primary-deep transition-colors hover:bg-muted"
            >
              Enviar outra solicitação
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-8"
            noValidate
          >
            <input
              type="text"
              name="website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome completo"
                htmlFor="application-full-name"
                error={errors.fullName}
                required
              >
                <input
                  id="application-full-name"
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(event) => set("fullName", event.target.value)}
                  className="input"
                  autoComplete="name"
                />
              </Field>

              <Field label="E-mail" htmlFor="application-email" error={errors.email} required>
                <input
                  id="application-email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => set("email", event.target.value)}
                  className="input"
                  autoComplete="email"
                />
              </Field>

              <Field label="Telefone" htmlFor="application-phone" error={errors.phone} required>
                <input
                  id="application-phone"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(event) => set("phone", event.target.value)}
                  className="input"
                  autoComplete="tel"
                />
              </Field>

              <Field
                label="Formação no Instituto LIZ"
                htmlFor="application-formation"
                error={errors.formation}
                required
              >
                <input
                  id="application-formation"
                  required
                  type="text"
                  value={form.formation}
                  onChange={(event) => set("formation", event.target.value)}
                  className="input"
                  placeholder="Nome da formação ou turma"
                />
              </Field>

              <Field label="Cidade" htmlFor="application-city" error={errors.city} required>
                <input
                  id="application-city"
                  required
                  type="text"
                  value={form.city}
                  onChange={(event) => set("city", event.target.value)}
                  className="input"
                  autoComplete="address-level2"
                />
              </Field>

              <Field label="País" htmlFor="application-country" error={errors.country} required>
                <input
                  id="application-country"
                  required
                  type="text"
                  value={form.country}
                  onChange={(event) => set("country", event.target.value)}
                  className="input"
                  autoComplete="country-name"
                />
              </Field>

              <Field label="Especialidades" htmlFor="application-specialties">
                <input
                  id="application-specialties"
                  type="text"
                  value={form.specialties}
                  onChange={(event) => set("specialties", event.target.value)}
                  className="input"
                  placeholder="Psicogenealogia, Cabalá, Constelação..."
                />
              </Field>

              <Field label="Idiomas" htmlFor="application-languages">
                <input
                  id="application-languages"
                  type="text"
                  value={form.languages}
                  onChange={(event) => set("languages", event.target.value)}
                  className="input"
                  placeholder="Português, Espanhol, Inglês..."
                />
              </Field>

              <Field
                label="Resumo profissional"
                htmlFor="application-bio"
                error={errors.bio}
                className="sm:col-span-2"
                required
              >
                <textarea
                  id="application-bio"
                  required
                  value={form.bio}
                  onChange={(event) => set("bio", event.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Conte brevemente sua trajetória, público atendido e linha de trabalho."
                />
              </Field>

              <Field label="Links públicos" htmlFor="application-links" className="sm:col-span-2">
                <input
                  id="application-links"
                  type="text"
                  value={form.links}
                  onChange={(event) => set("links", event.target.value)}
                  className="input"
                  placeholder="@instagram, site, página de agenda ou outros links"
                />
              </Field>
            </div>

            <fieldset className="mt-5 rounded-xl border border-border/70 p-4">
              <legend className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Modalidade de atendimento
              </legend>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-muted/40 px-4 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.online}
                    onChange={(event) => set("online", event.target.checked)}
                  />
                  Online
                </label>
                <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-muted/40 px-4 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.inPerson}
                    onChange={(event) => set("inPerson", event.target.checked)}
                  />
                  Presencial
                </label>
              </div>
              {errors.modality && (
                <p role="alert" className="mt-2 text-xs text-destructive">
                  {errors.modality}
                </p>
              )}
            </fieldset>

            {submitError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitting ? "Enviando solicitação…" : "Solicitar indicação oficial"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className = "",
  required = false,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-primary" aria-label="obrigatório">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
