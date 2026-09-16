export type Suit = 'oros' | 'copas' | 'espadas' | 'bastos';

export interface Card {
  suit: Suit;
  rank: number;
}

export type Role = 'presidente' | 'vicepresidente' | 'viceculo' | 'culo' | null;

export interface Play {
  playerId: string;
  cards: Card[];
}

export interface Skip {
  skippedPlayerId: string;
}

export type GamePhase = 'playing' | 'finished';

export interface GameState {
  hands: Record<string, Card[]>;
  seatOrder: string[]; // orden de asiento fijo, establecido al repartir
  currentTurn: string;
  pile: Card[];
  requiredCount: number | null;
  passedPlayers: string[];
  lastPlay: Play | null;
  lastSkip: Skip | null; // refleja si la última jugada (y solo esa) provocó un salto de turno
  finishedOrder: string[];
  /** jugadores que se desconectaron a mitad de esta ronda: mano descartada, fuera de la rotación, sin rol de esta ronda. */
  departedPlayers: string[];
  roles: Record<string, Role>;
  phase: GamePhase;
  /** ids con rol forzoso para el cierre de esta ronda (por haber entrado a mitad de la ronda anterior). */
  forcedCuloId: string | null;
  forcedViceculoId: string | null;
  /** epoch ms del final de la cuenta atrás para la siguiente ronda; solo relevante con phase === 'finished'. */
  nextRoundDeadline: number | null;
}
