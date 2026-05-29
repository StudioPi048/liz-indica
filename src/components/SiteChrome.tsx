import logoLiz from "@/assets/logo-liz.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img
            src={logoLiz}
            alt="Instituto LIZ"
            width={44}
            height={44}
            className="size-10 object-contain"
          />
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold tracking-tight text-primary-deep">
              LIZ
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Indica
            </span>
          </span>
        </a>
        <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
          <a href="#diretorio" className="hover:text-primary transition-colors">
            Diretório
          </a>
          <a href="#instituto" className="hover:text-primary transition-colors">
            O Instituto
          </a>
          <a
            href="#indicado"
            className="px-5 py-2.5 bg-foreground text-background rounded-full hover:bg-primary transition-all"
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
          © 2026 Instituto LIZ · Rede oficial de psicogenealogistas
        </p>
      </div>
    </footer>
  );
}
