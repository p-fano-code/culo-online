import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import pirateError from '../assets/pirata/pirata_2.png';
import pirateHappy from '../assets/pirata/pirata_rie.png';
import pirateWait from '../assets/pirata/pirata_3.png';
import './PirateNarrator.css';

interface PirateNarratorProps {
  errorCode: string | null;
  isMyTurn: boolean;
  currentPlayerName: string;
}

const ERROR_DISPLAY_MS = 3500;

const ERROR_PHRASES: Record<string, string> = {
  NOT_YOUR_TURN: '¡Espera tu turno, grumete!',
  INVALID_CARD_COUNT: '¡Ni una carta de más ni de menos!',
  CARDS_NOT_IN_HAND: '¡Esas cartas no las tienes, tunante!',
  CARDS_MUST_MATCH_RANK: '¡Todas las cartas deben ser del mismo valor!',
  MUST_MATCH_PLAY_COUNT: '¡Tienes que igualar el número de cartas!',
  CARD_TOO_LOW: '¡Tu carta es más baja!',
  CANNOT_PASS_ON_FREE_PLAY: '¡No puedes pasar, te toca abrir tú!',
  GAME_FINISHED: '¡La partida ya se acabó!',
  GAME_NOT_STARTED: '¡La partida aún no ha empezado!',
  ROOM_NOT_FOUND: '¡Esa sala ya no existe!',
};

function toPirateSpeech(code: string): string {
  return ERROR_PHRASES[code] ?? '¡Eso no se puede hacer!';
}

export function PirateNarrator({ errorCode, isMyTurn, currentPlayerName }: PirateNarratorProps) {
  const [prevCode, setPrevCode] = useState<string | null>(null);
  const [errorExpired, setErrorExpired] = useState(false);

  if (errorCode !== prevCode) {
    setPrevCode(errorCode);
    if (errorCode) setErrorExpired(false);
  }

  useEffect(() => {
    if (!errorCode || errorExpired) return;
    const timeout = setTimeout(() => setErrorExpired(true), ERROR_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [errorCode, errorExpired]);

  const showingError = Boolean(errorCode) && !errorExpired;

  const image = showingError ? pirateError : isMyTurn ? pirateHappy : pirateWait;
  const message = showingError
    ? toPirateSpeech(errorCode as string)
    : isMyTurn
      ? '¡Es tu turno, adelante!'
      : `Es el turno de ${currentPlayerName}...`;

  return (
    <div className="pirate-narrator">
      <AnimatePresence mode="wait">
        <motion.img
          key={image}
          src={image}
          alt=""
          className="pirate-avatar"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          className={`pirate-bubble${showingError ? ' pirate-bubble-error' : ''}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
