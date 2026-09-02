import { useEffect, useState } from 'react';
import { socket } from './socket';
import { Lobby } from './components/Lobby';
import { Table } from './components/Table';
import { Hand } from './components/Hand';
import { useRoom } from './hooks/useRoom';
import { useGame } from './hooks/useGame';
import './App.css';

function App() {
  const [connected, setConnected] = useState(socket.connected);
  const { room, session, error: roomError, createRoom, joinRoom, startRoom, leaveRoom } = useRoom();
  const { game, error: gameError, playCards, pass } = useGame();

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    // sincroniza el estado por si el socket ya se conectó antes de montar este efecto (StrictMode, o una conexión muy rápida)
    // oxlint-disable-next-line react/set-state-in-effect
    setConnected(socket.connected);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  if (!connected) {
    return (
      <section id="center">
        <p>Conectando con el servidor...</p>
      </section>
    );
  }

  if (!room || !session || room.state === 'lobby') {
    return (
      <Lobby
        room={room}
        session={session}
        error={roomError}
        createRoom={createRoom}
        joinRoom={joinRoom}
        startRoom={startRoom}
        leaveRoom={leaveRoom}
      />
    );
  }

  if (!game) {
    return (
      <section id="center">
        <p>Cargando partida...</p>
      </section>
    );
  }

  const isMyTurn = game.currentTurn === session.playerId;
  const canPass = isMyTurn && game.requiredCount !== null;

  return (
    <>
      <Table game={game} players={room.players} myPlayerId={session.playerId} error={gameError} />
      {game.phase === 'playing' && (
        <Hand cards={game.hand} isMyTurn={isMyTurn} canPass={canPass} onPlay={playCards} onPass={pass} />
      )}
    </>
  );
}

export default App;
