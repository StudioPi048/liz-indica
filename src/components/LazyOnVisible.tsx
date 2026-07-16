import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

type LazyOnVisibleProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  label?: string;
  loadOnIdle?: boolean;
  minHeight: number;
  rootMargin?: string;
};

export function LazyOnVisible({
  children,
  className = "",
  id,
  label,
  loadOnIdle = false,
  minHeight,
  rootMargin = "480px 0px",
}: LazyOnVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  useEffect(() => {
    if (shouldRender || !loadOnIdle || typeof window === "undefined") return;

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setShouldRender(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(() => setShouldRender(true), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [loadOnIdle, shouldRender]);

  return (
    <div id={id} ref={ref} className={className} style={shouldRender ? undefined : { minHeight }}>
      {shouldRender ? (
        <Suspense fallback={<SectionPlaceholder minHeight={minHeight} label={label} />}>
          {children}
        </Suspense>
      ) : (
        <SectionPlaceholder minHeight={minHeight} label={label} />
      )}
    </div>
  );
}

function SectionPlaceholder({ minHeight, label }: { minHeight: number; label?: string }) {
  return (
    <div
      className="grid place-items-center bg-background px-6"
      style={{ minHeight }}
      aria-label={label}
      aria-busy="true"
    >
      <div className="w-full max-w-6xl space-y-5" aria-hidden="true">
        <div className="h-4 w-32 rounded-full bg-muted" />
        <div className="h-12 w-full max-w-lg rounded-2xl bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-2xl border border-border bg-card/70" />
          <div className="h-40 rounded-2xl border border-border bg-card/70" />
        </div>
      </div>
    </div>
  );
}
