import { create } from 'zustand';

export type PlayerView = {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
};

export type RoomView = {
  code: string;
  hostId: string;
  players: PlayerView[];
  state: 'lobby' | 'playing' | 'exchanging' | 'finished';
};

export type Session = {
  playerId: string;
  token: string;
  roomCode: string;
};

interface RoomStore {
  room: RoomView | null;
  session: Session | null;
  error: string | null;
  setRoom: (room: RoomView) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  session: null,
  error: null,
  setRoom: (room) => set({ room }),
  setSession: (session) => set({ session }),
  setError: (error) => set({ error }),
  reset: () => set({ room: null, session: null, error: null }),
}));
