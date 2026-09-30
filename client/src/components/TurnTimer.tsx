import { useEffect, useState } from 'react';
import './TurnTimer.css';

interface TurnTimerProps {
  deadline: number | null;
  isMyTurn: boolean;
  currentPlayerName: string;
}

const TURN_SECONDS = 60;
const WARNING_SECONDS = 10;

/** Cuenta atrás del turno actual. Solo visual: el servidor es quien pasa el turno al llegar a 0. */
export function TurnTimer({ deadline, isMyTurn, currentPlayerName }: TurnTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline === null) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [deadline]);

  if (deadline === null) return null;

  // `now` puede ir hasta 250ms por detrás al llegar un plazo nuevo: sin el tope se vería "61s" un instante
  const remaining = Math.min(TURN_SECONDS, Math.max(0, Math.ceil((deadline - now) / 1000)));
  const progress = Math.min(1, remaining / TURN_SECONDS);
  const classes = ['turn-timer', isMyTurn ? 'mine' : '', remaining <= WARNING_SECONDS ? 'warning' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="timer" aria-live="off" aria-label={`Tiempo de turno: ${remaining} segundos`}>
      <span className="turn-timer-main">
        <svg className="turn-timer-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 2h4" />
          <path d="M12 14l3-3" />
          <circle cx="12" cy="14" r="8" />
        </svg>
        <span className="turn-timer-seconds">{remaining}s</span>
      </span>
      <span className="turn-timer-label">{isMyTurn ? 'Tu turno' : currentPlayerName}</span>
      <span className="turn-timer-bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
