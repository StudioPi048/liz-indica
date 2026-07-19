import { execFileSync } from "node:child_process";
import path from "node:path";

const workbookPath =
  process.env.LIZ_XLSX_PATH ||
  "/Users/pietrobaccin/Downloads/planilha geral profissionais - atualizada.xlsx";

function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
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

const rows = readWorkbook(path.resolve(workbookPath));
const byName = new Map();
for (const row of rows) {
  const record = {
    name: normalizeText(row["Nome completo do MENTORADO"]),
    social_media: normalizeText(row["QUAL(IS) SÃO SUAS MÍDIAS SOCIAIS"]),
    contact: normalizeText(row["QUAL É O CONTATO QUE VOC AUTORIZA DIVULGAR?"]),
    bio: normalizeText(row["MENCIONE SEU BREVE CURRÍCULO"]),
  };
  const key = normalizeName(record.name);
  if (!byName.has(key)) byName.set(key, []);
  byName.get(key).push(record);
}

const duplicates = [...byName.values()].filter((items) => items.length > 1);
console.log(`Linhas preenchidas: ${rows.length}`);
console.log(`Nomes únicos: ${byName.size}`);
console.log(`Duplicidades por nome: ${duplicates.length}`);

for (const items of duplicates) {
  const [first] = items;
  const conflicts = [];
  for (const field of ["social_media", "contact", "bio"]) {
    const values = [...new Set(items.map((item) => item[field]).filter(Boolean))];
    if (values.length > 1) conflicts.push(field);
  }
  console.log(
    `- ${first.name}: ${items.length} linhas${conflicts.length ? `; conflitos em ${conflicts.join(", ")}` : ""}`,
  );
}
