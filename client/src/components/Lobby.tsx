import { useState } from 'react';
import { useRoom } from '../hooks/useRoom';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_NAME: 'Introduce un nombre y, si te unes a una sala, un código válido.',
  ROOM_NOT_FOUND: 'No existe ninguna sala con ese código.',
  ROOM_ALREADY_STARTED: 'Esa partida ya ha empezado.',
  ROOM_FULL: 'La sala está completa.',
  NOT_HOST: 'Solo el anfitrión puede iniciar la partida.',
  NOT_ENOUGH_PLAYERS: 'Se necesitan al menos 2 jugadores para empezar.',
  INVALID_TOKEN: 'No se ha podido recuperar la sesión de esa sala.',
};

export function Lobby() {
  const { room, session, error, createRoom, joinRoom, startRoom, leaveRoom } = useRoom();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  if (!room || !session) {
    return (
      <section id="lobby">
        <h1>Culo Online</h1>
        <div className="lobby-form">
          <input
            type="text"
            placeholder="Tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />
          <button type="button" onClick={() => createRoom(playerName)} disabled={!playerName.trim()}>
            Crear sala
          </button>
          <div className="lobby-join">
            <input
              type="text"
              placeholder="Código de sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => joinRoom(roomCode, playerName)}
              disabled={!playerName.trim() || !roomCode.trim()}
            >
              Unirse
            </button>
          </div>
        </div>
        {error && <p className="lobby-error">{ERROR_MESSAGES[error] ?? error}</p>}
      </section>
    );
  }

  const isHost = room.hostId === session.playerId;

  return (
    <section id="lobby">
      <h1>Sala {room.code}</h1>
      <p>Comparte este código con el resto de jugadores.</p>
      <ul className="player-list">
        {room.players.map((player) => (
          <li key={player.id}>
            {player.name}
            {player.isHost ? ' (anfitrión)' : ''}
            {!player.connected ? ' — desconectado' : ''}
          </li>
        ))}
      </ul>
      {isHost ? (
        <button type="button" onClick={startRoom} disabled={room.players.length < 2}>
          Empezar partida
        </button>
      ) : (
        <p>Esperando a que el anfitrión empiece la partida...</p>
      )}
      <button type="button" onClick={leaveRoom}>
        Salir de la sala
      </button>
      {error && <p className="lobby-error">{ERROR_MESSAGES[error] ?? error}</p>}
    </section>
  );
}
