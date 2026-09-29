import type { Card, Suit } from '../store/gameStore';

// Mismo orden de valor que el servidor (REGLAS.md sección 1): 3 < 4 < 5 < 6 < 7 < 8 < 9 < sota < caballo < rey < as < 2
// El 8 y el 9 solo existen en la baraja extendida (más de 6 jugadores); incluirlos aquí no afecta a las
// partidas con baraja estándar, ya que esos rangos simplemente nunca aparecen en ninguna mano.
const VALUE_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

export function rankValue(rank: number): number {
  return VALUE_ORDER.indexOf(rank);
}

export function sortHand(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankValue(a.rank) - rankValue(b.rank));
}

const RANK_LABELS: Record<number, string> = {
  1: 'As',
  10: 'Sota',
  11: 'Caballo',
  12: 'Rey',
};

export function rankLabel(rank: number): string {
  return RANK_LABELS[rank] ?? String(rank);
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  oros: '●',
  copas: '♥',
  espadas: '♠',
  bastos: '♣',
};

export function suitSymbol(suit: Suit): string {
  return SUIT_SYMBOLS[suit];
}

const SUIT_LABELS: Record<Suit, string> = {
  oros: 'Oros',
  copas: 'Copas',
  espadas: 'Espadas',
  bastos: 'Bastos',
};

export function suitLabel(suit: Suit): string {
  return SUIT_LABELS[suit];
}

const SUIT_COLORS: Record<Suit, string> = {
  oros: '#b8860b',
  copas: '#c0392b',
  espadas: '#2c3e50',
  bastos: '#2e7d32',
};

export function suitColor(suit: Suit): string {
  return SUIT_COLORS[suit];
}

export function cardKey(card: Card): string {
  return `${card.suit}-${card.rank}`;
}
