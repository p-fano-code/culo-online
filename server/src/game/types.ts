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

export type GamePhase = 'playing' | 'finished';

export interface GameState {
  hands: Record<string, Card[]>;
  seatOrder: string[]; // orden de asiento fijo, establecido al repartir
  currentTurn: string;
  pile: Card[];
  requiredCount: number | null;
  passedPlayers: string[];
  lastPlay: Play | null;
  finishedOrder: string[];
  roles: Record<string, Role>;
  phase: GamePhase;
}
