import type { Card } from '../store/gameStore';
import orosAs from '../assets/cartas/1oros.png';

// Prueba: solo el 1 de oros tiene imagen real por ahora. El resto sigue usando el diseño con icono de palo.
const CARD_IMAGES: Record<string, string> = {
  'oros-1': orosAs,
};

export function getCardImage(card: Card): string | undefined {
  return CARD_IMAGES[`${card.suit}-${card.rank}`];
}
