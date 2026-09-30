import { passTurn, playCards, type PlayResult } from './gameManager.js';
import type { GameState } from './types.js';

const TURN_TIMERS = new Map<string, NodeJS.Timeout>();

export const TURN_TIMEOUT_MS = 60 * 1000;

export function scheduleTurnTimeout(roomCode: string, callback: () => void): void {
  cancelTurnTimeout(roomCode);
  const timer = setTimeout(() => {
    TURN_TIMERS.delete(roomCode);
    callback();
  }, TURN_TIMEOUT_MS);
  TURN_TIMERS.set(roomCode, timer);
}

export function cancelTurnTimeout(roomCode: string): void {
  const timer = TURN_TIMERS.get(roomCode);
  if (timer) {
    clearTimeout(timer);
    TURN_TIMERS.delete(roomCode);
  }
}

/**
 * Acción automática cuando al jugador en turno se le acaba el tiempo: pasa turno. Si no se puede pasar
 * (mesa libre: inicio de ronda o tras una quema), juega una carta al azar de su mano.
 */
export function resolveTurnTimeout(state: GameState): PlayResult {
  const playerId = state.currentTurn;

  if (state.requiredCount !== null) return passTurn(state, playerId);

  const hand = state.hands[playerId] ?? [];
  if (hand.length === 0) return { ok: false, error: 'EMPTY_HAND' };

  const randomCard = hand[Math.floor(Math.random() * hand.length)];
  return playCards(state, playerId, [randomCard]);
}
