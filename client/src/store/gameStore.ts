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
  finishedOrder: string[];
  roles: Record<string, Role>;
  phase: 'playing' | 'finished';
  handCounts: HandCount[];
  seatOrder: string[];
}

interface GameStore {
  game: GameView | null;
  error: string | null;
  setGame: (game: GameView) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  error: null,
  setGame: (game) => set({ game }),
  setError: (error) => set({ error }),
  reset: () => set({ game: null, error: null }),
}));
