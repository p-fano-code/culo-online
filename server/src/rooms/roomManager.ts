import { randomUUID } from 'node:crypto';
import type { Player, Room, RoomView } from './types.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0, O, 1, I para evitar confusiones al leerlo en voz alta
const CODE_LENGTH = 6;
const RECONNECT_GRACE_MS = 2 * 60 * 1000;
export const MAX_PLAYERS = 10;

const rooms = new Map<string, Room>();
const disconnectTimers = new Map<string, NodeJS.Timeout>();

type ErrorResult<TCode extends string> = { error: TCode };

function generateRoomCode(): string {
  let code: string;
  do {
    code = Array.from(
      { length: CODE_LENGTH },
      () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
    ).join('');
  } while (rooms.has(code));
  return code;
}

export function toRoomView(room: Room): RoomView {
  const pendingSpectators = room.players
    .filter((p) => p.spectatorSince !== null)
    .sort((a, b) => (a.spectatorSince as number) - (b.spectatorSince as number))
    .map((p) => p.id);

  return {
    code: room.code,
    hostId: room.hostId,
    state: room.state,
    players: room.players.map(({ id, name, isHost, connected, spectatorSince }) => ({
      id,
      name,
      isHost,
      connected,
      spectating: spectatorSince !== null,
    })),
    pendingSpectators,
  };
}

export function createRoom(playerName: string, socketId: string): { room: Room; player: Player } {
  const code = generateRoomCode();
  const player: Player = {
    id: randomUUID(),
    name: playerName,
    isHost: true,
    connected: true,
    socketId,
    token: randomUUID(),
    spectatorSince: null,
  };
  const room: Room = {
    code,
    hostId: player.id,
    players: [player],
    state: 'lobby',
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return { room, player };
}

export function joinRoom(
  code: string,
  playerName: string,
  socketId: string,
): { room: Room; player: Player } | ErrorResult<'ROOM_NOT_FOUND' | 'ROOM_FULL'> {
  const room = rooms.get(code);
  if (!room) return { error: 'ROOM_NOT_FOUND' };
  if (room.players.length >= MAX_PLAYERS) return { error: 'ROOM_FULL' };

  // Unirse una vez la sala ya ha empezado a jugar entra en modo espectador (ver docs/REGLAS.md).
  const player: Player = {
    id: randomUUID(),
    name: playerName,
    isHost: false,
    connected: true,
    socketId,
    token: randomUUID(),
    spectatorSince: room.state !== 'lobby' ? Date.now() : null,
  };
  room.players.push(player);
  return { room, player };
}

export function findRoomBySocket(socketId: string): { room: Room; player: Player } | null {
  for (const room of rooms.values()) {
    const player = room.players.find((p) => p.socketId === socketId);
    if (player) return { room, player };
  }
  return null;
}

export function reconnectPlayer(
  code: string,
  playerId: string,
  token: string,
  socketId: string,
): { room: Room; player: Player } | ErrorResult<'ROOM_NOT_FOUND' | 'INVALID_TOKEN'> {
  const room = rooms.get(code);
  if (!room) return { error: 'ROOM_NOT_FOUND' };
  const player = room.players.find((p) => p.id === playerId);
  if (!player || player.token !== token) return { error: 'INVALID_TOKEN' };

  const timerKey = `${code}:${playerId}`;
  const timer = disconnectTimers.get(timerKey);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(timerKey);
  }

  player.connected = true;
  player.socketId = socketId;
  return { room, player };
}

export function removePlayer(code: string, playerId: string): { room: Room; deleted: boolean } | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(code);
    return { room, deleted: true };
  }

  if (room.hostId === playerId) {
    const newHost = room.players[0];
    newHost.isHost = true;
    room.hostId = newHost.id;
  }

  return { room, deleted: false };
}

/**
 * Marca al jugador de este socket como desconectado y arranca el temporizador de gracia. A diferencia de
 * antes, NO purga automáticamente de `room.players` al expirar: es el llamador quien decide en `onExpire`
 * (por ejemplo, no purgar mientras una partida activa siga referenciando a este jugador).
 */
export function handleDisconnect(
  socketId: string,
  onExpire: (room: Room, player: Player) => void,
): { room: Room; player: Player } | null {
  const found = findRoomBySocket(socketId);
  if (!found) return null;
  const { room, player } = found;

  player.connected = false;
  player.socketId = null;

  const timerKey = `${room.code}:${player.id}`;
  const timer = setTimeout(() => {
    disconnectTimers.delete(timerKey);
    onExpire(room, player);
  }, RECONNECT_GRACE_MS);
  disconnectTimers.set(timerKey, timer);

  return { room, player };
}

export function leaveRoom(socketId: string): { room: Room; deleted: boolean } | null {
  const found = findRoomBySocket(socketId);
  if (!found) return null;

  const timerKey = `${found.room.code}:${found.player.id}`;
  const timer = disconnectTimers.get(timerKey);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(timerKey);
  }

  return removePlayer(found.room.code, found.player.id);
}

export function closeRoom(
  code: string,
  requesterId: string,
): { room: Room } | ErrorResult<'ROOM_NOT_FOUND' | 'NOT_HOST'> {
  const room = rooms.get(code);
  if (!room) return { error: 'ROOM_NOT_FOUND' };
  if (room.hostId !== requesterId) return { error: 'NOT_HOST' };

  for (const player of room.players) {
    const timerKey = `${code}:${player.id}`;
    const timer = disconnectTimers.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      disconnectTimers.delete(timerKey);
    }
  }

  rooms.delete(code);
  return { room };
}
