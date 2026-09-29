import type { Card, Suit } from './types.js';

const SUITS: Suit[] = ['oros', 'copas', 'espadas', 'bastos'];
const STANDARD_RANKS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
const EXTENDED_RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const MAX_PLAYERS_STANDARD_DECK = 6;

// Orden de valor de juego (REGLAS.md sección 1): 3 < 4 < 5 < 6 < 7 < 8 < 9 < sota < caballo < rey < as < 2
// El 8 y el 9 solo existen en la baraja extendida, pero incluirlos aquí no afecta a las partidas con
// baraja estándar: esos rangos simplemente nunca aparecen en la mano de nadie.
const VALUE_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

/** Más de 6 jugadores agotarían una baraja de 40 cartas demasiado rápido: se añaden el 8 y el 9 (REGLAS.md sección 1). */
export function useExtendedDeck(playerCount: number): boolean {
  return playerCount > MAX_PLAYERS_STANDARD_DECK;
}

export function createDeck(extended: boolean): Card[] {
  const ranks = extended ? EXTENDED_RANKS : STANDARD_RANKS;
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of ranks) {
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
