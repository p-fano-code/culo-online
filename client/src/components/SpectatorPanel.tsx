import './SpectatorPanel.css';

interface SpectatorPanelProps {
  pendingSpectators: string[];
  myPlayerId: string;
}

function getProjection(pendingSpectators: string[], myPlayerId: string): string {
  const index = pendingSpectators.indexOf(myPlayerId);
  if (index === -1) return 'Podrás jugar en la próxima ronda.';

  const total = pendingSpectators.length;
  if (index === total - 1) return 'En la próxima ronda entrarás... como Culo.';
  if (index === total - 2) return 'En la próxima ronda entrarás... como Viceculo.';
  return 'En la próxima ronda entrarás de forma neutral.';
}

export function SpectatorPanel({ pendingSpectators, myPlayerId }: SpectatorPanelProps) {
  return (
    <div className="spectator-panel">
      <h2>Estás en modo espectador</h2>
      <p>Te has unido a mitad de partida. Podrás jugar en cuanto termine esta ronda.</p>
      <p className="spectator-projection">{getProjection(pendingSpectators, myPlayerId)}</p>
    </div>
  );
}
