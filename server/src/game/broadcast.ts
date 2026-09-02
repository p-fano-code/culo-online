import type { Server } from 'socket.io';
import type { Room } from '../rooms/types.js';
import { getGame } from './gameStore.js';
import { toGameView } from './gameView.js';

/** Envía a cada jugador de la sala su propia vista filtrada del estado de juego (nunca la mano de otros). */
export function broadcastGameState(io: Server, room: Room): void {
  const state = getGame(room.code);
  if (!state) return;

  for (const player of room.players) {
    if (!player.socketId) continue;
    io.to(player.socketId).emit('game:state', toGameView(state, player.id));
  }
}
