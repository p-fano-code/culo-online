import { useCallback, useEffect } from 'react';
import { socket } from '../socket';
import { useRoomStore, type Announcement, type RoomView } from '../store/roomStore';

type HostDroppedPayload = { previousHostName: string; newHostName: string };

const STORAGE_KEY = 'culo-online:session';

type StoredSession = { roomCode: string; playerId: string; token: string };

type SessionResponse =
  | { room: RoomView; playerId: string; token: string }
  | { error: string };

function loadStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function persistSession(session: StoredSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useRoom() {
  const {
    room,
    session,
    error,
    announcement,
    gameEndedNotice,
    setRoom,
    setSession,
    setError,
    setAnnouncement,
    setGameEndedNotice,
    clearGameEndedNotice,
    reset,
  } = useRoomStore();

  useEffect(() => {
    const handleRoomUpdate = (updated: RoomView) => setRoom(updated);
    socket.on('room:update', handleRoomUpdate);
    return () => {
      socket.off('room:update', handleRoomUpdate);
    };
  }, [setRoom]);

  useEffect(() => {
    const handleAnnouncement = (payload: Announcement) => setAnnouncement(payload);
    socket.on('room:announcement', handleAnnouncement);
    return () => {
      socket.off('room:announcement', handleAnnouncement);
    };
  }, [setAnnouncement]);

  useEffect(() => {
    const handleRoomClosed = () => {
      persistSession(null);
      setGameEndedNotice({ reason: 'closed' });
    };
    socket.on('room:closed', handleRoomClosed);
    return () => {
      socket.off('room:closed', handleRoomClosed);
    };
  }, [setGameEndedNotice]);

  useEffect(() => {
    const handleHostDropped = (payload: HostDroppedPayload) => {
      setGameEndedNotice({ reason: 'hostDropped', previousHostName: payload.previousHostName, newHostName: payload.newHostName });
    };
    socket.on('room:hostDropped', handleHostDropped);
    return () => {
      socket.off('room:hostDropped', handleHostDropped);
    };
  }, [setGameEndedNotice]);

  useEffect(() => {
    const stored = loadStoredSession();
    if (!stored) return;

    socket.emit('player:reconnect', stored, (response: SessionResponse) => {
      if ('error' in response) {
        persistSession(null);
        return;
      }
      setRoom(response.room);
      setSession({ roomCode: response.room.code, playerId: response.playerId, token: response.token });
    });
  }, [setRoom, setSession]);

  const createRoom = useCallback(
    (playerName: string) => {
      setError(null);
      socket.emit('room:create', { playerName }, (response: SessionResponse) => {
        if ('error' in response) return setError(response.error);
        const newSession = { roomCode: response.room.code, playerId: response.playerId, token: response.token };
        setRoom(response.room);
        setSession(newSession);
        persistSession(newSession);
      });
    },
    [setRoom, setSession, setError],
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => {
      setError(null);
      socket.emit('room:join', { roomCode, playerName }, (response: SessionResponse) => {
        if ('error' in response) return setError(response.error);
        const newSession = { roomCode: response.room.code, playerId: response.playerId, token: response.token };
        setRoom(response.room);
        setSession(newSession);
        persistSession(newSession);
      });
    },
    [setRoom, setSession, setError],
  );

  const startRoom = useCallback(() => {
    setError(null);
    socket.emit('room:start', {}, (response: { error?: string }) => {
      if (response?.error) setError(response.error);
    });
  }, [setError]);

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave');
    persistSession(null);
    reset();
  }, [reset]);

  const closeRoom = useCallback(() => {
    setError(null);
    socket.emit('room:close', {}, (response: { error?: string }) => {
      if (response?.error) setError(response.error);
    });
  }, [setError]);

  return {
    room,
    session,
    error,
    announcement,
    gameEndedNotice,
    createRoom,
    joinRoom,
    startRoom,
    leaveRoom,
    closeRoom,
    clearGameEndedNotice,
    resetRoom: reset,
  };
}
