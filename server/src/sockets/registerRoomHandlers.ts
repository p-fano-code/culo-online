import type { Server, Socket } from 'socket.io';
import {
  closeRoom,
  createRoom,
  findRoomBySocket,
  handleDisconnect,
  joinRoom,
  leaveRoom,
  reconnectPlayer,
  removePlayer,
  toRoomView,
} from '../rooms/roomManager.js';
import type { Room, RoomView } from '../rooms/types.js';
import { deleteGame, getGame } from '../game/gameStore.js';
import { departFromGame } from '../game/gameManager.js';
import { broadcastGameState } from '../game/broadcast.js';
import { cancelTurnTimeout } from '../game/turnTimer.js';
import { armRoundEndIfNeeded, startNextRound } from './roundFlow.js';

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

function broadcastAnnouncement(io: Server, room: Room, type: 'joined' | 'left', playerName: string) {
  io.to(room.code).emit('room:announcement', { type, playerName, timestamp: Date.now() });
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

    if (result.player.spectatorSince !== null) {
      broadcastAnnouncement(io, result.room, 'joined', result.player.name);
    }
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
    if (found.room.hostId !== found.player.id) return ack?.({ error: 'NOT_HOST' });

    const result = startNextRound(io, found.room, { manual: true });
    if (result.error) return ack?.({ error: result.error });

    ack?.({});
  });

  socket.on('room:leave', () => {
    const result = leaveRoom(socket.id);
    if (result && !result.deleted) broadcastRoomUpdate(io, result.room);
  });

  socket.on('room:close', (_payload: unknown, ack?: Ack<{ error?: string }>) => {
    const found = findRoomBySocket(socket.id);
    if (!found) return ack?.({ error: 'ROOM_NOT_FOUND' });

    const result = closeRoom(found.room.code, found.player.id);
    if ('error' in result) return ack?.(result);

    cancelTurnTimeout(result.room.code);
    deleteGame(result.room.code);
    io.to(result.room.code).emit('room:closed');

    const socketsInRoom = io.sockets.adapter.rooms.get(result.room.code);
    if (socketsInRoom) {
      for (const socketId of [...socketsInRoom]) {
        io.sockets.sockets.get(socketId)?.leave(result.room.code);
      }
    }

    ack?.({});
  });

  socket.on('disconnect', () => {
    const result = handleDisconnect(socket.id, (room, player) => {
      const game = getGame(room.code);
      const stillInActiveGame = game?.phase === 'playing' && game.seatOrder.includes(player.id);
      if (stillInActiveGame) return; // se purgará al empezar la siguiente ronda, no antes

      const removed = removePlayer(room.code, player.id);
      if (removed && !removed.deleted) broadcastRoomUpdate(io, removed.room);
    });

    if (!result) return;
    broadcastRoomUpdate(io, result.room);

    const game = getGame(result.room.code);
    const wasActivelyPlaying =
      game?.phase === 'playing' &&
      game.seatOrder.includes(result.player.id) &&
      !game.departedPlayers.includes(result.player.id) &&
      !game.finishedOrder.includes(result.player.id);

    if (wasActivelyPlaying && game) {
      result.player.spectatorSince = Date.now();
      const updated = departFromGame(game, result.player.id);
      armRoundEndIfNeeded(io, result.room, updated);
      broadcastAnnouncement(io, result.room, 'left', result.player.name);
    }
  });
}
