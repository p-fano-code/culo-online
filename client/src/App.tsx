import { useEffect, useState } from 'react';
import { socket } from './socket';
import { Lobby } from './components/Lobby';
import { Table } from './components/Table';
import { RulesModal } from './components/RulesModal';
import { useRoom } from './hooks/useRoom';
import { useGame } from './hooks/useGame';
import './App.css';

function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [rulesOpen, setRulesOpen] = useState(false);
  const {
    room,
    session,
    error: roomError,
    announcement,
    createRoom,
    joinRoom,
    startRoom,
    leaveRoom,
    closeRoom,
  } = useRoom();
  const { game, error: gameError, exchange, playCards, pass, clearExchange } = useGame();

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

  let content: React.ReactNode;

  if (!connected) {
    content = (
      <section id="center">
        <p>Conectando con el servidor...</p>
      </section>
    );
  } else if (!room || !session || room.state === 'lobby') {
    content = (
      <Lobby
        room={room}
        session={session}
        error={roomError}
        createRoom={createRoom}
        joinRoom={joinRoom}
        startRoom={startRoom}
        leaveRoom={leaveRoom}
        closeRoom={closeRoom}
      />
    );
  } else if (!game) {
    content = (
      <section id="center">
        <p>Cargando partida...</p>
      </section>
    );
  } else {
    const canPass = game.currentTurn === session.playerId && game.requiredCount !== null;
    content = (
      <Table
        game={game}
        players={room.players}
        pendingSpectators={room.pendingSpectators}
        myPlayerId={session.playerId}
        isHost={room.hostId === session.playerId}
        error={gameError}
        roomError={roomError}
        announcement={announcement}
        exchange={exchange}
        onClearExchange={clearExchange}
        closeRoom={closeRoom}
        leaveRoom={leaveRoom}
        startRoom={startRoom}
        canPass={canPass}
        onPlay={playCards}
        onPass={pass}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        className="help-button"
        onClick={() => setRulesOpen(true)}
        aria-label="Reglas del juego"
      >
        ?
      </button>
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
      {content}
    </>
  );
}

export default App;
