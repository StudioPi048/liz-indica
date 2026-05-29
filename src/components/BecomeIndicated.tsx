import { useState } from "react";

export function BecomeIndicated() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="indicado"
      className="py-24 px-6 bg-background scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary-soft to-card border border-border rounded-3xl p-8 md:p-16 grid md:grid-cols-[1fr_1.2fr] gap-12 items-center shadow-[var(--shadow-card)]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Quero ser indicado
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-6 text-balance">
            É aluno do Instituto LIZ?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Solicite sua indicação oficial e ganhe visibilidade global como
            psicogenealogista certificado. Após análise da equipe, seu perfil
            será publicado no diretório.
          </p>
        </div>

        {submitted ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="font-display text-2xl text-primary mb-2">
              Solicitação recebida
            </div>
            <p className="text-sm text-muted-foreground">
              Entraremos em contato em até 5 dias úteis.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="bg-card border border-border rounded-2xl p-6 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="text"
                placeholder="Nome completo"
                className="h-11 px-4 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring text-sm col-span-2"
              />
              <input
                required
                type="email"
                placeholder="E-mail"
                className="h-11 px-4 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <input
                required
                type="tel"
                placeholder="Telefone"
                className="h-11 px-4 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <input
                required
                type="text"
                placeholder="Cidade"
                className="h-11 px-4 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <input
                required
                type="text"
                placeholder="País"
                className="h-11 px-4 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <input
                required
                type="text"
                placeholder="Formação realizada"
                className="h-11 px-4 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring text-sm col-span-2"
              />
            </div>
            <button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-deep transition-colors"
            >
              Solicitar indicação oficial
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
