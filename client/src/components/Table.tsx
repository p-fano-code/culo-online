import { Card } from './Card';
import { Hand } from './Hand';
import { PirateNarrator } from './PirateNarrator';
import { GameOverModal } from './GameOverModal';
import type { Card as CardType, GameView } from '../store/gameStore';
import type { PlayerView } from '../store/roomStore';

interface TableProps {
  game: GameView;
  players: PlayerView[];
  myPlayerId: string;
  isHost: boolean;
  error: string | null;
  closeRoom: () => void;
  leaveRoom: () => void;
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
  myPlayerId,
  isHost,
  error,
  closeRoom,
  leaveRoom,
  canPass,
  onPlay,
  onPass,
}: TableProps) {
  const handleCloseRoom = () => {
    if (window.confirm('¿Seguro que quieres finalizar la partida? Se cerrará la sala para todos los jugadores.')) {
      closeRoom();
    }
  };

  if (game.phase === 'finished') {
    return (
      <section id="table">
        <GameOverModal
          finishedOrder={game.finishedOrder}
          roles={game.roles}
          players={players}
          myPlayerId={myPlayerId}
          isHost={isHost}
          onLeaveRoom={leaveRoom}
          onCloseRoom={handleCloseRoom}
        />
      </section>
    );
  }

  const isMyTurn = game.currentTurn === myPlayerId;

  return (
    <section id="table">
      {isHost && (
        <button type="button" className="danger table-close" onClick={handleCloseRoom}>
          Finalizar partida
        </button>
      )}

      <div className="opponents">
        {game.handCounts
          .filter((h) => h.playerId !== myPlayerId)
          .map((h) => (
            <div key={h.playerId} className={`opponent${game.currentTurn === h.playerId ? ' current' : ''}`}>
              <span>{playerName(players, h.playerId)}</span>
              <span>{h.count} cartas</span>
            </div>
          ))}
      </div>

      <div className="game-surface">
        <div className="table-main">
          <PirateNarrator
            errorCode={error}
            isMyTurn={isMyTurn}
            currentPlayerName={playerName(players, game.currentTurn)}
            skippedPlayerId={game.lastSkip?.skippedPlayerId ?? null}
            myPlayerId={myPlayerId}
          />

          <div className="pile">
            {game.lastPlay ? (
              <>
                <p>{playerName(players, game.lastPlay.playerId)} jugó:</p>
                <div className="pile-cards">
                  {game.lastPlay.cards.map((card) => (
                    <Card key={`${card.suit}-${card.rank}`} card={card} />
                  ))}
                </div>
              </>
            ) : (
              <p className="pile-placeholder">Mesa libre</p>
            )}
          </div>
        </div>

        <Hand cards={game.hand} isMyTurn={isMyTurn} canPass={canPass} onPlay={onPlay} onPass={onPass} />
      </div>
    </section>
  );
}
