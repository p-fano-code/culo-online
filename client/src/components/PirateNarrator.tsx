import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import pirateError from '../assets/pirata/pirata_2.png';
import pirateHappy from '../assets/pirata/pirata_rie.png';
import pirateWait from '../assets/pirata/pirata_3.png';
import type { Announcement } from '../store/roomStore';
import './PirateNarrator.css';

interface PirateNarratorProps {
  errorCode: string | null;
  isMyTurn: boolean;
  currentPlayerName: string;
  skippedPlayerId: string | null;
  burn: { burnedBy: string; reason: 'wild' | 'allPassed'; passedBy?: string } | null;
  /** nombre del último jugador que pasó cuando la mesa se quema porque todos pasan */
  burnPasserName: string | null;
  /** quien pasó en la última acción, si no provocó quema (la ronda de mesa sigue) */
  passedPlayerId: string | null;
  passedPlayerName: string | null;
  seq: number;
  myPlayerId: string;
  announcement: Announcement | null;
}

const ERROR_DISPLAY_MS = 3500;
const SKIP_DISPLAY_MS = 3000;
const BURN_DISPLAY_MS = 3000;
const PASS_DISPLAY_MS = 3000;
const ANNOUNCEMENT_DISPLAY_MS = 4000;

const ERROR_PHRASES: Record<string, string> = {
  NOT_YOUR_TURN: '¡Espera tu turno, grumete!',
  INVALID_CARD_COUNT: '¡Ni una carta de más ni de menos!',
  CARDS_NOT_IN_HAND: '¡Esas cartas no las tienes, tunante!',
  CARDS_MUST_MATCH_RANK: '¡Todas las cartas deben ser del mismo valor!',
  MUST_MATCH_PLAY_COUNT: '¡Tienes que igualar el número de cartas!',
  CARD_TOO_LOW: '¡Tu carta es más baja!',
  CANNOT_PASS_ON_FREE_PLAY: '¡No puedes pasar, te toca abrir tú!',
  GAME_FINISHED: '¡La partida ya se acabó!',
  GAME_NOT_STARTED: '¡La partida aún no ha empezado!',
  ROOM_NOT_FOUND: '¡Esa sala ya no existe!',
};

function toPirateSpeech(code: string): string {
  return ERROR_PHRASES[code] ?? '¡Eso no se puede hacer!';
}

export function PirateNarrator({
  errorCode,
  isMyTurn,
  currentPlayerName,
  skippedPlayerId,
  burn,
  burnPasserName,
  passedPlayerId,
  passedPlayerName,
  seq,
  myPlayerId,
  announcement,
}: PirateNarratorProps) {
  const [prevCode, setPrevCode] = useState<string | null>(null);
  const [errorExpired, setErrorExpired] = useState(false);

  if (errorCode !== prevCode) {
    setPrevCode(errorCode);
    if (errorCode) setErrorExpired(false);
  }

  useEffect(() => {
    if (!errorCode || errorExpired) return;
    const timeout = setTimeout(() => setErrorExpired(true), ERROR_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [errorCode, errorExpired]);

  // `seq` se incrementa en cada jugada/pase, incluso cuando el salto o la quema repiten al mismo
  // jugador dos veces seguidas (en cuyo caso `skippedPlayerId`/`burn.burnedBy` no cambian de valor
  // por sí solos). Usar `seq` como referencia asegura que cada suceso nuevo reinicie su temporizador.
  const [prevSeq, setPrevSeq] = useState<number | null>(null);
  const [skipExpired, setSkipExpired] = useState(false);
  const [burnExpired, setBurnExpired] = useState(false);
  const [passExpired, setPassExpired] = useState(false);

  if (seq !== prevSeq) {
    setPrevSeq(seq);
    if (skippedPlayerId) setSkipExpired(false);
    if (burn) setBurnExpired(false);
    if (passedPlayerId) setPassExpired(false);
  }

  useEffect(() => {
    if (!skippedPlayerId || skipExpired) return;
    const timeout = setTimeout(() => setSkipExpired(true), SKIP_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [seq, skippedPlayerId, skipExpired]);

  useEffect(() => {
    if (!burn || burnExpired) return;
    const timeout = setTimeout(() => setBurnExpired(true), BURN_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [seq, burn, burnExpired]);

  useEffect(() => {
    if (!passedPlayerId || passExpired) return;
    const timeout = setTimeout(() => setPassExpired(true), PASS_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [seq, passedPlayerId, passExpired]);

  const [prevAnnouncementTs, setPrevAnnouncementTs] = useState<number | null>(null);
  const [announcementExpired, setAnnouncementExpired] = useState(false);
  const announcementTs = announcement?.timestamp ?? null;

  if (announcementTs !== prevAnnouncementTs) {
    setPrevAnnouncementTs(announcementTs);
    if (announcementTs !== null) setAnnouncementExpired(false);
  }

  useEffect(() => {
    if (announcementTs === null || announcementExpired) return;
    const timeout = setTimeout(() => setAnnouncementExpired(true), ANNOUNCEMENT_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [announcementTs, announcementExpired]);

  const showingError = Boolean(errorCode) && !errorExpired;
  const showingSkip = !showingError && skippedPlayerId !== null && !skipExpired;
  const showingBurn = !showingError && !showingSkip && burn !== null && !burnExpired;
  const showingPass = !showingError && !showingSkip && !showingBurn && passedPlayerId !== null && !passExpired;
  const showingAnnouncement =
    !showingError && !showingSkip && !showingBurn && !showingPass && Boolean(announcement) && !announcementExpired;
  const wasSkippedMe = skippedPlayerId === myPlayerId;
  const wasBurnedByMe = burn?.burnedBy === myPlayerId;
  const allPassedBurn = burn?.reason === 'allPassed';
  const passedByMe = burn?.passedBy === myPlayerId;
  const iPassed = passedPlayerId === myPlayerId;

  const image = showingError
    ? pirateError
    : showingSkip
      ? wasSkippedMe
        ? pirateError
        : pirateHappy
      : showingBurn
        ? wasBurnedByMe
          ? pirateHappy
          : pirateWait
        : showingPass
          ? isMyTurn
            ? pirateHappy
            : pirateWait
          : showingAnnouncement
            ? announcement!.type === 'joined'
              ? pirateHappy
              : pirateWait
            : isMyTurn
              ? pirateHappy
              : pirateWait;

  const message = showingError
    ? toPirateSpeech(errorCode as string)
    : showingSkip
      ? wasSkippedMe
        ? '¡Te han saltado!'
        : '¡SALTO!'
      : showingBurn
        ? allPassedBurn
          ? passedByMe
            ? 'Pasas. ¡Pasamos a la siguiente ronda!'
            : `${burnPasserName ?? 'El último jugador'} pasa. ¡Pasamos a la siguiente ronda!`
          : wasBurnedByMe
            ? '¡Has sacado un 2 y quemas la mesa! Sigues tú.'
            : `¡${currentPlayerName} ha sacado un 2 y quema la mesa!`
        : showingPass
          ? iPassed
            ? `Pasas. Es el turno de ${currentPlayerName}.`
            : isMyTurn
              ? `${passedPlayerName ?? 'El jugador anterior'} pasa. ¡Es tu turno!`
              : `${passedPlayerName ?? 'El jugador anterior'} pasa. Es el turno de ${currentPlayerName}.`
          : showingAnnouncement
            ? announcement!.type === 'joined'
              ? `¡${announcement!.playerName} se ha unido a la partida!`
              : `${announcement!.playerName} ha abandonado la partida.`
            : isMyTurn
              ? '¡Es tu turno, adelante!'
              : `Es el turno de ${currentPlayerName}...`;

  const bubbleModifier = showingError
    ? ' pirate-bubble-error'
    : showingSkip
      ? ' pirate-bubble-skip'
      : showingBurn
        ? ' pirate-bubble-burn'
        : showingPass
          ? isMyTurn
            ? ' pirate-bubble-myturn'
            : ' pirate-bubble-turn'
          : showingAnnouncement
            ? ''
            : isMyTurn
              ? ' pirate-bubble-myturn'
              : ' pirate-bubble-turn';

  // Aviso de turno por defecto (sin error/salto/quema/anuncio): el nombre del jugador va resaltado.
  const showingTurn = !showingError && !showingSkip && !showingBurn && !showingPass && !showingAnnouncement;
  const content = !showingTurn ? (
    message
  ) : isMyTurn ? (
    <>
      ¡Es <span className="pirate-bubble-myturn-text">tu turno</span>, adelante!
    </>
  ) : (
    <>
      Es el turno de <span className="pirate-bubble-name">{currentPlayerName}</span>
    </>
  );

  // Cuando se muestra un salto o una quema, la clave incluye `seq` para forzar el reinicio de la
  // animación aunque el texto sea idéntico al del suceso anterior (p. ej. dos saltos seguidos al
  // mismo jugador): sin esto, AnimatePresence no detecta cambio y el aviso parece no producirse.
  const messageKey = showingSkip || showingBurn || showingPass ? `${message}-${seq}` : message;

  return (
    <div className="pirate-narrator">
      <AnimatePresence mode="wait">
        <motion.img
          key={image}
          src={image}
          alt=""
          className="pirate-avatar"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          // salida instantánea: con mode="wait" una salida animada deja ver el aviso anterior un instante
          exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={messageKey}
          className={`pirate-bubble${bubbleModifier}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={{ duration: 0.25 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
