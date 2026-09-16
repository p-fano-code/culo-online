import { create } from 'zustand';

export type PlayerView = {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  spectating: boolean;
};

export type RoomView = {
  code: string;
  hostId: string;
  players: PlayerView[];
  state: 'lobby' | 'playing' | 'exchanging' | 'finished';
  pendingSpectators: string[];
};

export type Session = {
  playerId: string;
  token: string;
  roomCode: string;
};

export type Announcement = {
  type: 'joined' | 'left';
  playerName: string;
  timestamp: number;
};

interface RoomStore {
  room: RoomView | null;
  session: Session | null;
  error: string | null;
  announcement: Announcement | null;
  setRoom: (room: RoomView) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  setAnnouncement: (announcement: Announcement) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  session: null,
  error: null,
  announcement: null,
  setRoom: (room) => set({ room }),
  setSession: (session) => set({ session }),
  setError: (error) => set({ error }),
  setAnnouncement: (announcement) => set({ announcement }),
  reset: () => set({ room: null, session: null, error: null, announcement: null }),
}));
