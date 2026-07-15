import logoLiz from "@/assets/logo-liz.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <a href="/" className="flex items-center gap-4">
          <img
            src={logoLiz}
            alt="Instituto LIZ"
            width={64}
            height={64}
            className="size-14 md:size-16 object-contain drop-shadow-md"
          />
          <span className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-2">
            <span className="font-display text-2xl md:text-3xl font-bold tracking-wide text-white">
              LIZ
            </span>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#F1DFD1]">
              Indica
            </span>
          </span>
        </a>
        <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
          <a href="#diretorio" className="text-white/80 hover:text-white transition-colors">
            Diretório
          </a>
          <a href="#instituto" className="text-white/80 hover:text-white transition-colors">
            O Instituto
          </a>
          <a
            href="#indicado"
            className="px-6 py-2.5 bg-white text-black rounded-full hover:bg-white/90 transition-all font-semibold"
          >
            Quero ser Indicado
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="py-12 px-6 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <img
            src={logoLiz}
            alt="Instituto LIZ"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold text-primary-deep">
              LIZ
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Indica
            </span>
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest">
          © 2026 Instituto LIZ · Rede oficial de psicogenealogistas ·{" "}
          <a href="/auth" className="hover:text-primary transition-colors">Admin</a>
        </p>
      </div>
    </footer>
  );
}
