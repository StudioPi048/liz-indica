export type Badge = "destaque" | "certificado" | "internacional" | "docente";

export interface Professional {
  id: string;
  name: string;
  city: string;
  country: string;
  bio: string;
  specialties: string[];
  languages: string[];
  online: boolean;
  inPerson: boolean;
  badges: Badge[];
  imagePrompt: string;
  initials: string;
}

export const professionals: Professional[] = [
  {
    id: "leticia-baccin",
    name: "Letícia Baccin",
    city: "Curitiba",
    country: "Brasil",
    bio: "Psicogenealogista, docente internacional e fundadora do Instituto LIZ. Especialista em feridas ancestrais e transgeracionalidade.",
    specialties: ["Psicogenealogia", "Cabalá", "Neurociência"],
    languages: ["Português", "Espanhol"],
    online: true,
    inPerson: true,
    badges: ["destaque", "docente"],
    imagePrompt: "Professional headshot of a warm smiling woman in her 40s, soft natural lighting",
    initials: "LB",
  },
  {
    id: "marcus-mendes",
    name: "Marcus Mendes",
    city: "Porto",
    country: "Portugal",
    bio: "Atendimento focado em constelação familiar e genealogia sistêmica aplicada a carreiras e desenvolvimento pessoal.",
    specialties: ["Constelação Familiar", "Empresas", "Desenvolvimento Pessoal"],
    languages: ["Português", "Inglês"],
    online: true,
    inPerson: true,
    badges: ["certificado"],
    imagePrompt: "Professional headshot of a calm man in his 50s, warm lighting, neutral background",
    initials: "MM",
  },
  {
    id: "ana-sofia-vidal",
    name: "Ana Sofia Vidal",
    city: "Madrid",
    country: "Espanha",
    bio: "Especialista em decodificação biológica e memórias de gestação. Atendimento em três idiomas com foco em adultos e casais.",
    specialties: ["Decodificação Biológica", "Projeto Sentido", "Casais"],
    languages: ["Espanhol", "Português", "Inglês"],
    online: true,
    inPerson: false,
    badges: ["internacional"],
    imagePrompt: "Professional headshot of an elegant mature woman with kind eyes, soft studio lighting",
    initials: "AV",
  },
  {
    id: "ricardo-azevedo",
    name: "Ricardo Azevedo",
    city: "São Paulo",
    country: "Brasil",
    bio: "Astro Psicogenealogista com formação em neurociência. Atendimento especializado em adolescentes e crianças.",
    specialties: ["Astro Psicogenealogia", "Adolescentes", "Crianças"],
    languages: ["Português"],
    online: true,
    inPerson: true,
    badges: ["certificado"],
    imagePrompt: "Professional headshot of a thoughtful man in his 40s, glasses, warm neutral background",
    initials: "RA",
  },
  {
    id: "camila-fontes",
    name: "Camila Fontes",
    city: "Lisboa",
    country: "Portugal",
    bio: "Consteladora e psicogenealogista com foco em projeto sentido, gestação e linhagem materna.",
    specialties: ["Projeto Sentido", "Constelação Familiar", "Psicogenealogia"],
    languages: ["Português", "Francês"],
    online: true,
    inPerson: true,
    badges: ["internacional"],
    imagePrompt: "Professional headshot of a serene woman in her 30s with a warm smile, soft natural light",
    initials: "CF",
  },
  {
    id: "joao-pereira",
    name: "João Pereira",
    city: "Londres",
    country: "Reino Unido",
    bio: "Psicogenealogista e cabalista, atende em comunidade lusófona internacional com foco em desenvolvimento pessoal.",
    specialties: ["Cabalá", "Psicogenealogia", "Desenvolvimento Pessoal"],
    languages: ["Português", "Inglês"],
    online: true,
    inPerson: false,
    badges: ["internacional", "destaque"],
    imagePrompt: "Professional headshot of a man in his 40s, contemplative gaze, neutral studio background",
    initials: "JP",
  },
];

export const allSpecialties = [
  "Psicogenealogia",
  "Cabalá",
  "Constelação Familiar",
  "Decodificação Biológica",
  "Astro Psicogenealogia",
  "Neurociência",
  "Desenvolvimento Pessoal",
  "Empresas",
  "Casais",
  "Adolescentes",
  "Crianças",
  "Projeto Sentido",
];

export const allLanguages = ["Português", "Inglês", "Espanhol", "Francês"];
