// Orígenes mitológicos de las bestias: nombre, abreviatura y colores del bloque.
// (Se exportan como TYPES / TYPE_ORDER porque el resto del juego llama «tipo» al origen.)
// Los hechizos tienen sus propios colores elementales en specials.js.
export const TYPE_ORDER = [
  'griega', 'nordica', 'egipcia', 'celta', 'eslava', 'iberica', 'europea',
  'japonesa', 'asiatica', 'indomalaya', 'medioriental', 'americana', 'africana', 'oceanica'
];

const o = (name, myth, short, base, light, dark) => ({ name, myth, short, base, light, dark });

export const TYPES = {
  griega: o('Greco-Roman', 'Greco-Roman mythology', 'GRE', '#4c7cd8', '#8cb4ff', '#2c4c9c'),
  nordica: o('Norse', 'Norse mythology', 'NOR', '#5c8ca8', '#a0c8dc', '#345c78'),
  egipcia: o('Egyptian', 'Egyptian mythology', 'EGY', '#d0a030', '#f4d47c', '#8c6418'),
  celta: o('Celtic', 'Celtic and British folklore', 'CEL', '#3c9c5c', '#80d494', '#22643a'),
  eslava: o('Slavic', 'Slavic mythology', 'SLA', '#c84848', '#f08c8c', '#842c2c'),
  iberica: o('Iberian', 'Iberian mythology', 'IBE', '#e07a30', '#ffb478', '#984818'),
  europea: o('European', 'European folklore', 'EUR', '#8c6cb8', '#c4ace8', '#5a4084'),
  japonesa: o('Japanese', 'Japanese mythology', 'JAP', '#e05878', '#ff9cb4', '#a0304c'),
  asiatica: o('East Asian', 'East Asian mythology', 'EAS', '#2ca890', '#78e0c8', '#18705c'),
  indomalaya: o('Indo-Malay', 'Indian and Malay mythology', 'IND', '#e89c28', '#ffd080', '#a06414'),
  medioriental: o('Middle Eastern', 'Middle Eastern mythology', 'MID', '#38a0c8', '#88d4f0', '#1c6c8c'),
  americana: o('American', 'American mythology', 'AME', '#b85c38', '#e8987c', '#7c3820'),
  africana: o('African', 'African mythology', 'AFR', '#a0783c', '#d4b07c', '#6c4c20'),
  oceanica: o('Oceanian', 'Oceanian mythology', 'OCE', '#30b8b0', '#80ece4', '#18807a')
};

export const hexToNum = (hex) => parseInt(hex.slice(1), 16);
