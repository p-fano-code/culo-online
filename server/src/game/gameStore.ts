import type { GameState } from './types.js';

const games = new Map<string, GameState>();

export function setGame(roomCode: string, state: GameState): void {
  games.set(roomCode, state);
}

export function getGame(roomCode: string): GameState | undefined {
  return games.get(roomCode);
}

export function deleteGame(roomCode: string): void {
  games.delete(roomCode);
}
