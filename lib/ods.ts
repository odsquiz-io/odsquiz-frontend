export type OdsGoal = {
  number: number;
  name: string;
  statement: string;
  color: string;
  textColor: string;
};

const white = "#ffffff";
const ink = "#111316";

export const odsGoals: OdsGoal[] = [
  {
    number: 1,
    name: "Erradicação da pobreza",
    statement: "Acabar com a pobreza em todas as suas formas, em todos os lugares",
    color: "#e5243b",
    textColor: white,
  },
  {
    number: 2,
    name: "Fome zero e agricultura sustentável",
    statement:
      "Acabar com a fome, alcançar a segurança alimentar e melhoria da nutrição e promover a agricultura sustentável",
    color: "#dda63a",
    textColor: ink,
  },
  {
    number: 3,
    name: "Saúde e bem-estar",
    statement:
      "Assegurar uma vida saudável e promover o bem-estar para todas e todos, em todas as idades",
    color: "#4c9f38",
    textColor: ink,
  },
  {
    number: 4,
    name: "Educação de qualidade",
    statement:
      "Assegurar a educação inclusiva e equitativa e de qualidade, e promover oportunidades de aprendizagem ao longo da vida para todas e todos",
    color: "#c5192d",
    textColor: white,
  },
  {
    number: 5,
    name: "Igualdade de gênero",
    statement:
      "Alcançar a igualdade de gênero e empoderar todas as mulheres e meninas",
    color: "#ff3a21",
    textColor: ink,
  },
  {
    number: 6,
    name: "Água potável e saneamento",
    statement:
      "Assegurar a disponibilidade e gestão sustentável da água e saneamento para todas e todos",
    color: "#26bde2",
    textColor: ink,
  },
  {
    number: 7,
    name: "Energia limpa e acessível",
    statement:
      "Assegurar o acesso confiável, sustentável, moderno e a preço acessível à energia para todas e todos",
    color: "#fcc30b",
    textColor: ink,
  },
  {
    number: 8,
    name: "Trabalho decente e crescimento econômico",
    statement:
      "Promover o crescimento econômico sustentado, inclusivo e sustentável, emprego pleno e produtivo e trabalho decente para todas e todos",
    color: "#a21942",
    textColor: white,
  },
  {
    number: 9,
    name: "Indústria, inovação e infraestrutura",
    statement:
      "Construir infraestruturas resilientes, promover a industrialização inclusiva e sustentável e fomentar a inovação",
    color: "#fd6925",
    textColor: ink,
  },
  {
    number: 10,
    name: "Redução das desigualdades",
    statement: "Reduzir a desigualdade dentro dos países e entre eles",
    color: "#dd1367",
    textColor: white,
  },
  {
    number: 11,
    name: "Cidades e comunidades sustentáveis",
    statement:
      "Tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis",
    color: "#fd9d24",
    textColor: ink,
  },
  {
    number: 12,
    name: "Consumo e produção responsáveis",
    statement: "Assegurar padrões de produção e de consumo sustentáveis",
    color: "#bf8b2e",
    textColor: ink,
  },
  {
    number: 13,
    name: "Ação contra a mudança global do clima",
    statement:
      "Tomar medidas urgentes para combater a mudança climática e seus impactos",
    color: "#3f7e44",
    textColor: white,
  },
  {
    number: 14,
    name: "Vida na água",
    statement:
      "Conservação e uso sustentável dos oceanos, dos mares e dos recursos marinhos para o desenvolvimento sustentável",
    color: "#0a97d9",
    textColor: ink,
  },
  {
    number: 15,
    name: "Vida terrestre",
    statement:
      "Proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres, gerir de forma sustentável as florestas, combater a desertificação, deter e reverter a degradação da terra e deter a perda de biodiversidade",
    color: "#56c02b",
    textColor: ink,
  },
  {
    number: 16,
    name: "Paz, justiça e instituições eficazes",
    statement:
      "Promover sociedades pacíficas e inclusivas para o desenvolvimento sustentável, proporcionar o acesso à justiça para todos e construir instituições eficazes, responsáveis e inclusivas em todos os níveis",
    color: "#00689d",
    textColor: white,
  },
  {
    number: 17,
    name: "Parcerias e meios de implementação",
    statement:
      "Fortalecer os meios de implementação e revitalizar a parceria global para o desenvolvimento sustentável",
    color: "#19486a",
    textColor: white,
  },
];

export function findGoal(number?: number) {
  return odsGoals.find((goal) => goal.number === number);
}
