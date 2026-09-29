import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Role } from '../store/gameStore';
import type { PlayerView } from '../store/roomStore';
import pirateHappy from '../assets/pirata/pirata_rie.png';
import pirateSorry from '../assets/pirata/pirata_2.png';
import pirateNeutral from '../assets/pirata/pirata_3.png';
import './GameOverModal.css';

interface GameOverModalProps {
  finishedOrder: string[];
  roles: Record<string, Role>;
  players: PlayerView[];
  myPlayerId: string;
  isHost: boolean;
  nextRoundDeadline: number | null;
  roomError: string | null;
  onLeaveRoom: () => void;
  onCloseRoom: () => void;
  onStartNextRound: () => void;
}

const ROLE_LABELS: Record<Exclude<Role, null>, string> = {
  presidente: 'Presidente',
  vicepresidente: 'Vicepresidente',
  viceculo: 'Viceculo',
  culo: 'Culo',
};

const ROOM_ERROR_MESSAGES: Record<string, string> = {
  NOT_ENOUGH_PLAYERS: 'Se necesitan al menos 2 jugadores conectados para empezar otra ronda.',
  ROUND_IN_PROGRESS: 'La ronda ya ha empezado.',
};

function playerName(players: PlayerView[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id;
}

function getPirateReaction(role: Role): { image: string; message: string } {
  switch (role) {
    case 'presidente':
      return { image: pirateHappy, message: '¡Felicidades, eres el Presidente!' };
    case 'vicepresidente':
      return { image: pirateHappy, message: '¡Felicidades, eres el Vicepresidente!' };
    case 'viceculo':
      return { image: pirateSorry, message: 'Lo siento... te toca ser el Viceculo.' };
    case 'culo':
      return { image: pirateSorry, message: 'Lo siento... te toca ser el Culo.' };
    default:
      return { image: pirateNeutral, message: '¡Te has librado, eres neutro!!' };
  }
}

export function GameOverModal({
  finishedOrder,
  roles,
  players,
  myPlayerId,
  isHost,
  nextRoundDeadline,
  roomError,
  onLeaveRoom,
  onCloseRoom,
  onStartNextRound,
}: GameOverModalProps) {
  const reaction = getPirateReaction(roles[myPlayerId] ?? null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (nextRoundDeadline === null) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [nextRoundDeadline]);

  const remainingSeconds =
    nextRoundDeadline !== null ? Math.max(0, Math.ceil((nextRoundDeadline - now) / 1000)) : null;

  return (
    <motion.div className="gameover-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="gameover-modal"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.15 }}
      >
        <h1>Partida terminada</h1>

        <div className="gameover-pirate">
          <img src={reaction.image} alt="" className="pirate-avatar" />
          <div className="pirate-bubble">{reaction.message}</div>
        </div>

        <ol className="podium">
          {finishedOrder.map((id, index) => {
            const role = roles[id];
            const classes = [
              'podium-row',
              role ? `podium-${role}` : '',
              id === myPlayerId ? 'podium-me' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li key={id} className={classes}>
                <span className="podium-rank">{index + 1}º</span>
                <span className="podium-name">{playerName(players, id)}</span>
                {role && <span className="podium-role">{ROLE_LABELS[role]}</span>}
              </li>
            );
          })}
        </ol>

        {remainingSeconds !== null && (
          <p className="gameover-countdown">
            {remainingSeconds > 0
              ? `La próxima ronda empieza en ${remainingSeconds}s`
              : 'Empezando la próxima ronda...'}
          </p>
        )}

        <div className="gameover-actions">
          {isHost && (
            <button type="button" onClick={onStartNextRound}>
              Jugar otra ronda
            </button>
          )}
          <button type="button" className="secondary" onClick={onLeaveRoom}>
            Salir al menú principal
          </button>
          {isHost && (
            <button type="button" className="danger" onClick={onCloseRoom}>
              Finalizar partida
            </button>
          )}
        </div>

        {roomError && <p className="lobby-error">{ROOM_ERROR_MESSAGES[roomError] ?? roomError}</p>}
      </motion.div>
    </motion.div>
  );
}
