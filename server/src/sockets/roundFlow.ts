import type { Server } from 'socket.io';
import { createGame } from '../game/gameManager.js';
import { applyRoleExchange } from '../game/exchange.js';
import { getGame, setGame } from '../game/gameStore.js';
import { broadcastExchange, broadcastGameState } from '../game/broadcast.js';
import { scheduleAutoRestart, cancelAutoRestart, AUTO_RESTART_MS } from '../game/roundTimer.js';
import { scheduleTurnTimeout, cancelTurnTimeout, resolveTurnTimeout, TURN_TIMEOUT_MS } from '../game/turnTimer.js';
import { toRoomView } from '../rooms/roomManager.js';
import type { Room } from '../rooms/types.js';
import type { GameState } from '../game/types.js';

function broadcastRoomUpdate(io: Server, room: Room) {
  io.to(room.code).emit('room:update', toRoomView(room));
}

/**
 * Mantiene el temporizador de turno sincronizado con el estado: si la ronda terminó lo cancela; si el turno
 * sigue siendo el mismo (p. ej. se desconectó otro jugador) conserva el plazo; si no, arma 60s para el nuevo turno.
 */
function applyTurnTimer(io: Server, room: Room, previous: GameState | undefined, next: GameState): GameState {
  if (next.phase !== 'playing') {
    cancelTurnTimeout(room.code);
    return { ...next, turnDeadline: null };
  }

  const sameTurn =
    previous?.phase === 'playing' &&
    previous.turnDeadline !== null &&
    previous.currentTurn === next.currentTurn &&
    previous.seq === next.seq;
  if (sameTurn) return { ...next, turnDeadline: previous.turnDeadline };

  const expectedTurn = next.currentTurn;
  const expectedSeq = next.seq;
  scheduleTurnTimeout(room.code, () => handleTurnTimeout(io, room, expectedTurn, expectedSeq));
  return { ...next, turnDeadline: Date.now() + TURN_TIMEOUT_MS };
}

/** Se agotó el tiempo: pasa turno o, con la mesa libre, juega una carta al azar del jugador en turno. */
function handleTurnTimeout(io: Server, room: Room, expectedTurn: string, expectedSeq: number): void {
  const state = getGame(room.code);
  // evita que un temporizador antiguo actúe sobre un turno que ya cambió
  if (!state || state.phase !== 'playing' || state.currentTurn !== expectedTurn || state.seq !== expectedSeq) return;

  const result = resolveTurnTimeout(state);
  if (!result.ok) {
    console.warn(`[turnTimer] sala ${room.code}: no se pudo resolver el turno (${result.error})`);
    return;
  }
  armRoundEndIfNeeded(io, room, result.state);
}

/**
 * Se llama tras cualquier jugada/paso/desconexión que pueda haber terminado la ronda. Si de verdad acaba
 * de terminar, arma la cuenta atrás de 90s para la siguiente ronda (con inicio automático si nadie pulsa
 * el botón) y difunde el estado ya con el plazo incluido.
 */
export function armRoundEndIfNeeded(io: Server, room: Room, incomingState: GameState): void {
  const newState = applyTurnTimer(io, room, getGame(room.code), incomingState);

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
  game = applyTurnTimer(io, room, undefined, game);

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
