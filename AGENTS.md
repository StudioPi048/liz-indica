# AGENTS

- Directory listing uses `dedupeForDirectory` (same name + same photo shown once); never delete records to dedupe — all profiles stay reachable by URL.
- Profile contact comes only from `getPrimaryContact` (contact field first, then site/Instagram from social field); never invent a channel, show an honest note when null.
- Profile bios render in full, paragraph by paragraph, with no inferred headings (e.g. never label a paragraph "Formação").
- Favorites live only in localStorage (`liz-favoritos`) via `useFavorites`; no login or backend.
- Tests: `bunx vitest run` (src/lib/__tests__).
