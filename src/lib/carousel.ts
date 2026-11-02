/** Pure helpers for the Hero continuous portrait strip (one logical sequence + visual clones). */

export function wrapIndex(index: number, size: number) {
  if (size <= 0) return 0;
  return ((index % size) + size) % size;
}

/** Wraps a scroll offset into [0, setWidth) so the loop never jumps visually. */
export function wrapOffset(pos: number, setWidth: number) {
  if (setWidth <= 0) return 0;
  return ((pos % setWidth) + setWidth) % setWidth;
}

/** Advances an offset by constant speed (px/s) over dt (ms), wrapped to the set width. */
export function advanceOffset(pos: number, speedPxPerSec: number, dtMs: number, setWidth: number) {
  return wrapOffset(pos + (speedPxPerSec * Math.max(0, dtMs)) / 1000, setWidth);
}

/**
 * How many leading items must be repeated (aria-hidden clones) after the full set
 * so the viewport is always filled at the loop seam. Never more than the set itself.
 */
export function cloneCount(viewportWidth: number, pitch: number, size: number) {
  if (size <= 0 || !(pitch > 0) || !(viewportWidth >= 0)) return Math.min(size, 1);
  return Math.min(size, Math.ceil(viewportWidth / pitch) + 1);
}

/** Indices the strip shows in one full loop starting at `start` (each exactly once). */
export function cycleSequence(size: number, start: number) {
  return Array.from({ length: size }, (_, step) => wrapIndex(start + step, size));
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
  touching?: boolean;
  offscreen: boolean;
  tabHidden: boolean;
  size: number;
}) {
  return !s.userPaused && !s.hover && !s.focusWithin && !s.touching && !s.offscreen && !s.tabHidden && s.size > 1;
}
