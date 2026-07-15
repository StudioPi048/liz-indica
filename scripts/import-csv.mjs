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

// Setup photos directory
const publicPhotosDir = path.join(__dirname, '..', 'public', 'photos');
if (!fs.existsSync(publicPhotosDir)) {
  fs.mkdirSync(publicPhotosDir, { recursive: true });
}

// Read available photos
const photosDir = path.join(homeDir, 'Downloads', 'Renomeadas');
let availablePhotos = [];
if (fs.existsSync(photosDir)) {
  availablePhotos = fs.readdirSync(photosDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
}

function normalizeName(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function findPhotoForName(name) {
  if (!name) return null;
  const normName = normalizeName(name);
  let bestMatch = null;
  let bestMatchScore = 0;
  
  for (const photo of availablePhotos) {
    const photoNorm = normalizeName(photo.replace(/\.(jpg|jpeg|png)$/i, ''));
    if (normName.includes(photoNorm) || photoNorm.includes(normName)) {
      return photo; // exact or substring match
    }
    
    // basic fuzzy: count matching words
    const nameWords = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[\s\-]+/);
    const photoWords = photo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\.(jpg|jpeg|png)$/i, '').split(/[\s\-]+/);
    
    let score = 0;
    for (const pw of photoWords) {
      if (nameWords.includes(pw) && pw.length > 2) score++;
    }
    if (score > bestMatchScore && score >= 2) { // Require at least 2 words matching to be safe
      bestMatchScore = score;
      bestMatch = photo;
    }
  }
  return bestMatch;
}

const output = [];

for (const row of records) {
  const name = row.nome_completo || '';
  const socialMedia = (row.midias_sociais_original || '').replace(/\\n/g, '\n');
  const contact = (row.contato_autorizado_original || '').replace(/\\n/g, '\n');
  const bio = (row.breve_curriculo_original || '').replace(/\\n/g, '\n');
  const published = true;
  
  let photo_url = null;
  const matchedPhoto = findPhotoForName(name);
  
  if (matchedPhoto) {
    const ext = path.extname(matchedPhoto);
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newFilename = `${slug}${ext}`;
    
    // Copy file
    fs.copyFileSync(path.join(photosDir, matchedPhoto), path.join(publicPhotosDir, newFilename));
    photo_url = `/photos/${newFilename}`;
  }

  output.push({
    name,
    socialMedia,
    contact,
    bio,
    published,
    photo_url
  });
}

console.log(`Processado. Total de profissionais lidos: ${output.length} de ${records.length} lidos.`);

// Write to src/data/professionals-raw.ts
const outPath = path.join(__dirname, '..', 'src', 'data', 'professionals-raw.ts');
const outContent = `export const rawProfessionalsData = ${JSON.stringify(output, null, 2)};\n`;

fs.writeFileSync(outPath, outContent, 'utf8');

console.log(`Arquivo src/data/professionals-raw.ts gerado com sucesso!`);
