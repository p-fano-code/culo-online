import { motion } from 'framer-motion';
import type { Card as CardType } from '../store/gameStore';
import { rankLabel, suitColor, suitLabel, suitSymbol } from '../game/cardDisplay';
import './Card.css';

interface CardProps {
  card: CardType;
  selected?: boolean;
  onClick?: () => void;
}

export function Card({ card, selected, onClick }: CardProps) {
  return (
    <motion.button
      type="button"
      layout
      className={`playing-card${selected ? ' selected' : ''}${onClick ? '' : ' inert'}`}
      style={{ color: suitColor(card.suit) }}
      onClick={onClick}
      disabled={!onClick}
      whileHover={onClick ? { y: -8 } : undefined}
      title={`${rankLabel(card.rank)} de ${suitLabel(card.suit)}`}
    >
      <span className="rank">{rankLabel(card.rank)}</span>
      <span className="suit">{suitSymbol(card.suit)}</span>
    </motion.button>
  );
}
