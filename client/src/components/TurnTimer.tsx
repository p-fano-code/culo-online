import { useEffect, useRef, useState } from 'react';
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
  // En pantallas estrechas el temporizador arranca encogido (ver mobile.css) para no tapar los nombres
  // de los jugadores; tocarlo lo expande y tocar fuera lo vuelve a encoger. En pantallas anchas esta
  // clase no tiene efecto visual (el CSS compacto solo existe dentro del media query móvil).
  const [expanded, setExpanded] = useState(false);
  const [prevDeadline, setPrevDeadline] = useState(deadline);
  const rootRef = useRef<HTMLDivElement>(null);

  if (deadline !== prevDeadline) {
    setPrevDeadline(deadline);
    setExpanded(false);
  }

  useEffect(() => {
    if (deadline === null) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [deadline]);

  useEffect(() => {
    if (!expanded) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded]);

  if (deadline === null) return null;

  // `now` puede ir hasta 250ms por detrás al llegar un plazo nuevo: sin el tope se vería "61s" un instante
  const remaining = Math.min(TURN_SECONDS, Math.max(0, Math.ceil((deadline - now) / 1000)));
  const progress = Math.min(1, remaining / TURN_SECONDS);
  const classes = [
    'turn-timer',
    isMyTurn ? 'mine' : '',
    remaining <= WARNING_SECONDS ? 'warning' : '',
    expanded ? 'expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={rootRef}
      className={classes}
      role="timer"
      aria-live="off"
      aria-label={`Tiempo de turno: ${remaining} segundos`}
      onClick={() => setExpanded(true)}
    >
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
