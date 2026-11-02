import { describe, expect, it } from "vitest";
import { cycleSequence, isAutoplayActive, prefetchIndices, visibleWindow, wrapIndex } from "../carousel";

const base = { userPaused: false, hover: false, focusWithin: false, offscreen: false, tabHidden: false, size: 70, count: 3 };

describe("hero carousel cycle", () => {
  it.each([1, 2, 70])("visits every one of %i people once before repeating, from any start", (size) => {
    for (const start of [0, Math.floor(size / 2), size - 1]) {
      const seq = cycleSequence(size, start);
      expect(seq).toHaveLength(size);
      expect(new Set(seq).size).toBe(size);
      expect(seq[0]).toBe(start);
      expect(wrapIndex(start + size, size)).toBe(start); // next step repeats the start
    }
  });

  it("includes profiles without photo (ids, not photos, drive the cycle)", () => {
    const people = [{ id: "a", photo_url: "x" }, { id: "b", photo_url: null }, { id: "c", photo_url: "y" }];
    const ids = cycleSequence(people.length, 2).map((i) => people[i].id);
    expect(ids.sort()).toEqual(["a", "b", "c"]);
  });

  it("next/previous wrap around both ends", () => {
    expect(wrapIndex(69 + 1, 70)).toBe(0);
    expect(wrapIndex(0 - 1, 70)).toBe(69);
    expect(wrapIndex(-1, 1)).toBe(0);
  });

  it("window never duplicates people in small sets", () => {
    expect(visibleWindow(0, 1, 3)).toEqual([0]);
    expect(visibleWindow(1, 2, 3)).toEqual([1, 0]);
    expect(visibleWindow(69, 70, 3)).toEqual([69, 0, 1]);
  });

  it("prefetches only the next entering card", () => {
    expect(prefetchIndices(68, 70, 3)).toEqual([1]);
    expect(prefetchIndices(0, 2, 3)).toEqual([]);
  });

  it("autoplay stops on explicit pause, hover, focus, offscreen, hidden tab, or tiny sets", () => {
    expect(isAutoplayActive(base)).toBe(true);
    for (const k of ["userPaused", "hover", "focusWithin", "offscreen", "tabHidden"] as const) {
      expect(isAutoplayActive({ ...base, [k]: true })).toBe(false);
    }
    // explicit pause still wins after hover ends
    expect(isAutoplayActive({ ...base, userPaused: true, hover: false })).toBe(false);
    expect(isAutoplayActive({ ...base, size: 3 })).toBe(false);
  });
});
