import { createDeck, isWild, rankValue, shuffle } from './deck.js';
import type { Card, GameState, Role } from './types.js';

type ErrorResult = { ok: false; error: string };
type SuccessResult = { ok: true; state: GameState };
export type PlayResult = SuccessResult | ErrorResult;

function dealCards(playerIds: string[]): Record<string, Card[]> {
  const deck = shuffle(createDeck());
  const hands: Record<string, Card[]> = Object.fromEntries(playerIds.map((id) => [id, []]));
  deck.forEach((card, index) => {
    hands[playerIds[index % playerIds.length]].push(card);
  });
  return hands;
}

function determineStartingPlayer(
  playerIds: string[],
  hands: Record<string, Card[]>,
  previousCuloId?: string,
): string {
  if (previousCuloId && playerIds.includes(previousCuloId)) return previousCuloId;

  const holderOfThreeOfBastos = playerIds.find((id) =>
    hands[id].some((card) => card.suit === 'bastos' && card.rank === 3),
  );
  return holderOfThreeOfBastos ?? playerIds[0];
}

export function createGame(playerIds: string[], previousCuloId?: string): GameState {
  const hands = dealCards(playerIds);
  const startingPlayer = determineStartingPlayer(playerIds, hands, previousCuloId);
  const startIndex = playerIds.indexOf(startingPlayer);
  const seatOrder = [...playerIds.slice(startIndex), ...playerIds.slice(0, startIndex)];

  return {
    hands,
    seatOrder,
    currentTurn: seatOrder[0],
    pile: [],
    requiredCount: null,
    passedPlayers: [],
    lastPlay: null,
    finishedOrder: [],
    roles: Object.fromEntries(playerIds.map((id) => [id, null])),
    phase: 'playing',
  };
}

function hasCards(hand: Card[], cards: Card[]): boolean {
  const remaining = [...hand];
  for (const card of cards) {
    const index = remaining.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
    if (index === -1) return false;
    remaining.splice(index, 1);
  }
  return true;
}

function removeCards(hand: Card[], cards: Card[]): Card[] {
  const result = [...hand];
  for (const card of cards) {
    const index = result.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
    result.splice(index, 1);
  }
  return result;
}

/** Busca el siguiente jugador activo (con cartas) siguiendo el orden de asiento fijo, a partir de la posición de `fromId`. */
function findNextActive(
  state: GameState,
  fromId: string,
  { skipPassed }: { skipPassed: boolean },
): string | null {
  const order = state.seatOrder;
  const startIndex = order.indexOf(fromId);
  if (startIndex === -1) return null;

  for (let step = 1; step <= order.length; step++) {
    const candidate = order[(startIndex + step) % order.length];
    if (candidate === fromId) continue;
    if (state.finishedOrder.includes(candidate)) continue;
    if (skipPassed && state.passedPlayers.includes(candidate)) continue;
    return candidate;
  }
  return null;
}

function assignRoles(finishedOrder: string[]): Record<string, Role> {
  const roles: Record<string, Role> = {};
  finishedOrder.forEach((id) => {
    roles[id] = null;
  });

  const n = finishedOrder.length;
  if (n === 0) return roles;

  roles[finishedOrder[0]] = 'presidente';
  roles[finishedOrder[n - 1]] = 'culo';

  if (n >= 4) {
    roles[finishedOrder[1]] = 'vicepresidente';
    roles[finishedOrder[n - 2]] = 'viceculo';
  }

  return roles;
}

function finishGame(state: GameState, finishedOrder: string[]): GameState {
  return {
    ...state,
    finishedOrder,
    phase: 'finished',
    roles: assignRoles(finishedOrder),
    currentTurn: '',
    pile: [],
    requiredCount: null,
    passedPlayers: [],
  };
}

export function playCards(state: GameState, playerId: string, cards: Card[]): PlayResult {
  if (state.phase !== 'playing') return { ok: false, error: 'GAME_FINISHED' };
  if (state.currentTurn !== playerId) return { ok: false, error: 'NOT_YOUR_TURN' };
  if (!Array.isArray(cards) || cards.length === 0 || cards.length > 4) {
    return { ok: false, error: 'INVALID_CARD_COUNT' };
  }

  const hand = state.hands[playerId] ?? [];
  if (!hasCards(hand, cards)) return { ok: false, error: 'CARDS_NOT_IN_HAND' };

  const rank = cards[0].rank;
  if (!cards.every((card) => card.rank === rank)) return { ok: false, error: 'CARDS_MUST_MATCH_RANK' };

  const wild = isWild(rank);

  if (!wild && state.requiredCount !== null) {
    if (cards.length !== state.requiredCount) return { ok: false, error: 'MUST_MATCH_PLAY_COUNT' };
    if (state.lastPlay && rankValue(rank) < rankValue(state.lastPlay.cards[0].rank)) {
      return { ok: false, error: 'CARD_TOO_LOW' };
    }
  }

  const nextHand = removeCards(hand, cards);
  const hands = { ...state.hands, [playerId]: nextHand };
  const finished = nextHand.length === 0;

  let working: GameState = {
    ...state,
    hands,
    lastPlay: { playerId, cards },
    passedPlayers: [],
  };

  working = wild
    ? { ...working, pile: [], requiredCount: null }
    : { ...working, pile: [...working.pile, ...cards], requiredCount: cards.length };

  if (finished) {
    const finishedOrder = [...working.finishedOrder, playerId];
    const remainingActive = working.seatOrder.filter((id) => !finishedOrder.includes(id));

    if (remainingActive.length <= 1) {
      const finalOrder = remainingActive.length === 1 ? [...finishedOrder, remainingActive[0]] : finishedOrder;
      return { ok: true, state: finishGame(working, finalOrder) };
    }

    const stateWithFinishedOrder = { ...working, finishedOrder };
    const next = findNextActive(stateWithFinishedOrder, playerId, { skipPassed: true });
    return { ok: true, state: { ...stateWithFinishedOrder, currentTurn: next ?? remainingActive[0] } };
  }

  const next = wild ? playerId : findNextActive(working, playerId, { skipPassed: true });
  return { ok: true, state: { ...working, currentTurn: next ?? playerId } };
}

export function passTurn(state: GameState, playerId: string): PlayResult {
  if (state.phase !== 'playing') return { ok: false, error: 'GAME_FINISHED' };
  if (state.currentTurn !== playerId) return { ok: false, error: 'NOT_YOUR_TURN' };
  if (state.requiredCount === null) return { ok: false, error: 'CANNOT_PASS_ON_FREE_PLAY' };

  const passedPlayers = [...state.passedPlayers, playerId];
  const activeCount = state.seatOrder.filter((id) => !state.finishedOrder.includes(id)).length;

  // Se han pasado todos los jugadores activos menos el que hizo la última jugada: se quema la mesa.
  if (passedPlayers.length >= activeCount - 1) {
    const leaderId = state.lastPlay?.playerId ?? null;
    const leaderStillActive = leaderId !== null && !state.finishedOrder.includes(leaderId);
    const nextLeader = leaderStillActive
      ? leaderId
      : leaderId
        ? findNextActive({ ...state, passedPlayers: [] }, leaderId, { skipPassed: false })
        : state.seatOrder[0];

    return {
      ok: true,
      state: {
        ...state,
        pile: [],
        requiredCount: null,
        passedPlayers: [],
        lastPlay: null,
        currentTurn: nextLeader ?? playerId,
      },
    };
  }

  const next = findNextActive(state, playerId, { skipPassed: true });
  return { ok: true, state: { ...state, passedPlayers, currentTurn: next ?? playerId } };
}
