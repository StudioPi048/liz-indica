import { describe, expect, it } from "vitest";
import { advanceOffset, cloneCount, cycleSequence, isAutoplayActive, wrapIndex, wrapOffset } from "../carousel";

const base = { userPaused: false, hover: false, focusWithin: false, touching: false, offscreen: false, tabHidden: false, size: 70 };

describe("hero portrait strip", () => {
  it.each([1, 2, 70])("visits every one of %i people once per loop, from any start", (size) => {
    for (const start of [0, Math.floor(size / 2), size - 1]) {
      const seq = cycleSequence(size, start);
      expect(new Set(seq).size).toBe(size);
      expect(seq[0]).toBe(start);
      expect(wrapIndex(start + size, size)).toBe(start);
    }
  });

  it("includes profiles without photo (ids drive the sequence)", () => {
    const people = [{ id: "a", photo_url: "x" }, { id: "b", photo_url: null }, { id: "c", photo_url: "y" }];
    expect(cycleSequence(3, 2).map((i) => people[i].id).sort()).toEqual(["a", "b", "c"]);
  });

  it("moves at constant speed: 26px/s for 1s = 26px, progressive", () => {
    expect(advanceOffset(100, 26, 1000, 10000)).toBeCloseTo(126);
    expect(advanceOffset(100, 26, 500, 10000)).toBeCloseTo(113);
  });

  it("wraps at the seam without a jump (offset continuity modulo set width)", () => {
    const setWidth = 70 * 224;
    const before = setWidth - 5;
    const after = advanceOffset(before, 26, 1000, setWidth);
    expect(after).toBeCloseTo(21);
    expect(wrapOffset(-10, setWidth)).toBeCloseTo(setWidth - 10);
  });

  it("clones only enough to fill the viewport, never the whole set twice", () => {
    expect(cloneCount(1440, 232, 70)).toBe(8);
    expect(cloneCount(390, 176, 70)).toBe(4);
    expect(cloneCount(1440, 232, 3)).toBe(3);
  });

  it("explicit pause wins; hover/focus/touch/offscreen/tab stop it", () => {
    expect(isAutoplayActive(base)).toBe(true);
    for (const k of ["userPaused", "hover", "focusWithin", "touching", "offscreen", "tabHidden"] as const) {
      expect(isAutoplayActive({ ...base, [k]: true })).toBe(false);
    }
  });
});
