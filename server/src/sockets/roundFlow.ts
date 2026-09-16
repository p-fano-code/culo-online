import type { Server } from 'socket.io';
import { createGame } from '../game/gameManager.js';
import { applyRoleExchange } from '../game/exchange.js';
import { getGame, setGame } from '../game/gameStore.js';
import { broadcastExchange, broadcastGameState } from '../game/broadcast.js';
import { scheduleAutoRestart, cancelAutoRestart, AUTO_RESTART_MS } from '../game/roundTimer.js';
import { toRoomView } from '../rooms/roomManager.js';
import type { Room } from '../rooms/types.js';
import type { GameState } from '../game/types.js';

function broadcastRoomUpdate(io: Server, room: Room) {
  io.to(room.code).emit('room:update', toRoomView(room));
}

/**
 * Se llama tras cualquier jugada/paso/desconexión que pueda haber terminado la ronda. Si de verdad acaba
 * de terminar, arma la cuenta atrás de 90s para la siguiente ronda (con inicio automático si nadie pulsa
 * el botón) y difunde el estado ya con el plazo incluido.
 */
export function armRoundEndIfNeeded(io: Server, room: Room, newState: GameState): void {
  if (newState.phase !== 'finished') {
    setGame(room.code, newState);
    broadcastGameState(io, room);
    return;
  }

  const deadline = Date.now() + AUTO_RESTART_MS;
  setGame(room.code, { ...newState, nextRoundDeadline: deadline });
  scheduleAutoRestart(room.code, () => {
    startNextRound(io, room, { manual: false });
  });
  broadcastGameState(io, room);
}

/**
 * Reparte una nueva ronda en la sala: la primera vez (sin partida previa) es el "Empezar partida" de
 * siempre; a partir de la segunda, purga a los desconectados, calcula el rol forzoso de quien entró a
 * mitad de la ronda anterior (por orden de llegada a la cola de espera) y aplica el intercambio de cartas
 * automático entre Presidente/Culo y Vicepresidente/Viceculo sobre la mano ya repartida.
 */
export function startNextRound(io: Server, room: Room, { manual }: { manual: boolean }): { error?: string } {
  cancelAutoRestart(room.code);

  const previousGame = getGame(room.code);
  if (previousGame && previousGame.phase === 'playing') {
    return { error: 'ROUND_IN_PROGRESS' };
  }

  const eligiblePlayers = room.players.filter((p) => p.connected);
  if (eligiblePlayers.length < 2) {
    return { error: 'NOT_ENOUGH_PLAYERS' };
  }

  let forcedCuloId: string | null = null;
  let forcedViceculoId: string | null = null;

  if (previousGame) {
    const veterans = new Set(previousGame.finishedOrder);
    const newEntrants = eligiblePlayers
      .filter((p) => !veterans.has(p.id))
      .sort((a, b) => (a.spectatorSince ?? 0) - (b.spectatorSince ?? 0));

    if (newEntrants.length >= 1) forcedCuloId = newEntrants[newEntrants.length - 1].id;
    if (newEntrants.length >= 2) forcedViceculoId = newEntrants[newEntrants.length - 2].id;
  }

  eligiblePlayers.forEach((p) => {
    p.spectatorSince = null;
  });
  room.players = eligiblePlayers;
  room.state = 'playing';

  const previousCuloId = previousGame
    ? (Object.entries(previousGame.roles).find(([, role]) => role === 'culo')?.[0] ?? undefined)
    : undefined;

  let game = createGame(eligiblePlayers.map((p) => p.id), previousCuloId, forcedCuloId, forcedViceculoId);

  broadcastRoomUpdate(io, room);

  if (previousGame) {
    const { hands, transfers } = applyRoleExchange(game.hands, previousGame.roles);
    game = { ...game, hands };
    setGame(room.code, game);
    broadcastExchange(io, room, transfers, previousGame.roles);
  } else {
    setGame(room.code, game);
  }

  broadcastGameState(io, room);
  return {};
}
