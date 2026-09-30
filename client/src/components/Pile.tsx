import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card } from './Card';
import type { Burn, Play } from '../store/gameStore';
import type { PlayerView } from '../store/roomStore';

interface PileProps {
  lastPlay: Play | null;
  lastBurn: Burn | null;
  seq: number;
  players: PlayerView[];
}

/** Tiempo que se ve en la mesa el 2 (o los 2) que quemó la mesa antes de limpiarla. */
const WILD_CLEAR_DELAY_MS = 3000;

function playerName(players: PlayerView[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id;
}

/**
 * Mesa central. Al jugar un 2 el servidor quema la mesa pero deja ese 2 como `lastPlay`: aquí se
 * muestra unos segundos y después se pasa a "Mesa libre".
 */
export function Pile({ lastPlay, lastBurn, seq, players }: PileProps) {
  const [prevSeq, setPrevSeq] = useState(seq);
  const [showingWild, setShowingWild] = useState(false);
  const wildBurn = lastBurn?.reason === 'wild';

  // `seq` cambia en cada jugada: así dos 2 seguidos reinician el retardo cada vez.
  if (seq !== prevSeq) {
    setPrevSeq(seq);
    setShowingWild(wildBurn);
  }

  useEffect(() => {
    if (!showingWild) return;
    const timeout = setTimeout(() => setShowingWild(false), WILD_CLEAR_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [showingWild, seq]);

  const shownPlay = wildBurn && !showingWild ? null : lastPlay;
  // clave por contenido: los pases (que también cambian `seq`) no hacen parpadear las cartas
  const playKey = shownPlay
    ? `${shownPlay.playerId}:${shownPlay.cards.map((c) => `${c.suit}-${c.rank}`).join(',')}`
    : 'empty';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={playKey}
        className="pile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {shownPlay ? (
          <>
            <p>{playerName(players, shownPlay.playerId)} jugó:</p>
            <div className="pile-cards">
              {shownPlay.cards.map((card) => (
                <Card key={`${card.suit}-${card.rank}`} card={card} />
              ))}
            </div>
          </>
        ) : (
          <p className="pile-placeholder">Mesa libre</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
