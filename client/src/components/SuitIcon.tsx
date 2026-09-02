import type { Suit } from '../store/gameStore';

interface SuitIconProps {
  suit: Suit;
}

export function SuitIcon({ suit }: SuitIconProps) {
  switch (suit) {
    case 'oros':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4.5" />
        </svg>
      );
    case 'copas':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 3h14l-1.6 9.2a5.4 5.4 0 0 1-10.8 0L5 3z" />
          <rect x="11" y="15.5" width="2" height="4" />
          <rect x="7.5" y="19.5" width="9" height="1.6" rx="0.8" />
        </svg>
      );
    case 'espadas':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1 L14.2 14.5 L9.8 14.5 Z" />
          <rect x="7.5" y="13.8" width="9" height="2" rx="1" />
          <rect x="11" y="15.8" width="2" height="6" rx="1" />
          <circle cx="12" cy="22.2" r="1.3" />
        </svg>
      );
    case 'bastos':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.5c1.7 0 3 1.3 3 3 0 .9-.4 1.7-1 2.3 1.9.7 2.8 2.9 1.6 4.6-.5.7-1.4 1.1-2.1 1.1h-3c-.7 0-1.6-.4-2.1-1.1-1.2-1.7-.3-3.9 1.6-4.6-.6-.6-1-1.4-1-2.3 0-1.7 1.3-3 3-3z" />
          <rect x="10.6" y="12" width="2.8" height="10" rx="1.2" />
        </svg>
      );
    default:
      return null;
  }
}
