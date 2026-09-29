import { create } from 'zustand';

export type Suit = 'oros' | 'copas' | 'espadas' | 'bastos';

export interface Card {
  suit: Suit;
  rank: number;
}

export interface Play {
  playerId: string;
  cards: Card[];
}

export interface Skip {
  skippedPlayerId: string;
}

export interface Burn {
  burnedBy: string;
  reason: 'wild' | 'allPassed';
}

export type Role = 'presidente' | 'vicepresidente' | 'viceculo' | 'culo' | null;

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
  phase: 'playing' | 'finished';
  handCounts: HandCount[];
  seatOrder: string[];
  nextRoundDeadline: number | null;
}

export interface ExchangeView {
  involved: boolean;
  role: Role;
  gave: Card[];
  received: Card[];
  presidenteName: string | null;
  vicepresidenteName: string | null;
  viceculoName: string | null;
  culoName: string | null;
}

interface GameStore {
  game: GameView | null;
  error: string | null;
  exchange: ExchangeView | null;
  setGame: (game: GameView) => void;
  setError: (error: string | null) => void;
  setExchange: (exchange: ExchangeView | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  error: null,
  exchange: null,
  setGame: (game) => set({ game }),
  setError: (error) => set({ error }),
  setExchange: (exchange) => set({ exchange }),
  reset: () => set({ game: null, error: null, exchange: null }),
}));
