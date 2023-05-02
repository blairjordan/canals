import { useAppContext } from '@/context';

function PlayerInfo() {
  const [state] = useAppContext();

  if (!(state.player && state.player.id)) {
    return null;
  }

  const fuel = Math.round(state.player.fuel);
  const formattedBalance = Math.floor(state.player.balance).toLocaleString();

  return (
    <div
      className="fixed bottom-0 right-0 p-4 text-white text-sm bg-gray-900 rounded-tl-lg shadow-md z-40 opacity-70"
      style={{ userSelect: 'none' }}
    >
      <p>⛽ {fuel}%</p>
      <p>🪙 {formattedBalance}</p>
    </div>
  );
}

export default PlayerInfo;
