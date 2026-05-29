import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso restrito — LIZ INDICA" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-card)]">
        <h1 className="font-display text-3xl mb-1">Área restrita</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Acesso administrativo LIZ INDICA.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-11 px-4 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full h-11 px-4 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary-deep transition-colors disabled:opacity-50"
          >
            {busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 text-xs text-muted-foreground hover:text-primary transition-colors w-full text-center"
        >
          {mode === "login"
            ? "Primeiro acesso? Criar conta"
            : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
