import { useEffect, useState, type TouchEvent } from 'react';
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
const HOVER_LIFT_PX = 34;
const HOVER_SCALE_BOOST = 0.14;
const HOVER_SPREAD_RATIO = 0.65;
const COLLAPSED_OVERLAP_PX = 70;
/** debe coincidir con el ancho de .playing-card-flip en Card.css */
const CARD_WIDTH_PX = 78;
/** margen horizontal que dejamos a la mano respecto al borde de la ventana */
const HAND_SIDE_PADDING_PX = 64;
/** nunca dejamos visible menos que esto de cada carta, aunque haya que desbordar */
const MIN_VISIBLE_PX = 12;

/** Solape deseado según el nº de cartas, ajustado para que la mano quepa en el ancho disponible. */
function getOverlap(cardCount: number, viewportWidth: number): number {
  const desired = cardCount <= 6 ? 22 : cardCount <= 10 ? 34 : cardCount <= 16 ? 44 : 52;
  if (cardCount <= 1) return desired;

  const available = viewportWidth - HAND_SIDE_PADDING_PX;
  const minOverlapToFit = CARD_WIDTH_PX - (available - CARD_WIDTH_PX) / (cardCount - 1);
  return Math.min(CARD_WIDTH_PX - MIN_VISIBLE_PX, Math.max(desired, minOverlapToFit));
}

function useViewportWidth(): number {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

function getFanTransform(index: number, total: number) {
  if (total <= 1) return { rotate: 0, y: 0 };
  const mid = (total - 1) / 2;
  const ratio = (index - mid) / mid;
  return { rotate: ratio * MAX_ROTATION_DEG, y: Math.abs(ratio) * ARC_HEIGHT_PX };
}

/** Cuánto "contagia" el hover a una carta según su distancia (en posiciones) a la carta bajo el cursor. */
function getHoverBoost(index: number, hoveredIndex: number | null): number {
  if (hoveredIndex === null) return 0;
  const distance = Math.abs(index - hoveredIndex);
  if (distance === 0) return 1;
  if (distance === 1) return 0.55;
  if (distance === 2) return 0.22;
  return 0;
}

/** En táctil no existe el hover del ratón: se simula leyendo qué carta hay bajo el dedo mientras se desliza. */
function getCardIndexAtPoint(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y);
  const cardEl = el instanceof Element ? el.closest('[data-card-index]') : null;
  if (!cardEl) return null;
  const value = cardEl.getAttribute('data-card-index');
  return value === null ? null : Number(value);
}

export function Hand({ cards, isMyTurn, canPass, onPlay, onPass }: HandProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const sorted = sortHand(cards);
  const selectedCards = sorted.filter((card) => selected.has(cardKey(card)));
  const viewportWidth = useViewportWidth();
  const overlap = getOverlap(sorted.length, viewportWidth);

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
    setHoveredIndex(null);
  };

  // Solo el arrastre (touchmove) activa la vista previa: si tambien reaccionara a touchstart, la carta
  // se desplazaria justo al posar el dedo y el gesto dejaria de reconocerse como un toque simple.
  const handleTouchMove = (e: TouchEvent) => {
    if (!isMyTurn) return;
    const touch = e.touches[0];
    if (!touch) return;
    const index = getCardIndexAtPoint(touch.clientX, touch.clientY);
    if (index !== null) setHoveredIndex(index);
  };

  const clearTouchHover = () => {
    if (!isMyTurn) return;
    setHoveredIndex(null);
  };

  return (
    <div className="hand">
      <div
        className={`hand-cards${revealed ? '' : ' collapsed'}`}
        onTouchMove={handleTouchMove}
        onTouchCancel={clearTouchHover}
      >
        {sorted.map((card, index) => {
          const key = cardKey(card);

          if (!revealed) {
            return (
              <Card
                key={key}
                card={card}
                faceDown
                style={{ marginLeft: index === 0 ? 0 : -COLLAPSED_OVERLAP_PX, zIndex: index, rotate: 0, y: 0 }}
              />
            );
          }

          const isSelected = selected.has(key);
          const { rotate, y } = getFanTransform(index, sorted.length);
          const boost = getHoverBoost(index, hoveredIndex);

          const marginLeft = index === 0 ? 0 : -(overlap * (1 - HOVER_SPREAD_RATIO * boost));
          const liftedY = y - HOVER_LIFT_PX * boost - (isSelected ? 16 : 0);
          const scale = 1 + HOVER_SCALE_BOOST * boost;
          const flattenedRotate = rotate * (1 - boost);
          const zIndex = boost > 0 ? Math.round(100 + boost * 50) : index;

          return (
            <Card
              key={key}
              card={card}
              selected={isSelected}
              dataIndex={index}
              onClick={isMyTurn ? () => toggle(card) : undefined}
              onHoverStart={isMyTurn ? () => setHoveredIndex(index) : undefined}
              onHoverEnd={
                isMyTurn ? () => setHoveredIndex((current) => (current === index ? null : current)) : undefined
              }
              style={{
                marginLeft,
                zIndex,
                rotate: flattenedRotate,
                y: liftedY,
                scale,
              }}
            />
          );
        })}
      </div>

      <div className="hand-actions">
        {revealed ? (
          <>
            {isMyTurn && (
              <>
                <button type="button" onClick={handlePlay} disabled={selectedCards.length === 0}>
                  Jugar{selectedCards.length > 0 ? ` (${selectedCards.length})` : ''}
                </button>
                <button type="button" className="secondary" onClick={onPass} disabled={!canPass}>
                  Pasar
                </button>
              </>
            )}
            <button type="button" className="secondary" onClick={() => setRevealed(false)}>
              Ocultar cartas
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setRevealed(true)}>
            Mostrar cartas
          </button>
        )}
      </div>
    </div>
  );
}
