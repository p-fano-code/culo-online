import type { Server, Socket } from 'socket.io';
import {
  createRoom,
  findRoomBySocket,
  handleDisconnect,
  joinRoom,
  leaveRoom,
  reconnectPlayer,
  startRoom,
  toRoomView,
} from '../rooms/roomManager.js';
import type { Room, RoomView } from '../rooms/types.js';
import { broadcastGameState } from '../game/broadcast.js';
import { createGame } from '../game/gameManager.js';
import { getGame, setGame } from '../game/gameStore.js';

type CreateRoomPayload = { playerName: string };
type JoinRoomPayload = { roomCode: string; playerName: string };
type ReconnectPayload = { roomCode: string; playerId: string; token: string };

type SessionResponse =
  | { room: RoomView; playerId: string; token: string }
  | { error: string };

type Ack<T> = (response: T) => void;

function broadcastRoomUpdate(io: Server, room: Room) {
  io.to(room.code).emit('room:update', toRoomView(room));
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on('room:create', (payload: CreateRoomPayload, ack: Ack<SessionResponse>) => {
    const playerName = payload?.playerName?.trim();
    if (!playerName) return ack({ error: 'INVALID_NAME' });

    const { room, player } = createRoom(playerName, socket.id);
    socket.join(room.code);
    ack({ room: toRoomView(room), playerId: player.id, token: player.token });
  });

  socket.on('room:join', (payload: JoinRoomPayload, ack: Ack<SessionResponse>) => {
    const playerName = payload?.playerName?.trim();
    const roomCode = payload?.roomCode?.trim().toUpperCase();
    if (!playerName || !roomCode) return ack({ error: 'INVALID_NAME' });

    const result = joinRoom(roomCode, playerName, socket.id);
    if ('error' in result) return ack(result);

    socket.join(result.room.code);
    ack({ room: toRoomView(result.room), playerId: result.player.id, token: result.player.token });
    broadcastRoomUpdate(io, result.room);
  });

  socket.on('player:reconnect', (payload: ReconnectPayload, ack: Ack<SessionResponse>) => {
    const result = reconnectPlayer(payload?.roomCode, payload?.playerId, payload?.token, socket.id);
    if ('error' in result) return ack(result);

    socket.join(result.room.code);
    ack({ room: toRoomView(result.room), playerId: result.player.id, token: result.player.token });
    broadcastRoomUpdate(io, result.room);
    if (getGame(result.room.code)) broadcastGameState(io, result.room);
  });

  socket.on('room:start', (_payload: unknown, ack?: Ack<{ error?: string }>) => {
    const found = findRoomBySocket(socket.id);
    if (!found) return ack?.({ error: 'ROOM_NOT_FOUND' });

    const result = startRoom(found.room.code, found.player.id);
    if ('error' in result) return ack?.(result);

    const playerIds = result.room.players.map((p) => p.id);
    setGame(result.room.code, createGame(playerIds));

    broadcastRoomUpdate(io, result.room);
    broadcastGameState(io, result.room);
    ack?.({});
  });

  socket.on('room:leave', () => {
    const result = leaveRoom(socket.id);
    if (result && !result.deleted) broadcastRoomUpdate(io, result.room);
  });

  socket.on('disconnect', () => {
    const result = handleDisconnect(socket.id, (room) => broadcastRoomUpdate(io, room));
    if (result) broadcastRoomUpdate(io, result.room);
  });
}
