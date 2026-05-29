export type Badge = "destaque" | "certificado" | "internacional" | "docente";

export interface Professional {
  id: string;
  name: string;
  initials: string;
  badges: Badge[];
}

const names = [
  "Adriana Antunes Schmidt",
  "Alice Augusta Seixo de Britto de Fleury",
  "Aline Duprat Ramos",
  "Aline Vendramin Lira",
  "Ana Cristina Rodrigues",
  "Ana Natacha Ferreira Bento",
  "Andréa Cristina Carvalho",
  "Bethisa de Oliveira Bueno Ferraz",
  "Bianca Nunes dos Anjos",
  "Camila Rejane Amarante e Silva",
  "Caroline de Oliveira Gimenez",
  "Cássia Morgana Busanello",
  "Cristiane Valério",
  "Daniel Henriques Azevedo",
  "Daniela Barbosa da Silva",
  "Daniele Batista Soares",
  "Denise Reiff Toller Silveira",
  "Eva Laiz Velasque Antunes",
  "Fabiana Oshiro",
  "Filipa Eduarda Ventura Martinho",
  "Flávia Silva Barits Glória Campos",
  "Franciele Hubner Teis Andrade",
  "Glauco Yassuhico Yasuda",
  "Joelma Duarte de Souza",
  "Kátia Cristina Domingues",
  "Katia Regina Puchaski",
  "Katiucia Garcia Vilela",
  "Kelly Sayuri Bando Sano",
  "Larissa da Silva Lopes",
  "Leandra de Aguiar Caetano",
  "Lígia Martins Rodrigues Robles",
  "Luana Gomes Filippsen",
  "Luciana Cintra Saffioti",
  "Luís Fernando de Magalhães Teixeira",
  "Márcia Betana Cargnin",
  "Maria Antónia Feliciano Pedrão",
  "Maria Camila Fernandes Suzini Francisco",
  "Maribel Goettems",
  "Máximiliano Shoiti Sano",
  "Michele Sullam",
  "Natália Raquel Dias Teixeira",
  "Nédia Osman Safa Sakhr",
  "Neide Castro Moreira da Silva",
  "Ninete Rocha",
  "Paola Maria Patriarca",
  "Paula Andréa Barbosa Barreto",
  "Pedro Henrik Pereira Lopes",
  "Priscila Reis Santos",
  "Radha Krishna Barros Freire Margaria",
  "Regina Márcia Gerber",
  "Renata Fontana Merkes Lucatelli",
  "Sabrina Sabalianskas Marin Vidotti",
  "Samanta Lemes Carneiro",
  "Silvia Teresa Marques Martins",
  "Solange Roquini Sermidi",
  "Susana Novais de Carvalho",
  "Teresa Isabel de Oliveira Silvestre",
  "Thamara Gonçalves da Crus de Oliveira",
  "Vânia de Jesus Lemos Tavares",
  "Flávia Miglio Martin",
  "Ana Karina Mendes Chaves Pequeno",
  "Rosana Santos Costa",
  "Catarina Alexandra Valente Pereira",
  "Priscila Barp Rodrigues Czapla",
  "Rosiris Gomide Castanheira",
  "Carmelita Schneider",
  "Josandra Cleci Kaszewski",
];

function initialsOf(name: string) {
  const parts = name.split(" ").filter((p) => p.length > 2);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function slugOf(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const professionals: Professional[] = names.map((name) => ({
  id: slugOf(name),
  name,
  initials: initialsOf(name),
  badges: ["certificado"],
}));
