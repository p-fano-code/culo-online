import { useState } from 'react';
import type { RoomView, Session } from '../store/roomStore';
import logo from '../assets/logo.png';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_NAME: 'Introduce un nombre y, si te unes a una sala, un código válido.',
  ROOM_NOT_FOUND: 'No existe ninguna sala con ese código.',
  ROOM_ALREADY_STARTED: 'Esa partida ya ha empezado.',
  ROOM_FULL: 'La sala está completa.',
  NOT_HOST: 'Solo el anfitrión puede iniciar la partida.',
  NOT_ENOUGH_PLAYERS: 'Se necesitan al menos 2 jugadores para empezar.',
  INVALID_TOKEN: 'No se ha podido recuperar la sesión de esa sala.',
};

interface LobbyProps {
  room: RoomView | null;
  session: Session | null;
  error: string | null;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startRoom: () => void;
  leaveRoom: () => void;
  closeRoom: () => void;
}

export function Lobby({ room, session, error, createRoom, joinRoom, startRoom, leaveRoom, closeRoom }: LobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCloseRoom = () => {
    if (window.confirm('¿Seguro que quieres finalizar la partida? Se cerrará la sala para todos los jugadores.')) {
      closeRoom();
    }
  };

  if (!room || !session) {
    return (
      <section id="lobby">
        <img src={logo} alt="Culo Online" className="logo" />
        <p className="lobby-subtitle">El clásico juego de cartas español, ahora en tu navegador.</p>
        <div className="lobby-panel">
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
          <div className="lobby-divider">o unirme a una</div>
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
      <h1>Sala de espera</h1>
      <div className="room-code-badge">{room.code}</div>
      <p className="lobby-subtitle">Comparte este código con el resto de jugadores.</p>
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
        <p className="lobby-subtitle">Esperando a que el anfitrión empiece la partida...</p>
      )}
      <button type="button" className="secondary" onClick={leaveRoom}>
        Salir de la sala
      </button>
      {isHost && (
        <button type="button" className="danger" onClick={handleCloseRoom}>
          Finalizar partida
        </button>
      )}
      {error && <p className="lobby-error">{ERROR_MESSAGES[error] ?? error}</p>}
    </section>
  );
}
