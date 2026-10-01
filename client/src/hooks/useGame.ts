import { useCallback, useEffect } from 'react';
import { socket } from '../socket';
import { useGameStore, type Card, type ExchangeView, type GameView } from '../store/gameStore';

type ActionResponse = { error?: string };

export function useGame() {
  const { game, error, exchange, setGame, setError, setExchange, reset } = useGameStore();

  useEffect(() => {
    const handleGameState = (view: GameView) => setGame(view);
    socket.on('game:state', handleGameState);
    return () => {
      socket.off('game:state', handleGameState);
    };
  }, [setGame]);

  useEffect(() => {
    const handleExchange = (view: ExchangeView) => setExchange(view);
    socket.on('game:exchange', handleExchange);
    return () => {
      socket.off('game:exchange', handleExchange);
    };
  }, [setExchange]);

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

  const clearExchange = useCallback(() => setExchange(null), [setExchange]);

  return { game, error, exchange, playCards, pass, clearExchange, reset };
}
