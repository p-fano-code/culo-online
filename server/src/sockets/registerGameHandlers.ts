import type { Server, Socket } from 'socket.io';
import { findRoomBySocket } from '../rooms/roomManager.js';
import { getGame } from '../game/gameStore.js';
import { playCards, passTurn } from '../game/gameManager.js';
import type { Card } from '../game/types.js';
import { armRoundEndIfNeeded } from './roundFlow.js';

type Ack<T> = (response: T) => void;

export function registerGameHandlers(io: Server, socket: Socket) {
  socket.on('game:play', (payload: { cards: Card[] }, ack?: Ack<{ error?: string }>) => {
    const found = findRoomBySocket(socket.id);
    if (!found) return ack?.({ error: 'ROOM_NOT_FOUND' });

    const state = getGame(found.room.code);
    if (!state) return ack?.({ error: 'GAME_NOT_STARTED' });

    const result = playCards(state, found.player.id, payload?.cards ?? []);
    if (!result.ok) return ack?.({ error: result.error });

    armRoundEndIfNeeded(io, found.room, result.state);
    ack?.({});
  });

  socket.on('game:pass', (_payload: unknown, ack?: Ack<{ error?: string }>) => {
    const found = findRoomBySocket(socket.id);
    if (!found) return ack?.({ error: 'ROOM_NOT_FOUND' });

    const state = getGame(found.room.code);
    if (!state) return ack?.({ error: 'GAME_NOT_STARTED' });

    const result = passTurn(state, found.player.id);
    if (!result.ok) return ack?.({ error: result.error });

    armRoundEndIfNeeded(io, found.room, result.state);
    ack?.({});
  });
}
