export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  socketId: string | null;
  token: string;
  /** epoch ms desde que este jugador espera a la siguiente ronda (unión a mitad de partida o desconexión); null si no espera. */
  spectatorSince: number | null;
}

export type RoomState = 'lobby' | 'playing' | 'exchanging' | 'finished';

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  state: RoomState;
  createdAt: number;
}

export interface PlayerView {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  spectating: boolean;
}

export interface RoomView {
  code: string;
  hostId: string;
  players: PlayerView[];
  state: RoomState;
  /** ids en espera de la siguiente ronda, ordenados por cuándo empezaron a esperar (el último será Culo forzoso). */
  pendingSpectators: string[];
}
