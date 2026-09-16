import type { Server } from 'socket.io';
import type { Room } from '../rooms/types.js';
import { getGame } from './gameStore.js';
import { toGameView } from './gameView.js';
import type { Transfer } from './exchange.js';
import type { Card, Role } from './types.js';

/** Envía a cada jugador de la sala su propia vista filtrada del estado de juego (nunca la mano de otros). */
export function broadcastGameState(io: Server, room: Room): void {
  const state = getGame(room.code);
  if (!state) return;

  for (const player of room.players) {
    if (!player.socketId) continue;
    io.to(player.socketId).emit('game:state', toGameView(state, player.id));
  }
}

export interface ExchangeView {
  involved: boolean;
  role: Role | null;
  gave: Card[];
  received: Card[];
  presidenteName: string | null;
  vicepresidenteName: string | null;
  viceculoName: string | null;
  culoName: string | null;
}

/** Envía a cada jugador su propia vista del intercambio entre rondas: solo los 4 implicados ven sus cartas. */
export function broadcastExchange(
  io: Server,
  room: Room,
  transfers: Transfer[],
  previousRoles: Record<string, Role>,
): void {
  const byPlayer = new Map(transfers.map((t) => [t.playerId, t]));
  const nameById = new Map(room.players.map((p) => [p.id, p.name]));

  const nameForRole = (role: Exclude<Role, null>): string | null => {
    const id = Object.entries(previousRoles).find(([, r]) => r === role)?.[0];
    return id ? (nameById.get(id) ?? null) : null;
  };

  const roleNames = {
    presidenteName: nameForRole('presidente'),
    vicepresidenteName: nameForRole('vicepresidente'),
    viceculoName: nameForRole('viceculo'),
    culoName: nameForRole('culo'),
  };

  for (const player of room.players) {
    if (!player.socketId) continue;
    const transfer = byPlayer.get(player.id);
    const view: ExchangeView = transfer
      ? { involved: true, role: transfer.role, gave: transfer.gave, received: transfer.received, ...roleNames }
      : { involved: false, role: null, gave: [], received: [], ...roleNames };
    io.to(player.socketId).emit('game:exchange', view);
  }
}
