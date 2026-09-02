import { useState } from 'react';
import { Card } from './Card';
import { cardKey, sortHand } from '../game/cardDisplay';
import type { Card as CardType } from '../store/gameStore';

interface HandProps {
  cards: CardType[];
  isMyTurn: boolean;
  canPass: boolean;
  onPlay: (cards: CardType[]) => void;
  onPass: () => void;
}

const MAX_ROTATION_DEG = 10;
const ARC_HEIGHT_PX = 14;

function getOverlap(cardCount: number): number {
  if (cardCount <= 6) return 30;
  if (cardCount <= 10) return 40;
  if (cardCount <= 16) return 48;
  return 54;
}

function getFanTransform(index: number, total: number) {
  if (total <= 1) return { rotate: 0, y: 0 };
  const mid = (total - 1) / 2;
  const ratio = (index - mid) / mid;
  return { rotate: ratio * MAX_ROTATION_DEG, y: Math.abs(ratio) * ARC_HEIGHT_PX };
}

export function Hand({ cards, isMyTurn, canPass, onPlay, onPass }: HandProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const sorted = sortHand(cards);
  const selectedCards = sorted.filter((card) => selected.has(cardKey(card)));
  const overlap = getOverlap(sorted.length);

  const toggle = (card: CardType) => {
    const key = cardKey(card);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePlay = () => {
    if (selectedCards.length === 0) return;
    onPlay(selectedCards);
    setSelected(new Set());
  };

  return (
    <div className="hand">
      <div className="hand-cards">
        {sorted.map((card, index) => {
          const key = cardKey(card);
          const isSelected = selected.has(key);
          const { rotate, y } = getFanTransform(index, sorted.length);

          return (
            <Card
              key={key}
              card={card}
              selected={isSelected}
              onClick={isMyTurn ? () => toggle(card) : undefined}
              style={{
                marginLeft: index === 0 ? 0 : -overlap,
                zIndex: index,
                rotate,
                y: isSelected ? y - 16 : y,
              }}
            />
          );
        })}
      </div>
      {isMyTurn && (
        <div className="hand-actions">
          <button type="button" onClick={handlePlay} disabled={selectedCards.length === 0}>
            Jugar{selectedCards.length > 0 ? ` (${selectedCards.length})` : ''}
          </button>
          <button type="button" className="secondary" onClick={onPass} disabled={!canPass}>
            Pasar
          </button>
        </div>
      )}
    </div>
  );
}
