import type { Card, Suit } from './types.js';

const SUITS: Suit[] = ['oros', 'copas', 'espadas', 'bastos'];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

// Orden de valor de juego (REGLAS.md sección 1): 3 < 4 < 5 < 6 < 7 < sota < caballo < rey < as < 2
const VALUE_ORDER = [3, 4, 5, 6, 7, 10, 11, 12, 1, 2];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function rankValue(rank: number): number {
  return VALUE_ORDER.indexOf(rank);
}

export function isWild(rank: number): boolean {
  return rank === 2;
}
