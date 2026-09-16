import { rankValue } from './deck.js';
import type { Card, Role } from './types.js';

export interface Transfer {
  playerId: string;
  role: Exclude<Role, null>;
  gave: Card[];
  received: Card[];
}

export interface ExchangeResult {
  hands: Record<string, Card[]>;
  transfers: Transfer[];
}

function findByRole(roles: Record<string, Role>, role: Role): string | null {
  return Object.entries(roles).find(([, r]) => r === role)?.[0] ?? null;
}

function takeBest(hand: Card[], count: number): Card[] {
  return [...hand].sort((a, b) => rankValue(b.rank) - rankValue(a.rank)).slice(0, count);
}

function takeWorst(hand: Card[], count: number): Card[] {
  return [...hand].sort((a, b) => rankValue(a.rank) - rankValue(b.rank)).slice(0, count);
}

function withoutCards(hand: Card[], cards: Card[]): Card[] {
  const result = [...hand];
  for (const card of cards) {
    const index = result.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
    if (index !== -1) result.splice(index, 1);
  }
  return result;
}

function swap(
  hands: Record<string, Card[]>,
  transfers: Transfer[],
  lowerId: string | null,
  lowerRole: Exclude<Role, null>,
  upperId: string | null,
  upperRole: Exclude<Role, null>,
  count: number,
): void {
  if (!lowerId || !upperId) return;
  const lowerHand = hands[lowerId];
  const upperHand = hands[upperId];
  if (!lowerHand || !upperHand) return;

  const fromLower = takeBest(lowerHand, Math.min(count, lowerHand.length));
  const fromUpper = takeWorst(upperHand, Math.min(count, upperHand.length));

  hands[lowerId] = [...withoutCards(lowerHand, fromLower), ...fromUpper];
  hands[upperId] = [...withoutCards(upperHand, fromUpper), ...fromLower];

  transfers.push({ playerId: lowerId, role: lowerRole, gave: fromLower, received: fromUpper });
  transfers.push({ playerId: upperId, role: upperRole, gave: fromUpper, received: fromLower });
}

/**
 * Intercambio automático entre rondas (REGLAS.md sección 6), aplicado sobre las manos YA repartidas de la
 * nueva ronda, usando los roles con los que terminó la ronda anterior: el Culo da sus 2 mejores cartas al
 * Presidente (y recibe a cambio sus 2 peores); el Viceculo y el Vicepresidente hacen lo mismo con 1 carta.
 * Roles inexistentes (menos de 4 jugadores) simplemente no generan intercambio para esa pareja.
 */
export function applyRoleExchange(
  hands: Record<string, Card[]>,
  previousRoles: Record<string, Role>,
): ExchangeResult {
  const nextHands = { ...hands };
  const transfers: Transfer[] = [];

  swap(
    nextHands,
    transfers,
    findByRole(previousRoles, 'culo'),
    'culo',
    findByRole(previousRoles, 'presidente'),
    'presidente',
    2,
  );
  swap(
    nextHands,
    transfers,
    findByRole(previousRoles, 'viceculo'),
    'viceculo',
    findByRole(previousRoles, 'vicepresidente'),
    'vicepresidente',
    1,
  );

  return { hands: nextHands, transfers };
}
