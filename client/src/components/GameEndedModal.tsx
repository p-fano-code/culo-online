import { motion } from 'framer-motion';
import type { GameEndedNotice } from '../store/roomStore';
import './GameEndedModal.css';

interface GameEndedModalProps {
  notice: GameEndedNotice;
  onDismiss: () => void;
}

export function GameEndedModal({ notice, onDismiss }: GameEndedModalProps) {
  const isHostDropped = notice.reason === 'hostDropped';
  const title = isHostDropped ? 'El anfitrión se ha caído' : 'Partida finalizada';
  const message = isHostDropped
    ? `${notice.previousHostName} se ha desconectado. Ahora ${notice.newHostName} es el anfitrión y la partida continúa.`
    : 'El anfitrión ha finalizado la partida.';
  const buttonLabel = isHostDropped ? 'Entendido' : 'Volver al menú';

  return (
    <motion.div
      className="game-ended-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="game-ended-modal"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <h2>{title}</h2>
        <p>{message}</p>
        <button type="button" onClick={onDismiss}>
          {buttonLabel}
        </button>
      </motion.div>
    </motion.div>
  );
}
