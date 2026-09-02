import { useEffect, useState } from 'react';
import { socket } from './socket';
import { Lobby } from './components/Lobby';
import './App.css';

function App() {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

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

  return <Lobby />;
}

export default App;
