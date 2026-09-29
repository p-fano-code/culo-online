import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Card } from './Card';
import type { ExchangeView, Role } from '../store/gameStore';
import './ExchangeModal.css';

interface ExchangeModalProps {
  exchange: ExchangeView;
  onDone: () => void;
}

const DISPLAY_MS = 4000;

const ROLE_LABELS: Record<Exclude<Role, null>, string> = {
  presidente: 'Presidente',
  vicepresidente: 'Vicepresidente',
  viceculo: 'Viceculo',
  culo: 'Culo',
};

export function ExchangeModal({ exchange, onDone }: ExchangeModalProps) {
  useEffect(() => {
    const timeout = setTimeout(onDone, DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [onDone]);

  const pairs: Array<[string | null, string | null]> = [
    [exchange.culoName, exchange.presidenteName],
    [exchange.viceculoName, exchange.vicepresidenteName],
  ];

  return (
    <motion.div className="exchange-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="exchange-modal"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <h2>Intercambio de cartas</h2>

        {exchange.involved && exchange.role ? (
          <>
            <p className="exchange-role">Eres {ROLE_LABELS[exchange.role]}</p>
            <div className="exchange-cards">
              <div className="exchange-column">
                <span className="exchange-label">Has dado</span>
                <div className="exchange-card-row">
                  {exchange.gave.map((card) => (
                    <Card key={`${card.suit}-${card.rank}`} card={card} />
                  ))}
                </div>
              </div>
              <div className="exchange-arrow">⇄</div>
              <div className="exchange-column">
                <span className="exchange-label">Has recibido</span>
                <div className="exchange-card-row">
                  {exchange.received.map((card) => (
                    <Card key={`${card.suit}-${card.rank}`} card={card} />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="exchange-info">
            {pairs.map(([lower, upper]) =>
              lower && upper ? (
                <p key={`${lower}-${upper}`}>
                  {lower} y {upper} están intercambiando cartas...
                </p>
              ) : null,
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
