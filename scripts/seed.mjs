import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from "url";

dotenv.config();

function requireEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) {
    const hint = fallbackName ? `${name} or ${fallbackName}` : name;
    throw new Error(`Missing required environment variable: ${hint}`);
  }
  return value;
}

const supabase = createClient(
  requireEnv("SUPABASE_URL", "VITE_SUPABASE_URL"),
  requireEnv("SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"),
);

function extractSpecialties(bio) {
  if (!bio) return [];
  const CATEGORIES = {
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

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some((k) => lowerBio.includes(k))) {
      found.add(category);
    }
  }
  return Array.from(found);
}

function extractContactUrl(contact) {
  if (!contact) return null;
  if (contact.toLowerCase().includes("opção 1") && contact.length < 10) return null;
  const phoneMatch = contact.replace(/\D/g, "");
  if (phoneMatch.length >= 10 && !contact.includes("@")) {
    let phone = phoneMatch;
    if (phone.length === 10 || phone.length === 11) phone = "55" + phone;
    return `https://wa.me/${phone}`;
  }
  return contact;
}

async function seed() {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const csvPath =
    process.env.SEED_CSV_PATH ||
    path.join(homeDir, "Downloads", "profissionais_antigravity_estruturado_completo.csv");
  const fileContent = fs.readFileSync(csvPath, "utf8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  const rawData = [];
  for (const row of records) {
    if (row.status_importacao === "REVISAR") continue;
    rawData.push({
      name: row.nome_completo || "",
      socialMedia: (row.midias_sociais_original || "").replace(/\\n/g, "\n"),
      contact: (row.contato_autorizado_original || "").replace(/\\n/g, "\n"),
      bio: (row.breve_curriculo_original || "").replace(/\\n/g, "\n"),
    });
  }

  const adminEmail = requireEnv("SEED_ADMIN_EMAIL");
  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");

  console.log("Fazendo login...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (error) {
    console.error("Erro no login:", error.message);
    return;
  }

  console.log("Login feito. Deletando dados antigos...");
  // Try to fetch all IDs first, then delete them by ID. RLS might block blanket deletes.
  const { data: existing } = await supabase.from("professionals").select("id");
  if (existing && existing.length > 0) {
    const ids = existing.map((e) => e.id);
    const { error: delErr } = await supabase.from("professionals").delete().in("id", ids);
    if (delErr) {
      console.error("Erro ao deletar:", delErr);
    } else {
      console.log("Antigos deletados!");
    }
  }

  const toInsert = rawData.map((data, index) => {
    const isOnline = data.bio?.toLowerCase().includes("online") ?? true;
    const inPerson = data.bio?.toLowerCase().includes("presencial") ?? true;

    return {
      name: data.name,
      city: null,
      country: null,
      bio: data.bio,
      specialties: extractSpecialties(data.bio),
      languages: [],
      photo_url: null,
      contact_url: extractContactUrl(data.contact),
      social_media: data.socialMedia !== "Opção 1" ? data.socialMedia : null,
      online: isOnline || (!isOnline && !inPerson),
      in_person: inPerson || (!isOnline && !inPerson),
      sort_order: index,
      published: true,
    };
  });

  console.log(`Inserindo ${toInsert.length} profissionais...`);
  const { error: insErr } = await supabase.from("professionals").insert(toInsert);

  if (insErr) {
    console.error("Erro na inserção:", insErr);
  } else {
    console.log("Importação para o Supabase concluída com sucesso!");
  }
}

seed();
