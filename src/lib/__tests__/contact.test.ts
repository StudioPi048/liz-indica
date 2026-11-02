import { describe, expect, it } from "vitest";
import { dedupeForDirectory, getPrimaryContact } from "../professionals-api";

describe("getPrimaryContact", () => {
  it("prefers the recorded contact field (phone → WhatsApp)", () => {
    const c = getPrimaryContact({ contact_url: "+55 11 99999-0000", social_media: "@x" });
    expect(c?.kind).toBe("whatsapp");
    expect(c?.href).toBe("https://wa.me/5511999990000");
  });
  it("falls back to a site from the social field", () => {
    const c = getPrimaryContact({ contact_url: null, social_media: "@a; www.site.com" });
    expect(c).toEqual({ kind: "site", href: "https://www.site.com", label: "Visitar site" });
  });
  it("falls back to Instagram when only a handle exists", () => {
    const c = getPrimaryContact({ contact_url: null, social_media: "Instagram @nineterocha" });
    expect(c?.href).toBe("https://instagram.com/nineterocha");
  });
  it("returns null when no real channel exists", () => {
    expect(getPrimaryContact({ contact_url: null, social_media: null })).toBeNull();
  });
});

describe("dedupeForDirectory", () => {
  it("keeps distinct people and collapses same name + same photo only", () => {
    const list = [
      { name: "Ana", photo_url: "a.jpg" },
      { name: "Aná", photo_url: "a.jpg" },
      { name: "Ana", photo_url: "b.jpg" },
    ];
    expect(dedupeForDirectory(list)).toHaveLength(2);
  });
});
