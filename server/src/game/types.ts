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

export interface Burn {
  burnedBy: string; // quien provocó la quema (jugó un 2, o era el líder cuando todos pasaron)
  reason: 'wild' | 'allPassed';
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
  lastBurn: Burn | null; // refleja si la última jugada (y solo esa) quemó la mesa
  /** contador que se incrementa en cada jugada/pase/baja: permite al cliente distinguir dos
   * saltos o quemas consecutivos aunque involucren al mismo jugador (lastSkip/lastBurn por sí
   * solos no cambian de valor en ese caso). */
  seq: number;
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
  /** epoch ms en que se agota el turno del jugador actual; solo relevante con phase === 'playing'. */
  turnDeadline: number | null;
}
