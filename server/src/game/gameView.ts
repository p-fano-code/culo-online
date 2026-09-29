import type { Burn, Card, GamePhase, GameState, Play, Role, Skip } from './types.js';

export interface HandCount {
  playerId: string;
  count: number;
}

export interface GameView {
  hand: Card[];
  pile: Card[];
  requiredCount: number | null;
  currentTurn: string;
  lastPlay: Play | null;
  lastSkip: Skip | null;
  lastBurn: Burn | null;
  seq: number;
  finishedOrder: string[];
  roles: Record<string, Role>;
  phase: GamePhase;
  handCounts: HandCount[];
  seatOrder: string[];
  nextRoundDeadline: number | null;
}

/** Vista del estado de juego filtrada para un jugador: su mano completa, del resto solo el número de cartas. */
export function toGameView(state: GameState, playerId: string): GameView {
  return {
    hand: state.hands[playerId] ?? [],
    pile: state.pile,
    requiredCount: state.requiredCount,
    currentTurn: state.currentTurn,
    lastPlay: state.lastPlay,
    lastSkip: state.lastSkip,
    lastBurn: state.lastBurn,
    seq: state.seq,
    finishedOrder: state.finishedOrder,
    roles: state.roles,
    phase: state.phase,
    handCounts: state.seatOrder.map((id) => ({ playerId: id, count: state.hands[id]?.length ?? 0 })),
    seatOrder: state.seatOrder,
    nextRoundDeadline: state.nextRoundDeadline,
  };
}
