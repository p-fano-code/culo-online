import { Hand } from './Hand';
import { PirateNarrator } from './PirateNarrator';
import { GameOverModal } from './GameOverModal';
import { SpectatorPanel } from './SpectatorPanel';
import { ExchangeModal } from './ExchangeModal';
import { TurnTimer } from './TurnTimer';
import { Pile } from './Pile';
import type { Card as CardType, ExchangeView, GameView } from '../store/gameStore';
import type { Announcement, PlayerView } from '../store/roomStore';

interface TableProps {
  game: GameView;
  players: PlayerView[];
  pendingSpectators: string[];
  myPlayerId: string;
  isHost: boolean;
  error: string | null;
  roomError: string | null;
  announcement: Announcement | null;
  exchange: ExchangeView | null;
  onClearExchange: () => void;
  closeRoom: () => void;
  leaveRoom: () => void;
  startRoom: () => void;
  canPass: boolean;
  onPlay: (cards: CardType[]) => void;
  onPass: () => void;
}

function playerName(players: PlayerView[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id;
}

export function Table({
  game,
  players,
  pendingSpectators,
  myPlayerId,
  isHost,
  error,
  roomError,
  announcement,
  exchange,
  onClearExchange,
  closeRoom,
  leaveRoom,
  startRoom,
  canPass,
  onPlay,
  onPass,
}: TableProps) {
  const handleCloseRoom = () => {
    if (window.confirm('¿Seguro que quieres finalizar la partida? Se cerrará la sala para todos los jugadores.')) {
      closeRoom();
    }
  };

  const exchangeModal = exchange ? <ExchangeModal exchange={exchange} onDone={onClearExchange} /> : null;

  if (game.phase === 'finished') {
    return (
      <section id="table">
        {exchangeModal}
        <GameOverModal
          finishedOrder={game.finishedOrder}
          roles={game.roles}
          players={players}
          myPlayerId={myPlayerId}
          isHost={isHost}
          nextRoundDeadline={game.nextRoundDeadline}
          roomError={roomError}
          onLeaveRoom={leaveRoom}
          onCloseRoom={handleCloseRoom}
          onStartNextRound={startRoom}
        />
      </section>
    );
  }

  const isMyTurn = game.currentTurn === myPlayerId;
  const isSpectator = !game.seatOrder.includes(myPlayerId);

  return (
    <section id="table">
      {exchangeModal}

      <TurnTimer
        deadline={game.turnDeadline}
        isMyTurn={isMyTurn}
        currentPlayerName={playerName(players, game.currentTurn)}
      />

      {isHost && (
        <button type="button" className="danger table-close" onClick={handleCloseRoom}>
          Finalizar partida
        </button>
      )}

      <div className="opponents">
        {game.handCounts
          .filter((h) => h.playerId !== myPlayerId)
          .map((h) => {
            const player = players.find((p) => p.id === h.playerId);
            const classes = [
              'opponent',
              game.currentTurn === h.playerId ? 'current' : '',
              player && !player.connected ? 'opponent-disconnected' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div key={h.playerId} className={classes}>
                <span>{playerName(players, h.playerId)}</span>
                <span>{player && !player.connected ? 'desconectado' : `${h.count} cartas`}</span>
              </div>
            );
          })}
      </div>

      <div className="game-surface">
        <div className="table-main">
          <PirateNarrator
            errorCode={error}
            isMyTurn={isMyTurn}
            currentPlayerName={playerName(players, game.currentTurn)}
            skippedPlayerId={game.lastSkip?.skippedPlayerId ?? null}
            burn={game.lastBurn}
            seq={game.seq}
            myPlayerId={myPlayerId}
            announcement={announcement}
          />

          <Pile lastPlay={game.lastPlay} lastBurn={game.lastBurn} seq={game.seq} players={players} />
        </div>

        {isSpectator ? (
          <SpectatorPanel pendingSpectators={pendingSpectators} myPlayerId={myPlayerId} />
        ) : (
          <Hand cards={game.hand} isMyTurn={isMyTurn} canPass={canPass} onPlay={onPlay} onPass={onPass} />
        )}
      </div>
    </section>
  );
}
