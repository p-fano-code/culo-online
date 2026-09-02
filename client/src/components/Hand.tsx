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

export function Hand({ cards, isMyTurn, canPass, onPlay, onPass }: HandProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const sorted = sortHand(cards);
  const selectedCards = sorted.filter((card) => selected.has(cardKey(card)));

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
        {sorted.map((card) => (
          <Card
            key={cardKey(card)}
            card={card}
            selected={selected.has(cardKey(card))}
            onClick={isMyTurn ? () => toggle(card) : undefined}
          />
        ))}
      </div>
      {isMyTurn && (
        <div className="hand-actions">
          <button type="button" onClick={handlePlay} disabled={selectedCards.length === 0}>
            Jugar{selectedCards.length > 0 ? ` (${selectedCards.length})` : ''}
          </button>
          <button type="button" onClick={onPass} disabled={!canPass}>
            Pasar
          </button>
        </div>
      )}
    </div>
  );
}
