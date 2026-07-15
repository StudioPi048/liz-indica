import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure path to Downloads is correct
const homeDir = process.env.HOME || process.env.USERPROFILE;
const csvPath = path.join(homeDir, 'Downloads', 'profissionais_antigravity_estruturado_completo.csv');

console.log(`Lendo arquivo CSV em: ${csvPath}`);

const fileContent = fs.readFileSync(csvPath, 'utf8');

// Parse the CSV
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true
});

const output = [];

for (const row of records) {
  const name = row.nome_completo || '';
  const socialMedia = (row.midias_sociais_original || '').replace(/\\n/g, '\n');
  const contact = (row.contato_autorizado_original || '').replace(/\\n/g, '\n');
  const bio = (row.breve_curriculo_original || '').replace(/\\n/g, '\n');
  const published = row.status_importacao !== 'REVISAR';

  output.push({
    name,
    socialMedia,
    contact,
    bio,
    published
  });
}

console.log(`Processado. Total de profissionais lidos: ${output.length} de ${records.length} lidos.`);

// Write to src/data/professionals-raw.ts
const outPath = path.join(__dirname, '..', 'src', 'data', 'professionals-raw.ts');
const outContent = `export const rawProfessionalsData = ${JSON.stringify(output, null, 2)};\n`;

fs.writeFileSync(outPath, outContent, 'utf8');

console.log(`Arquivo src/data/professionals-raw.ts gerado com sucesso!`);
