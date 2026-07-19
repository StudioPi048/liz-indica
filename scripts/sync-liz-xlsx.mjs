import { execFileSync } from "node:child_process";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const workbookPath =
  process.env.LIZ_XLSX_PATH ||
  "/Users/pietrobaccin/Downloads/planilha geral profissionais - atualizada.xlsx";
const applyChanges = process.argv.includes("--apply");

function requireEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) {
    const hint = fallbackName ? `${name} or ${fallbackName}` : name;
    throw new Error(`Missing required environment variable: ${hint}`);
  }
  return value;
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeComparableText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  const text = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  return text || null;
}

function mergeMissing(current, next) {
  if (!cleanText(current) && cleanText(next)) return cleanText(next);
  return current ?? null;
}

function fieldScore(field, value) {
  const text = cleanText(value);
  if (!text) return 0;
  if (field === "contact_url") {
    if (/^https:\/\/wa\.me\/\d{10,}$/i.test(text)) return 80;
    if (/^mailto:/i.test(text)) return 70;
    if (/https?:\/\//i.test(text)) return 60;
    if (text.replace(/\D/g, "").length >= 10) return 50;
  }
  if (field === "social_media") {
    if (/@[a-z0-9_.]+/i.test(text)) return 60 + Math.min(text.length, 80);
  }
  return Math.min(text.length, 200);
}

function preferField(field, a, b) {
  return fieldScore(field, b) > fieldScore(field, a) ? b : a;
}

function rowCompletenessScore(row) {
  return (
    fieldScore("bio", row.bio) +
    fieldScore("social_media", row.social_media) +
    fieldScore("contact_url", row.contact_url) +
    (row.photo_url ? 100 : 0) +
    (row.specialties?.length ?? 0) * 15 -
    (row.sort_order ?? 0) / 1000
  );
}

function extractSpecialties(bio) {
  if (!bio) return [];
  const categories = {
    Psicogenealogia: ["psicogenealog", "genossociograma"],
    "Constelação Familiar": ["constela", "sistemica", "sistêmica", "sistêmico", "sistemico"],
    "Terapias Manuais": [
      "fisioterap",
      "microfisioterapia",
      "massoterapia",
      "osteopata",
      "acupuntura",
      "reiki",
      "quiropraxia",
    ],
    "Ciência & Mente": [
      "neurociência",
      "neurociencias",
      "psicanal",
      "psicolog",
      "hipnoterap",
      "pnl",
      "coach",
      "neuro",
    ],
    "Energético & Espiritual": [
      "cabala",
      "cabalá",
      "tarô",
      "astrolog",
      "radiestesia",
      "thetahealing",
      "holística",
      "espiritual",
    ],
    "Medicina & Saúde": [
      "medicina germânica",
      "leitura biológica",
      "biologia",
      "odontologia",
      "enfermagem",
      "saúde",
    ],
  };
  const lowerBio = bio.toLowerCase();
  const found = new Set();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerBio.includes(keyword))) found.add(category);
  }
  return [...found];
}

function extractContactUrl(contact) {
  const value = cleanText(contact);
  if (!value) return null;
  if (/^op[cç][aã]o\s*1$/i.test(value)) return null;

  const emailMatch = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 10 && !emailMatch) {
    let phone = digits;
    if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
    return `https://wa.me/${phone}`;
  }
  if (emailMatch && value.trim() === emailMatch[0]) return `mailto:${emailMatch[0]}`;
  return value;
}

function readWorkbook(filePath) {
  const python = process.env.PYTHON || "python3";
  const code = String.raw`
import json
import sys
import openpyxl

workbook = openpyxl.load_workbook(sys.argv[1], data_only=True)
sheet = workbook.active
headers = [str(cell.value).strip() if cell.value is not None else "" for cell in sheet[2]]
records = []
for row in sheet.iter_rows(min_row=3, values_only=True):
    if any(value not in (None, "") for value in row):
        records.append(dict(zip(headers, row)))
print(json.dumps(records, ensure_ascii=False, default=str))
`;
  const output = execFileSync(python, ["-c", code, filePath], { encoding: "utf8" });
  return JSON.parse(output);
}

function toSheetRecord(row) {
  return {
    name: cleanText(row["Nome completo do MENTORADO"]),
    social_media: cleanText(row["QUAL(IS) SÃO SUAS MÍDIAS SOCIAIS"]),
    contact: cleanText(row["QUAL É O CONTATO QUE VOC AUTORIZA DIVULGAR?"]),
    bio: cleanText(row["MENCIONE SEU BREVE CURRÍCULO"]),
  };
}

function mergeSheetRows(rows) {
  const byName = new Map();
  const conflicts = [];

  for (const row of rows.map(toSheetRecord).filter((row) => row.name)) {
    const key = normalizeName(row.name);
    if (!byName.has(key)) {
      byName.set(key, { ...row, sourceRows: 1 });
      continue;
    }

    const existing = byName.get(key);
    existing.sourceRows += 1;
    for (const field of ["social_media", "contact", "bio"]) {
      if (!existing[field] && row[field]) {
        existing[field] = row[field];
        continue;
      }
      if (
        row[field] &&
        existing[field] &&
        normalizeComparableText(row[field]) !== normalizeComparableText(existing[field])
      ) {
        conflicts.push({ name: existing.name, field });
      }
    }
  }

  return { records: [...byName.values()], conflicts };
}

function buildPatch(current, sheetRecord) {
  const contactUrl = extractContactUrl(sheetRecord.contact);
  const nextBio = mergeMissing(current.bio, sheetRecord.bio);
  const nextSocialMedia = mergeMissing(current.social_media, sheetRecord.social_media);
  const nextContactUrl = mergeMissing(current.contact_url, contactUrl);
  const nextSpecialties =
    (current.specialties?.length ?? 0) > 0 ? current.specialties : extractSpecialties(nextBio);

  const patch = {
    bio: nextBio,
    social_media: nextSocialMedia,
    contact_url: nextContactUrl,
    specialties: nextSpecialties,
  };

  const changed = Object.entries(patch).some(([key, value]) => {
    const currentValue = current[key];
    if (Array.isArray(value) || Array.isArray(currentValue)) {
      return JSON.stringify(value ?? []) !== JSON.stringify(currentValue ?? []);
    }
    return normalizeComparableText(value) !== normalizeComparableText(currentValue);
  });

  return changed ? patch : null;
}

const supabase = createClient(
  requireEnv("SUPABASE_URL", "VITE_SUPABASE_URL"),
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    requireEnv("SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"),
);

if (applyChanges && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Applying changes requires SUPABASE_SERVICE_ROLE_KEY or SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD in .env.",
    );
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Admin login failed: ${error.message}`);
}

const rawRows = readWorkbook(path.resolve(workbookPath));
const { records: sheetRecords, conflicts } = mergeSheetRows(rawRows);

const { data: currentRecords, error: fetchError } = await supabase
  .from("professionals")
  .select("*")
  .order("sort_order", { ascending: true })
  .order("name", { ascending: true });

if (fetchError) throw fetchError;

const currentByName = new Map();
const currentGroups = new Map();
for (const current of currentRecords ?? []) {
  const key = normalizeName(current.name);
  if (!currentGroups.has(key)) currentGroups.set(key, []);
  currentGroups.get(key).push(current);
  if (!currentByName.has(key)) currentByName.set(key, current);
}

const duplicateGroups = [...currentGroups.values()].filter((group) => group.length > 1);

const updates = [];
const inserts = [];
for (const sheetRecord of sheetRecords) {
  const current = currentByName.get(normalizeName(sheetRecord.name));
  if (!current) {
    inserts.push({
      name: sheetRecord.name,
      city: null,
      country: null,
      bio: sheetRecord.bio,
      specialties: extractSpecialties(sheetRecord.bio),
      languages: [],
      photo_url: null,
      contact_url: extractContactUrl(sheetRecord.contact),
      social_media: sheetRecord.social_media,
      online: true,
      in_person: true,
      sort_order: (currentRecords?.length ?? 0) + inserts.length,
      published: true,
    });
    continue;
  }

  const patch = buildPatch(current, sheetRecord);
  if (patch) updates.push({ id: current.id, name: current.name, patch });
}

const dedupeUpdates = [];
const unpublishes = [];
for (const group of duplicateGroups) {
  const canonical = [...group].sort((a, b) => rowCompletenessScore(b) - rowCompletenessScore(a))[0];
  const merged = group.reduce(
    (acc, row) => ({
      ...acc,
      bio: preferField("bio", acc.bio, row.bio),
      social_media: preferField("social_media", acc.social_media, row.social_media),
      contact_url: preferField("contact_url", acc.contact_url, row.contact_url),
      photo_url: acc.photo_url || row.photo_url,
      specialties:
        (acc.specialties?.length ?? 0) >= (row.specialties?.length ?? 0)
          ? acc.specialties
          : row.specialties,
    }),
    { ...canonical },
  );

  const canonicalPatch = {
    bio: merged.bio,
    social_media: merged.social_media,
    contact_url: merged.contact_url,
    photo_url: merged.photo_url,
    specialties: merged.specialties,
    published: true,
  };
  const canonicalChanged = Object.entries(canonicalPatch).some(([key, value]) => {
    const currentValue = canonical[key];
    if (Array.isArray(value) || Array.isArray(currentValue)) {
      return JSON.stringify(value ?? []) !== JSON.stringify(currentValue ?? []);
    }
    return normalizeComparableText(value) !== normalizeComparableText(currentValue);
  });
  if (canonicalChanged) {
    dedupeUpdates.push({ id: canonical.id, name: canonical.name, patch: canonicalPatch });
  }

  for (const duplicate of group) {
    if (duplicate.id !== canonical.id && duplicate.published) {
      unpublishes.push({ id: duplicate.id, name: duplicate.name, sort_order: duplicate.sort_order });
    }
  }
}

console.log(
  JSON.stringify(
    {
      mode: applyChanges ? "apply" : "dry-run",
      sheetRows: rawRows.length,
      sheetUniqueNames: sheetRecords.length,
      siteRecords: currentRecords?.length ?? 0,
      sheetDuplicateConflicts: conflicts.length,
      siteDuplicateNames: duplicateGroups.map((group) => group[0].name),
      updates: updates.length,
      inserts: inserts.length,
      duplicateMerges: dedupeUpdates.length,
      duplicateUnpublishes: unpublishes.length,
      updateNames: updates.map((item) => item.name),
      insertNames: inserts.map((item) => item.name),
      duplicateMergeNames: dedupeUpdates.map((item) => item.name),
      duplicateUnpublishNames: unpublishes.map((item) => item.name),
    },
    null,
    2,
  ),
);

if (!applyChanges) {
  console.log("Dry-run only. Re-run with --apply to write changes.");
  process.exit(0);
}

for (const update of updates) {
  const { data, error } = await supabase
    .from("professionals")
    .update(update.patch)
    .eq("id", update.id)
    .select("id");
  if (error) throw new Error(`Failed to update ${update.name}: ${error.message}`);
  if (!data?.length) throw new Error(`No row updated for ${update.name}. Check RLS/admin access.`);
}

for (const update of dedupeUpdates) {
  const { data, error } = await supabase
    .from("professionals")
    .update(update.patch)
    .eq("id", update.id)
    .select("id");
  if (error) throw new Error(`Failed to merge duplicate ${update.name}: ${error.message}`);
  if (!data?.length) throw new Error(`No row merged for ${update.name}. Check RLS/admin access.`);
}

for (const duplicate of unpublishes) {
  const { data, error } = await supabase
    .from("professionals")
    .update({ published: false })
    .eq("id", duplicate.id)
    .select("id");
  if (error) throw new Error(`Failed to unpublish duplicate ${duplicate.name}: ${error.message}`);
  if (!data?.length) {
    throw new Error(`No row unpublished for ${duplicate.name}. Check RLS/admin access.`);
  }
}

if (inserts.length > 0) {
  const { data, error } = await supabase.from("professionals").insert(inserts).select("id");
  if (error) throw new Error(`Failed to insert professionals: ${error.message}`);
  if (data?.length !== inserts.length) throw new Error("Not all professionals were inserted.");
}

console.log(
  `Applied ${updates.length} updates, ${dedupeUpdates.length} duplicate merges, ${unpublishes.length} duplicate unpublishes and ${inserts.length} inserts.`,
);
