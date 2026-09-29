import { createDeck, isWild, rankValue, shuffle, useExtendedDeck } from './deck.js';
import type { Card, GameState, Role } from './types.js';

interface Advance {
  next: string | null;
  skippedPlayerId: string | null;
}

type ErrorResult = { ok: false; error: string };
type SuccessResult = { ok: true; state: GameState };
export type PlayResult = SuccessResult | ErrorResult;

function dealCards(playerIds: string[]): Record<string, Card[]> {
  const deck = shuffle(createDeck(useExtendedDeck(playerIds.length)));
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

export function createGame(
  playerIds: string[],
  previousCuloId?: string,
  forcedCuloId: string | null = null,
  forcedViceculoId: string | null = null,
): GameState {
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
    lastSkip: null,
    lastBurn: null,
    seq: 0,
    finishedOrder: [],
    departedPlayers: [],
    roles: Object.fromEntries(playerIds.map((id) => [id, null])),
    phase: 'playing',
    forcedCuloId,
    forcedViceculoId,
    nextRoundDeadline: null,
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

/** Un jugador está "fuera" de la rotación si ya terminó esta ronda o si se desconectó a mitad de ella. */
function isOut(state: GameState, id: string): boolean {
  return state.finishedOrder.includes(id) || state.departedPlayers.includes(id);
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
    if (isOut(state, candidate)) continue;
    if (skipPassed && state.passedPlayers.includes(candidate)) continue;
    return candidate;
  }
  return null;
}

/**
 * Avanza el turno desde `fromId`. Si `applySkip` es true (se jugó una carta del mismo valor
 * que la anterior), se salta un jugador activo adicional: REGLAS.md — mecánica de salto.
 */
function advanceTurn(state: GameState, fromId: string, applySkip: boolean): Advance {
  const firstHop = findNextActive(state, fromId, { skipPassed: true });
  if (!applySkip || firstHop === null) {
    return { next: firstHop, skippedPlayerId: null };
  }

  const secondHop = findNextActive(state, firstHop, { skipPassed: true });
  return { next: secondHop ?? firstHop, skippedPlayerId: firstHop };
}

/**
 * Asigna roles a partir de quienes terminaron con normalidad esta ronda (`naturalFinishedOrder`, ya sin
 * los jugadores con rol forzoso). Si hay rol forzoso, se aplica encima y esos jugadores se añaden al final
 * del orden de cara al podio (viceculo penúltimo, culo último), sin importar cuándo se quedaron sin cartas.
 */
function assignRoles(
  naturalFinishedOrder: string[],
  forcedCuloId: string | null,
  forcedViceculoId: string | null,
): { roles: Record<string, Role>; displayOrder: string[] } {
  const roles: Record<string, Role> = {};
  naturalFinishedOrder.forEach((id) => {
    roles[id] = null;
  });

  const n = naturalFinishedOrder.length;
  if (n > 0) {
    roles[naturalFinishedOrder[0]] = 'presidente';
    if (!forcedCuloId) roles[naturalFinishedOrder[n - 1]] = 'culo';

    if (n >= 4) {
      roles[naturalFinishedOrder[1]] = 'vicepresidente';
      if (!forcedViceculoId) roles[naturalFinishedOrder[n - 2]] = 'viceculo';
    }
  }

  const displayOrder = [...naturalFinishedOrder];
  if (forcedViceculoId) {
    roles[forcedViceculoId] = 'viceculo';
    displayOrder.push(forcedViceculoId);
  }
  if (forcedCuloId) {
    roles[forcedCuloId] = 'culo';
    displayOrder.push(forcedCuloId);
  }

  return { roles, displayOrder };
}

function finishGame(state: GameState, rawFinishedOrder: string[]): GameState {
  // Un jugador con rol forzoso puede quedarse sin cartas de forma natural durante la ronda; se excluye aquí
  // del cálculo "natural" para que no acabe duplicado (una vez por terminar la mano, otra por el forzado).
  const naturalFinishedOrder = rawFinishedOrder.filter(
    (id) => id !== state.forcedCuloId && id !== state.forcedViceculoId,
  );
  const { roles, displayOrder } = assignRoles(naturalFinishedOrder, state.forcedCuloId, state.forcedViceculoId);
  return {
    ...state,
    finishedOrder: displayOrder,
    phase: 'finished',
    roles,
    currentTurn: '',
    pile: [],
    requiredCount: null,
    passedPlayers: [],
    lastSkip: null,
    lastBurn: null,
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

  // Jugar el mismo valor que la jugada anterior salta el turno del siguiente jugador (REGLAS.md).
  const causesSkip = !wild && state.requiredCount !== null && state.lastPlay !== null && rank === state.lastPlay.cards[0].rank;

  const nextHand = removeCards(hand, cards);
  const hands = { ...state.hands, [playerId]: nextHand };
  const finished = nextHand.length === 0;

  let working: GameState = {
    ...state,
    hands,
    lastPlay: { playerId, cards },
    lastSkip: null,
    lastBurn: wild ? { burnedBy: playerId, reason: 'wild' } : null,
    passedPlayers: [],
    seq: state.seq + 1,
  };

  working = wild
    ? { ...working, pile: [], requiredCount: null }
    : { ...working, pile: [...working.pile, ...cards], requiredCount: cards.length };

  if (finished) {
    const finishedOrder = [...working.finishedOrder, playerId];
    const stateWithFinishedOrder = { ...working, finishedOrder };
    const remainingActive = stateWithFinishedOrder.seatOrder.filter((id) => !isOut(stateWithFinishedOrder, id));

    if (remainingActive.length <= 1) {
      const finalOrder = remainingActive.length === 1 ? [...finishedOrder, remainingActive[0]] : finishedOrder;
      return { ok: true, state: finishGame(stateWithFinishedOrder, finalOrder) };
    }

    const { next, skippedPlayerId } = advanceTurn(stateWithFinishedOrder, playerId, causesSkip);
    return {
      ok: true,
      state: {
        ...stateWithFinishedOrder,
        currentTurn: next ?? remainingActive[0],
        lastSkip: skippedPlayerId ? { skippedPlayerId } : null,
      },
    };
  }

  const { next, skippedPlayerId } = wild
    ? { next: playerId, skippedPlayerId: null }
    : advanceTurn(working, playerId, causesSkip);
  return {
    ok: true,
    state: { ...working, currentTurn: next ?? playerId, lastSkip: skippedPlayerId ? { skippedPlayerId } : null },
  };
}

export function passTurn(state: GameState, playerId: string): PlayResult {
  if (state.phase !== 'playing') return { ok: false, error: 'GAME_FINISHED' };
  if (state.currentTurn !== playerId) return { ok: false, error: 'NOT_YOUR_TURN' };
  if (state.requiredCount === null) return { ok: false, error: 'CANNOT_PASS_ON_FREE_PLAY' };

  const passedPlayers = [...state.passedPlayers, playerId];
  const activeCount = state.seatOrder.filter((id) => !isOut(state, id)).length;

  // Se han pasado todos los jugadores activos menos el que hizo la última jugada: se quema la mesa.
  if (passedPlayers.length >= activeCount - 1) {
    const leaderId = state.lastPlay?.playerId ?? null;
    const leaderStillActive = leaderId !== null && !isOut(state, leaderId);
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
        lastSkip: null,
        lastBurn: { burnedBy: nextLeader ?? playerId, reason: 'allPassed' },
        currentTurn: nextLeader ?? playerId,
        seq: state.seq + 1,
      },
    };
  }

  const next = findNextActive(state, playerId, { skipPassed: true });
  return {
    ok: true,
    state: { ...state, passedPlayers, lastSkip: null, lastBurn: null, currentTurn: next ?? playerId, seq: state.seq + 1 },
  };
}

/**
 * Un jugador se desconecta a mitad de la ronda: su mano se descarta y sale de la rotación de turnos, pero
 * no entra en `finishedOrder` (no recibe rol de esta ronda). Si no participaba en esta ronda (ya era
 * espectador) o ya estaba fuera, no hace nada.
 */
export function departFromGame(state: GameState, playerId: string): GameState {
  if (state.phase !== 'playing') return state;
  if (!state.seatOrder.includes(playerId)) return state;
  if (isOut(state, playerId)) return state;

  const hands = { ...state.hands };
  delete hands[playerId];
  const departedPlayers = [...state.departedPlayers, playerId];
  const passedPlayers = state.passedPlayers.filter((id) => id !== playerId);

  const working: GameState = { ...state, hands, departedPlayers, passedPlayers };

  const remainingActive = working.seatOrder.filter((id) => !isOut(working, id));
  if (remainingActive.length <= 1) {
    const finalOrder = remainingActive.length === 1 ? [...working.finishedOrder, remainingActive[0]] : working.finishedOrder;
    return finishGame(working, finalOrder);
  }

  if (working.currentTurn !== playerId) return working;

  const next = findNextActive(working, playerId, { skipPassed: true });
  return { ...working, currentTurn: next ?? working.currentTurn };
}
