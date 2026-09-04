import { Card } from './Card';
import { Hand } from './Hand';
import { PirateNarrator } from './PirateNarrator';
import type { Card as CardType, GameView, Role } from '../store/gameStore';
import type { PlayerView } from '../store/roomStore';

interface TableProps {
  game: GameView;
  players: PlayerView[];
  myPlayerId: string;
  isHost: boolean;
  error: string | null;
  closeRoom: () => void;
  canPass: boolean;
  onPlay: (cards: CardType[]) => void;
  onPass: () => void;
}

const ROLE_LABELS: Record<Exclude<Role, null>, string> = {
  presidente: 'Presidente',
  vicepresidente: 'Vicepresidente',
  viceculo: 'Viceculo',
  culo: 'Culo',
};

function playerName(players: PlayerView[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id;
}

export function Table({ game, players, myPlayerId, isHost, error, closeRoom, canPass, onPlay, onPass }: TableProps) {
  const handleCloseRoom = () => {
    if (window.confirm('¿Seguro que quieres finalizar la partida? Se cerrará la sala para todos los jugadores.')) {
      closeRoom();
    }
  };

  const closeButton = isHost ? (
    <button type="button" className="danger table-close" onClick={handleCloseRoom}>
      Finalizar partida
    </button>
  ) : null;

  if (game.phase === 'finished') {
    return (
      <section id="table">
        {closeButton}
        <h1>Partida terminada</h1>
        <ol className="ranking">
          {game.finishedOrder.map((id) => {
            const role = game.roles[id];
            return (
              <li key={id}>
                {playerName(players, id)}
                {role ? ` — ${ROLE_LABELS[role]}` : ''}
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  const isMyTurn = game.currentTurn === myPlayerId;

  return (
    <section id="table">
      {closeButton}

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
          <PirateNarrator errorCode={error} isMyTurn={isMyTurn} currentPlayerName={playerName(players, game.currentTurn)} />

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
