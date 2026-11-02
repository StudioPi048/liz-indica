/** Pure helpers for the Hero rotating carousel (circular, one step at a time). */

export function wrapIndex(index: number, size: number) {
  if (size <= 0) return 0;
  return ((index % size) + size) % size;
}

/** Indices shown at once, starting at `index`; never repeats a person when size < count. */
export function visibleWindow(index: number, size: number, count: number) {
  const n = Math.min(Math.max(count, 0), size);
  return Array.from({ length: n }, (_, i) => wrapIndex(index + i, size));
}

/** Indices the first slot visits in one full cycle starting at `start` (each exactly once). */
export function cycleSequence(size: number, start: number) {
  return Array.from({ length: size }, (_, step) => wrapIndex(start + step, size));
}

/** The next indices to warm up (only the one(s) that enter on the next step). */
export function prefetchIndices(index: number, size: number, count: number, ahead = 1) {
  if (size <= count) return [];
  return Array.from({ length: ahead }, (_, i) => wrapIndex(index + count + i, size));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-ZÀ-Ý]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Autoplay runs only when nothing asks it to stop; explicit pause always wins. */
export function isAutoplayActive(s: {
  userPaused: boolean;
  hover: boolean;
  focusWithin: boolean;
  offscreen: boolean;
  tabHidden: boolean;
  size: number;
  count: number;
}) {
  return !s.userPaused && !s.hover && !s.focusWithin && !s.offscreen && !s.tabHidden && s.size > s.count;
}
