export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  socketId: string | null;
  token: string;
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
}

export interface RoomView {
  code: string;
  hostId: string;
  players: PlayerView[];
  state: RoomState;
}
