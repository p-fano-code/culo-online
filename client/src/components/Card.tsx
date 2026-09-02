import { motion, type MotionStyle } from 'framer-motion';
import type { Card as CardType } from '../store/gameStore';
import { rankLabel, suitColor, suitLabel } from '../game/cardDisplay';
import { SuitIcon } from './SuitIcon';
import './Card.css';

interface CardProps {
  card: CardType;
  selected?: boolean;
  onClick?: () => void;
  style?: MotionStyle;
}

export function Card({ card, selected, onClick, style }: CardProps) {
  const label = `${rankLabel(card.rank)} de ${suitLabel(card.suit)}`;

  return (
    <motion.div
      layout
      className={`playing-card${selected ? ' selected' : ''}${onClick ? ' clickable' : ''}`}
      style={{ color: suitColor(card.suit), ...style }}
      onClick={onClick}
      whileHover={onClick ? { y: -28, rotate: 0, scale: 1.08, zIndex: 30 } : undefined}
    >
      <div className="playing-card-face">
        <span className="corner top">{rankLabel(card.rank)}</span>
        <span className="pip">
          <SuitIcon suit={card.suit} />
        </span>
        <span className="corner bottom">{rankLabel(card.rank)}</span>
      </div>
      <span className="card-caption">{label}</span>
    </motion.div>
  );
}
