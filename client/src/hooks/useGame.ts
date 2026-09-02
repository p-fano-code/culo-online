import { useCallback, useEffect } from 'react';
import { socket } from '../socket';
import { useGameStore, type Card, type GameView } from '../store/gameStore';

type ActionResponse = { error?: string };

export function useGame() {
  const { game, error, setGame, setError, reset } = useGameStore();

  useEffect(() => {
    const handleGameState = (view: GameView) => setGame(view);
    socket.on('game:state', handleGameState);
    return () => {
      socket.off('game:state', handleGameState);
    };
  }, [setGame]);

  useEffect(() => {
    socket.on('room:closed', reset);
    return () => {
      socket.off('room:closed', reset);
    };
  }, [reset]);

  const playCards = useCallback(
    (cards: Card[]) => {
      setError(null);
      socket.emit('game:play', { cards }, (response: ActionResponse) => {
        if (response?.error) setError(response.error);
      });
    },
    [setError],
  );

  const pass = useCallback(() => {
    setError(null);
    socket.emit('game:pass', {}, (response: ActionResponse) => {
      if (response?.error) setError(response.error);
    });
  }, [setError]);

  return { game, error, playCards, pass, reset };
}
