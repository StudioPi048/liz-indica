# AGENTS

- Directory listing uses `dedupeForDirectory` (same name + same photo shown once); never delete records to dedupe — all profiles stay reachable by URL.
- Profile contact comes only from `getPrimaryContact` (contact field first, then site/Instagram from social field); never invent a channel, show an honest note when null.
- Profile bios render in full, paragraph by paragraph, with no inferred headings (e.g. never label a paragraph "Formação").
- Favorites live only in localStorage (`liz-favoritos`) via `useFavorites`; no login or backend.
- Tests: `bunx vitest run` (src/lib/__tests__).
- Home journey order is Hero (guided Online/Presencial choice) → HowItWorks strip → Directory → About → Stats → form; Hero talks to Directory only via `goToDirectory` (URL + `liz-directory-search` event). Why: one predictable path for criteria.
- Portrait photos are always shown whole (`object-contain`) with no CSS filter. Why: owner requires original photos intact.
- Product facts live in PRODUCT.md, visual system in DESIGN.md; keep them current when composition changes.
- Hero people area is `HeroCarousel` fed with the full `dedupeForDirectory` list (no slice, no photo filter); cycle logic lives in pure `src/lib/carousel.ts` with tests. Why: no fixed highlights; every person rotates with equal timing.
