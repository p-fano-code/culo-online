import { AnimatePresence, motion } from 'framer-motion';
import './TurnBanner.css';

interface TurnBannerProps {
  isMyTurn: boolean;
  currentPlayerName: string;
  /** cambia en cada turno: reinicia la animación de entrada aunque repita el mismo jugador */
  turnKey: string;
}

/** Cartel grande encima de la mesa que indica de quién es el turno. */
export function TurnBanner({ isMyTurn, currentPlayerName, turnKey }: TurnBannerProps) {
  return (
    <div className="turn-banner-slot" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.h1
          key={turnKey}
          className={`turn-banner${isMyTurn ? ' mine' : ''}`}
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        >
          {isMyTurn ? (
            '¡Tu turno!'
          ) : (
            <>
              Turno de <span className="turn-banner-name">{currentPlayerName}</span>
            </>
          )}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
