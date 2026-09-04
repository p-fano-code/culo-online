import { motion, type MotionStyle } from 'framer-motion';
import type { Card as CardType } from '../store/gameStore';
import { rankLabel, suitColor, suitLabel } from '../game/cardDisplay';
import { getCardImage } from '../game/cardImages';
import { SuitIcon } from './SuitIcon';
import logo from '../assets/logo.png';
import './Card.css';

interface CardProps {
  card: CardType;
  selected?: boolean;
  onClick?: () => void;
  style?: MotionStyle;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  faceDown?: boolean;
}

export function Card({ card, selected, onClick, style, onHoverStart, onHoverEnd, faceDown }: CardProps) {
  const label = `${rankLabel(card.rank)} de ${suitLabel(card.suit)}`;
  const imageSrc = getCardImage(card);

  return (
    <motion.div
      layout
      className={`playing-card${selected ? ' selected' : ''}${onClick ? ' clickable' : ''}`}
      style={{ color: suitColor(card.suit), ...style }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      onClick={onClick}
      onHoverStart={onClick ? onHoverStart : undefined}
      onHoverEnd={onClick ? onHoverEnd : undefined}
    >
      <motion.div
        className="playing-card-flip"
        animate={{ rotateY: faceDown ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`playing-card-face${imageSrc ? ' has-image' : ''}`}>
          {imageSrc ? (
            <img src={imageSrc} alt={label} className="card-face-image" />
          ) : (
            <>
              <span className="corner top">{rankLabel(card.rank)}</span>
              <span className="pip">
                <SuitIcon suit={card.suit} />
              </span>
              <span className="corner bottom">{rankLabel(card.rank)}</span>
            </>
          )}
        </div>
        <div className="playing-card-back">
          <img src={logo} alt="" className="card-back-logo" />
        </div>
      </motion.div>
      {!faceDown && <span className="card-caption">{label}</span>}
    </motion.div>
  );
}
