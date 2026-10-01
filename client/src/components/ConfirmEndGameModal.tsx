import { motion } from 'framer-motion';
import './ConfirmEndGameModal.css';

interface ConfirmEndGameModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmEndGameModal({ onConfirm, onCancel }: ConfirmEndGameModalProps) {
  return (
    <motion.div
      className="confirm-end-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="confirm-end-modal"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <h2>Finalizar partida</h2>
        <p>¿Seguro que quieres finalizar la partida? Se cerrará la sala para todos los jugadores.</p>
        <div className="confirm-end-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="danger" onClick={onConfirm}>
            Finalizar partida
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
