// Tipos elementales: colores (normal y shiny) y tabla de eficacia.
export const TYPE_ORDER = ['fuego', 'agua', 'planta', 'electrico', 'hielo', 'roca', 'fantasma', 'psiquico'];

export const TYPES = {
  fuego: { name: 'Fuego', short: 'FUE', base: '#e8613c', light: '#ffa25c', dark: '#a8322a', accent: '#ffd84a',
    shiny: { base: '#8c5ad8', light: '#b88cf0', dark: '#5a3496' } },
  agua: { name: 'Agua', short: 'AGU', base: '#3c8ce8', light: '#78c0ff', dark: '#24569c', accent: '#d8f4ff',
    shiny: { base: '#e85a9c', light: '#ff92c4', dark: '#a03068' } },
  planta: { name: 'Planta', short: 'PLA', base: '#4cb04c', light: '#8ce070', dark: '#2c703c', accent: '#f070a0',
    shiny: { base: '#d8b83c', light: '#f8e070', dark: '#987820' } },
  electrico: { name: 'Eléctrico', short: 'ELE', base: '#f0c830', light: '#fff07a', dark: '#b08420', accent: '#3c3c50',
    shiny: { base: '#50c8c0', light: '#8cf0e0', dark: '#2c8480' } },
  hielo: { name: 'Hielo', short: 'HIE', base: '#8cd8f0', light: '#d4f4ff', dark: '#4c94b8', accent: '#ffffff',
    shiny: { base: '#c8a0e8', light: '#ecd4ff', dark: '#8460a8' } },
  roca: { name: 'Roca', short: 'ROC', base: '#a08868', light: '#c8b08c', dark: '#685440', accent: '#6c6c78',
    shiny: { base: '#6c8ca8', light: '#9cb8d0', dark: '#44607c' } },
  fantasma: { name: 'Fantasma', short: 'FAN', base: '#7c5cb8', light: '#a88ce0', dark: '#4c3480', accent: '#e85a8c',
    shiny: { base: '#4c4c5c', light: '#7c7c90', dark: '#2c2c38' } },
  psiquico: { name: 'Psíquico', short: 'PSI', base: '#e870b0', light: '#ff9cd0', dark: '#a8407c', accent: '#4ce0e8',
    shiny: { base: '#60c870', light: '#98eca0', dark: '#348440' } }
};

export const hexToNum = (hex) => parseInt(hex.slice(1), 16);

// strong: tipos contra los que hace x2; weak: tipos contra los que hace x0.5
export const CHART = {
  fuego: { strong: ['planta', 'hielo'], weak: ['agua', 'roca'] },
  agua: { strong: ['fuego', 'roca'], weak: ['planta', 'electrico'] },
  planta: { strong: ['agua', 'roca'], weak: ['fuego', 'hielo'] },
  electrico: { strong: ['agua'], weak: ['planta', 'roca'] },
  hielo: { strong: ['planta'], weak: ['fuego', 'roca'] },
  roca: { strong: ['fuego', 'hielo', 'electrico'], weak: ['agua', 'planta'] },
  fantasma: { strong: ['fantasma', 'psiquico'], weak: [] },
  psiquico: { strong: ['fantasma'], weak: ['psiquico'] }
};

export function effectiveness(attackType, defenseType) {
  if (!attackType || !defenseType) return 1;
  const row = CHART[attackType];
  if (!row) return 1;
  if (row.strong.includes(defenseType)) return 2;
  if (row.weak.includes(defenseType)) return 0.5;
  return 1;
}
